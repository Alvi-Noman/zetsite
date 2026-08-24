import { Router, type Router as RouterType } from 'express';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import rateLimit from 'express-rate-limit';
import sharp from 'sharp';
import { fileTypeFromBuffer } from 'file-type';
import { requireAuth, type AuthenticatedRequest } from '../middleware/authMiddleware.js';

const router: RouterType = Router();

export const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_IMAGE_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']);
const ALLOWED_VIDEO_MIME = new Set(['video/mp4', 'video/webm', 'video/quicktime']);
const ALLOWED_MODEL_EXT = new Set(['glb', 'gltf']);

const IMAGE_WIDTHS = {
  thumbnail: 200,
  medium: 800,
  large: 1600,
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
});

function sha256(buffer: Buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

async function writeIfMissing(filename: string, buffer: Buffer): Promise<string> {
  const filePath = path.join(UPLOAD_DIR, filename);
  if (!fs.existsSync(filePath)) {
    await fs.promises.writeFile(filePath, buffer);
  }
  return `/api/uploads/${filename}`;
}

interface ImageVariants {
  thumbnail: string;
  medium: string;
  large: string;
  original: string;
  placeholder: string;
  avif: {
    thumbnail: string;
    medium: string;
    large: string;
  };
}

// Re-encodes to WebP (fallback) and AVIF (preferred, ~20-30% smaller) at
// three widths, plus a full-size WebP "original" and a tiny base64 blur
// placeholder (LQIP). Content-addressed by hash so identical uploads dedupe
// and URLs are safe to cache forever.
async function processImage(buffer: Buffer): Promise<ImageVariants> {
  const hash = sha256(buffer);
  const normalized = sharp(buffer).rotate();

  const [
    thumbnailBuf,
    mediumBuf,
    largeBuf,
    originalBuf,
    placeholderBuf,
    thumbnailAvifBuf,
    mediumAvifBuf,
    largeAvifBuf,
  ] = await Promise.all([
    normalized.clone().resize({ width: IMAGE_WIDTHS.thumbnail, withoutEnlargement: true }).webp({ quality: 70 }).toBuffer(),
    normalized.clone().resize({ width: IMAGE_WIDTHS.medium, withoutEnlargement: true }).webp({ quality: 78 }).toBuffer(),
    normalized.clone().resize({ width: IMAGE_WIDTHS.large, withoutEnlargement: true }).webp({ quality: 82 }).toBuffer(),
    normalized.clone().webp({ quality: 88 }).toBuffer(),
    normalized.clone().resize({ width: 24 }).webp({ quality: 20 }).toBuffer(),
    normalized.clone().resize({ width: IMAGE_WIDTHS.thumbnail, withoutEnlargement: true }).avif({ quality: 50 }).toBuffer(),
    normalized.clone().resize({ width: IMAGE_WIDTHS.medium, withoutEnlargement: true }).avif({ quality: 55 }).toBuffer(),
    normalized.clone().resize({ width: IMAGE_WIDTHS.large, withoutEnlargement: true }).avif({ quality: 60 }).toBuffer(),
  ]);

  const [thumbnail, medium, large, original, avifThumbnail, avifMedium, avifLarge] = await Promise.all([
    writeIfMissing(`${hash}-thumb.webp`, thumbnailBuf),
    writeIfMissing(`${hash}-md.webp`, mediumBuf),
    writeIfMissing(`${hash}-lg.webp`, largeBuf),
    writeIfMissing(`${hash}-orig.webp`, originalBuf),
    writeIfMissing(`${hash}-thumb.avif`, thumbnailAvifBuf),
    writeIfMissing(`${hash}-md.avif`, mediumAvifBuf),
    writeIfMissing(`${hash}-lg.avif`, largeAvifBuf),
  ]);

  return {
    thumbnail,
    medium,
    large,
    original,
    placeholder: `data:image/webp;base64,${placeholderBuf.toString('base64')}`,
    avif: { thumbnail: avifThumbnail, medium: avifMedium, large: avifLarge },
  };
}

router.post('/', requireAuth, uploadLimiter, (req: AuthenticatedRequest, res) => {
  upload.single('file')(req, res, async (err) => {
    if (err) {
      res.status(400).json({ success: false, message: err.message });
      return;
    }
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded' });
      return;
    }

    try {
      // Sniff real bytes rather than trusting the client-supplied Content-Type.
      const detected = await fileTypeFromBuffer(req.file.buffer);
      const mime = detected?.mime ?? req.file.mimetype;
      const originalExt = path.extname(req.file.originalname).slice(1).toLowerCase();

      if (ALLOWED_IMAGE_MIME.has(mime)) {
        let variants: ImageVariants;
        try {
          variants = await processImage(req.file.buffer);
        } catch {
          // sharp rejects anything it can't actually decode, regardless of
          // what the client claimed the content-type was — this is the real
          // validation gate, not just the MIME sniff above.
          res.status(400).json({ success: false, message: 'Invalid or corrupted image file' });
          return;
        }
        res.status(201).json({
          success: true,
          file: {
            url: variants.medium,
            type: 'image',
            name: req.file.originalname,
            variants,
          },
        });
        return;
      }

      if (ALLOWED_VIDEO_MIME.has(mime)) {
        const hash = sha256(req.file.buffer);
        const ext = detected?.ext ?? 'mp4';
        const url = await writeIfMissing(`${hash}.${ext}`, req.file.buffer);
        res.status(201).json({
          success: true,
          file: { url, type: 'video', name: req.file.originalname },
        });
        return;
      }

      if (ALLOWED_MODEL_EXT.has(originalExt)) {
        const hash = sha256(req.file.buffer);
        const url = await writeIfMissing(`${hash}.${originalExt}`, req.file.buffer);
        res.status(201).json({
          success: true,
          file: { url, type: '3d', name: req.file.originalname },
        });
        return;
      }

      res.status(400).json({ success: false, message: 'Unsupported file type' });
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  });
});

export default router;
