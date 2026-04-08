import { EventEmitter } from 'events';

class TypedEventBus extends EventEmitter {
  emit<T>(event: string, payload: T): boolean {
    return super.emit(event, payload);
  }
  on<T>(event: string, listener: (payload: T) => void): this {
    return super.on(event, listener);
  }
}

export const bus = new TypedEventBus();
bus.setMaxListeners(20);

export const Events = {
  BOOKING_CREATED: 'booking.created',
  BOOKING_CONFIRMED: 'booking.confirmed',
  BOOKING_REJECTED: 'booking.rejected',
  BOOKING_CANCELLED: 'booking.cancelled',
  BOOKING_COMPLETED: 'booking.completed',
  MESSAGE_SENT: 'message.sent',
  REVIEW_CREATED: 'review.created',
} as const;