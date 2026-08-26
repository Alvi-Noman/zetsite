import express, { type Express } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import morgan from 'morgan';
import dashboardRoutes from './routes/dashboardRoutes.js';
import productRoutes from './routes/productRoutes.js';
import collectionRoutes from './routes/collectionRoutes.js';
import uploadRoutes, { UPLOAD_DIR } from './routes/uploadRoutes.js';
import pageRoutes from './routes/pageRoutes.js';
import landingPageRoutes from './routes/landingPageRoutes.js';
import themeRoutes from './routes/themeRoutes.js';
import storefrontRoutes from './routes/storefrontRoutes.js';
import globalSectionRoutes from './routes/globalSectionRoutes.js';
import formRoutes from './routes/formRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import checkoutSettingsRoutes from './routes/checkoutSettingsRoutes.js';
import shippingSettingsRoutes from './routes/shippingSettingsRoutes.js';
import abandonedCheckoutRoutes from './routes/abandonedCheckoutRoutes.js';
import pixelSettingsRoutes from './routes/pixelSettingsRoutes.js';
import integrationRoutes from './routes/integrationRoutes.js';

const app: Express = express();

app.use(compression());
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') ?? true, credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/v1/health', (_req, res) => {
  res.json({ status: 'ok', service: 'api-service' });
});

app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/collections', collectionRoutes);
app.use('/api/v1/uploads', uploadRoutes);
app.use('/api/v1/pages', pageRoutes);
app.use('/api/v1/landing-pages', landingPageRoutes);
app.use('/api/v1/themes', themeRoutes);
app.use('/api/v1/storefront', storefrontRoutes);
app.use('/api/v1/global-sections', globalSectionRoutes);
app.use('/api/v1/form-submissions', formRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/checkout-settings', checkoutSettingsRoutes);
app.use('/api/v1/shipping-settings', shippingSettingsRoutes);
app.use('/api/v1/abandoned-checkouts', abandonedCheckoutRoutes);
app.use('/api/v1/pixel-settings', pixelSettingsRoutes);
app.use('/api/v1/integrations', integrationRoutes);
app.use(
  '/api/uploads',
  express.static(UPLOAD_DIR, {
    maxAge: '1y',
    immutable: true,
    // The bundled mime-db doesn't know .avif; without this it's served as
    // application/octet-stream, which some browsers won't decode as an image.
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.avif')) {
        res.setHeader('Content-Type', 'image/avif');
      }
    },
  }),
);

export default app;
