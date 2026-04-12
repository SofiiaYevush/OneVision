import { Router } from 'express';
import { requireAuth, requireRole } from '../../shared/middleware/auth';
import { validate } from '../../shared/middleware/validate';
import { createBookingDto, cancelBookingDto, bookingQueryDto } from './booking.dto';
import * as ctrl from './booking.controller';

const router = Router();

router.use(requireAuth);

router.post('/', requireRole('client'), validate(createBookingDto), ctrl.createBooking);
router.get('/client', requireRole('client'), validate(bookingQueryDto, 'query'), ctrl.getMyClientBookings);
router.get('/performer', requireRole('performer'), validate(bookingQueryDto, 'query'), ctrl.getMyPerformerBookings);
router.get('/:id', ctrl.getBooking);
router.post('/:id/confirm', requireRole('performer'), ctrl.confirmBooking);
router.post('/:id/reject', requireRole('performer'), ctrl.rejectBooking);
router.post('/:id/cancel', validate(cancelBookingDto), ctrl.cancelBooking);
router.post('/:id/complete', requireRole('performer'), ctrl.completeBooking);

export default router;