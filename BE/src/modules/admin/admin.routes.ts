
import { Router } from 'express';
import { requireAuth, requireRole } from '../../shared/middleware/auth';
import * as ctrl from './admin.controller';

const router = Router();

router.use(requireAuth, requireRole('admin'));

router.get('/stats', ctrl.getStats);

router.get('/users', ctrl.listUsers);
router.post('/users/:id/block', ctrl.blockUser);
router.post('/users/:id/unblock', ctrl.unblockUser);
router.delete('/users/:id', ctrl.deleteUser);

router.get('/services', ctrl.listServices);
router.post('/services/:id/moderate', ctrl.moderateService);
router.delete('/services/:id', ctrl.deleteService);

router.get('/bookings', ctrl.listBookings);

export default router;