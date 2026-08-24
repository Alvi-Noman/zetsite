import { useRef, useState, type DragEvent } from 'react';
import { UploadCloud, X, FileVideo, Box } from 'lucide-react';
import { api } from '@/lib/api';
import ResponsiveImage, { type ImageVariants } from '@/components/ui/ResponsiveImage';

export interface MediaFile {
  url: string;
  type: string;
  name: string;
  variants?: ImageVariants;
}

interface MediaDropzoneProps {
  value: MediaFile[];
  onChange: (files: MediaFile[]) => void;
}

export default function MediaDropzone({ value, onChange }: MediaDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function uploadFiles(files: FileList | File[]) {
    setError(null);
    setUploading(true);
    try {
      const uploaded: MediaFile[] = [];
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);
        const res = await api.post('/uploads', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        uploaded.push(res.data.file);
      }
      onChange([...value, ...uploaded]);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files?.length) {
      uploadFiles(e.dataTransfer.files);
    }
  }

  function removeAt(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed px-6 py-8 text-center transition-colors ${
          dragging ? 'border-link bg-link-subtle' : 'border-border hover:bg-surface-hover'
        }`}
      >
        <UploadCloud size={22} className="mb-2 text-ink-tertiary" />
        <p className="text-sm font-medium text-ink">
          {uploading ? 'Uploading...' : 'Drop media to upload'}
        </p>
        <p className="mt-1 text-xs text-ink-tertiary">Accepts images, videos, or 3D models</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,video/*,model/*"
          className="hidden"
          onChange={(e) => e.target.files && uploadFiles(e.target.files)}
        />
      </div>

      {error && <p className="mt-2 text-sm text-danger">{error}</p>}

      {value.length > 0 && (
        <div className="mt-3 grid grid-cols-4 gap-3">
          {value.map((file, index) => (
            <div
              key={file.url}
              className="group relative aspect-square overflow-hidden rounded-md border border-border bg-surface-secondary"
            >
              {file.type === 'image' ? (
                <ResponsiveImage
                  variants={file.variants}
                  fallbackSrc={file.url}
                  alt={file.name}
                  sizes="120px"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-ink-tertiary">
                  {file.type === 'video' ? <FileVideo size={20} /> : <Box size={20} />}
                  <span className="px-1 text-center text-[10px] leading-tight">{file.name}</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => removeAt(index)}
                aria-label="Remove file"
                className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
