import { bus, Events } from '../../shared/events/bus';
import { BookingEventPayload } from './booking.service';
import { IBooking } from './booking.model';
import { getOrCreateConversation, createSystemMessage } from '../chat/chat.service';
import { createNotification } from '../notifications/notification.service';
import { sendBookingNotificationEmail } from '../emails/email.service';
import { User } from '../users/user.model';
import { Booking } from './booking.model';
import { incrementBookings } from '../performers/performer.service';
import { logger } from '../../config/logger';

async function getUserEmail(userId: string): Promise<string | null> {
  const user = await User.findById(userId).select('email firstName');
  return user?.email ?? null;
}

function bookingInfo(b: IBooking) {
  return `${b.eventName} · ${b.eventDate.toDateString()} · $${b.price}`;
}

export function registerBookingListeners() {
  bus.on<BookingEventPayload>(Events.BOOKING_CREATED, async ({ booking }) => {
    try {
      const conv = await getOrCreateConversation(
        booking.clientId.toString(),
        booking.performerId.toString(),
      );

      await Booking.findByIdAndUpdate(booking.id, { conversationId: conv._id });

      await createSystemMessage(
        conv.id,
        `📋 New booking request: ${bookingInfo(booking)} · Status: Pending`,
        booking.id,
      );

      await createNotification({
        recipientId: booking.performerId.toString(),
        type: 'booking_created',
        title: 'New booking request',
        body: `You have a new booking request for ${booking.eventName} on ${booking.eventDate.toDateString()}.`,
        refId: booking.id,
        refModel: 'Booking',
      });

      const email = await getUserEmail(booking.performerId.toString());
      if (email) {
        sendBookingNotificationEmail(
          email,
          'New booking request — Festivo',
          `You have a new booking request: <strong>${bookingInfo(booking)}</strong>. Log in to confirm or reject.`,
        ).catch(() => null);
      }
    } catch (err) {
      logger.error({ err }, 'booking.created listener error');
    }
  });

  bus.on<BookingEventPayload>(Events.BOOKING_CONFIRMED, async ({ booking }) => {
    try {
      if (booking.conversationId) {
        await createSystemMessage(
          booking.conversationId.toString(),
          `✅ Booking confirmed: ${bookingInfo(booking)}`,
          booking.id,
        );
      }

      await createNotification({
        recipientId: booking.clientId.toString(),
        type: 'booking_confirmed',
        title: 'Booking confirmed!',
        body: `Your booking for ${booking.eventName} has been confirmed.`,
        refId: booking.id,
        refModel: 'Booking',
      });

      await incrementBookings(booking.performerId.toString());

      const email = await getUserEmail(booking.clientId.toString());
      if (email) {
        sendBookingNotificationEmail(
          email,
          'Booking confirmed — Festivo',
          `Great news! Your booking <strong>${bookingInfo(booking)}</strong> has been confirmed.`,
        ).catch(() => null);
      }
    } catch (err) {
      logger.error({ err }, 'booking.confirmed listener error');
    }
  });

  bus.on<BookingEventPayload>(Events.BOOKING_REJECTED, async ({ booking }) => {
    try {
      if (booking.conversationId) {
        await createSystemMessage(
          booking.conversationId.toString(),
          `❌ Booking rejected: ${bookingInfo(booking)}`,
          booking.id,
        );
      }

      await createNotification({
        recipientId: booking.clientId.toString(),
        type: 'booking_rejected',
        title: 'Booking rejected',
        body: `Your booking request for ${booking.eventName} was declined.`,
        refId: booking.id,
        refModel: 'Booking',
      });
    } catch (err) {
      logger.error({ err }, 'booking.rejected listener error');
    }
  });

  bus.on<BookingEventPayload>(Events.BOOKING_CANCELLED, async ({ booking, actorId }) => {
    try {
      if (booking.conversationId) {
        await createSystemMessage(
          booking.conversationId.toString(),
          `🚫 Booking cancelled: ${bookingInfo(booking)}`,
          booking.id,
        );
      }

      const notifyId =
        actorId === booking.clientId.toString()
          ? booking.performerId.toString()
          : booking.clientId.toString();

      await createNotification({
        recipientId: notifyId,
        type: 'booking_cancelled',
        title: 'Booking cancelled',
        body: `Booking for ${booking.eventName} has been cancelled.`,
        refId: booking.id,
        refModel: 'Booking',
      });
    } catch (err) {
      logger.error({ err }, 'booking.cancelled listener error');
    }
  });

  bus.on<BookingEventPayload>(Events.BOOKING_COMPLETED, async ({ booking }) => {
    try {
      if (booking.conversationId) {
        await createSystemMessage(
          booking.conversationId.toString(),
          `🎉 Booking completed: ${bookingInfo(booking)}. Leave a review!`,
          booking.id,
        );
      }

      await createNotification({
        recipientId: booking.clientId.toString(),
        type: 'review_request',
        title: 'How was your experience?',
        body: `Your event with ${booking.eventName} is complete. Share your feedback!`,
        refId: booking.id,
        refModel: 'Booking',
      });
    } catch (err) {
      logger.error({ err }, 'booking.completed listener error');
    }
  });
}