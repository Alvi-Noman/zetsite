import { Router, type Router as RouterType } from 'express';
import { requireAuth, type AuthenticatedRequest } from '../middleware/authMiddleware.js';

const router: RouterType = Router();

router.get('/summary', requireAuth, (req: AuthenticatedRequest, res) => {
  res.json({
    success: true,
    summary: {
      email: req.user?.email,
      sitesCount: 0,
      message: 'Welcome to ZetSite — create your first site to get started.',
    },
  });
});

export default router;
