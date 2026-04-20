import { Types } from 'mongoose';
import { Review, IReview } from './review.model';
import { Booking } from '../bookings/booking.model';
import { recalcRating } from '../performers/performer.service';
import { bus, Events } from '../../shared/events/bus';
import { NotFound, Forbidden, Conflict, BadRequest } from '../../shared/errors';
import { buildMeta } from '../../shared/utils/pagination';

export async function createReview(
  clientId: string,
  bookingId: string,
  rating: number,
  comment: string,
): Promise<IReview> {
  const booking = await Booking.findById(bookingId);
  if (!booking) throw NotFound('Booking not found');
  if (booking.clientId.toString() !== clientId) throw Forbidden();
  if (booking.status !== 'completed') throw BadRequest('Can only review completed bookings');

  const existing = await Review.findOne({ bookingId });
  if (existing) throw Conflict('Review already submitted for this booking', 'REVIEW_EXISTS');

  const review = await Review.create({
    bookingId,
    clientId,
    performerId: booking.performerId,
    performerProfileId: booking.performerProfileId,
    rating,
    comment,
  });

  await Booking.findByIdAndUpdate(bookingId, { reviewId: review._id });

  await refreshPerformerRating(booking.performerProfileId.toString());

  bus.emit<IReview>(Events.REVIEW_CREATED, review);
  return review;
}

async function refreshPerformerRating(profileId: string) {
  const [result] = await Review.aggregate([
    { $match: { performerProfileId: new Types.ObjectId(profileId) } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  if (result) {
    await recalcRating(profileId, result.avg as number, result.count as number);
  }
}

export async function listPerformerReviews(performerProfileId: string, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Review.find({ performerProfileId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('clientId', 'firstName lastName avatar'),
    Review.countDocuments({ performerProfileId }),
  ]);
  return { items, meta: buildMeta(total, page, limit) };
}