import { Router, type Router as RouterType } from 'express';
import { ObjectId } from 'mongodb';
import { requireAuth, type AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { getDb } from '../utils/db.js';

const router: RouterType = Router();

router.get('/', requireAuth, async (req: AuthenticatedRequest, res) => {
  const db = getDb();
  const submissions = await db
    .collection('form_submissions')
    .find({ storeId: new ObjectId(req.user!.storeId) })
    .sort({ createdAt: -1 })
    .limit(200)
    .toArray();

  res.json({
    success: true,
    submissions: submissions.map((s) => ({
      id: s._id.toString(),
      formName: s.formName,
      fields: s.fields,
      createdAt: s.createdAt,
    })),
  });
});

export default router;
