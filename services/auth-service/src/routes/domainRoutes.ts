import { Router, type Router as RouterType } from 'express';
import { listDomains, addDomain, verifyDomain, deleteDomain, resolveDomain } from '../controllers/domainController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router: RouterType = Router();

router.get('/', requireAuth, listDomains);
router.post('/', requireAuth, addDomain);
router.post('/:id/verify', requireAuth, verifyDomain);
router.delete('/:id', requireAuth, deleteDomain);

// Internal, unauthenticated — called by api-service and the storefront app.
router.get('/resolve', resolveDomain);

export default router;
