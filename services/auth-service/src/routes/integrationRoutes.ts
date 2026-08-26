import { Router, type Router as RouterType } from 'express';
import {
  authorizeInfo,
  authorize,
  token,
  listConnections,
  deleteConnection,
  registerWebhook,
  verifyIntegrationToken,
  getConnectionByStoreId,
} from '../controllers/integrationController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router: RouterType = Router();

router.get('/authorize-info', requireAuth, authorizeInfo);
router.post('/authorize', requireAuth, authorize);
router.get('/connections', requireAuth, listConnections);
router.delete('/connections/:id', requireAuth, deleteConnection);

// Server-to-server — no cookie, gated by the shared X-Integration-Secret header.
router.post('/token', token);
router.post('/webhooks', registerWebhook);

// Internal, unauthenticated — called by api-service, same trust model as
// domainRoutes.ts's /resolve.
router.get('/internal/verify', verifyIntegrationToken);
router.get('/internal/connections/:storeId', getConnectionByStoreId);

export default router;
