import { Router } from 'express';
import { requireAuth, requireRole } from '../../shared/middleware/auth';
import * as ctrl from './review.controller';

const router = Router();

router.get('/performer/:profileId', ctrl.listPerformerReviews);

router.post('/', requireAuth, requireRole('client'), ctrl.createReview);

export default router;