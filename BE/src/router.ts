import { Router } from 'express';
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/user.routes';
import performerRoutes from './modules/performers/performer.routes';
import serviceRoutes from './modules/services/service.routes';
import availabilityRoutes from './modules/availability/availability.routes';
import bookingRoutes from './modules/bookings/booking.routes';
import chatRoutes from './modules/chat/chat.routes';
import notificationRoutes from './modules/notifications/notification.routes';
import reviewRoutes from './modules/reviews/review.routes';
import adminRoutes from './modules/admin/admin.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/performers', performerRoutes);
router.use('/services', serviceRoutes);
router.use('/availability', availabilityRoutes);
router.use('/bookings', bookingRoutes);
router.use('/chat', chatRoutes);
router.use('/notifications', notificationRoutes);
router.use('/reviews', reviewRoutes);
router.use('/admin', adminRoutes);

export default router;