import { Router } from 'express';
import { requireAuth, requireRole } from '../../shared/middleware/auth';
import * as ctrl from './availability.controller';

const router = Router();

router.get('/:performerId/month', ctrl.getMonthAvailability);

router.use(requireAuth, requireRole('performer'));
router.post('/block', ctrl.blockDates);
router.post('/unblock', ctrl.unblockDates);

export default router;