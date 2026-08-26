import express, { type Express } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import authRoutes from './routes/authRoutes.js';
import domainRoutes from './routes/domainRoutes.js';
import integrationRoutes from './routes/integrationRoutes.js';

const app: Express = express();

app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') ?? true, credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/v1/health', (_req, res) => {
  res.json({ status: 'ok', service: 'auth-service' });
});

app.use('/api/v1/auth', authRoutes);
// Mounted under /api/v1/auth (rather than a bare /api/v1/domains) so the
// builder's nginx config — which only proxies /api/v1/auth/* to this
// service, everything else under /api/ going to api-service — reaches it
// without needing its own extra proxy rule.
app.use('/api/v1/auth/domains', domainRoutes);
// Same nginx-proxy constraint as domainRoutes above.
app.use('/api/v1/auth/integrations', integrationRoutes);

export default app;
