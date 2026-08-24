import { Router, type Router as RouterType } from 'express';
import {
  signup,
  login,
  logout,
  me,
  allowSubdomain,
  getStoreBySlug,
} from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router: RouterType = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', requireAuth, me);
router.get('/subdomains/allow', allowSubdomain);
router.get('/internal/stores/by-slug/:slug', getStoreBySlug);

export default router;
