import { Schema, model, Document, Types } from 'mongoose';

export type NotificationType =
  | 'booking_created'
  | 'booking_confirmed'
  | 'booking_rejected'
  | 'booking_cancelled'
  | 'booking_completed'
  | 'new_message'
  | 'review_received'
  | 'review_request';

export interface INotification extends Document {
  _id: Types.ObjectId;
  recipientId: Types.ObjectId;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  refId?: Types.ObjectId;
  refModel?: 'Booking' | 'Conversation' | 'Review';
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: [
        'booking_created', 'booking_confirmed', 'booking_rejected',
        'booking_cancelled', 'booking_completed', 'new_message',
        'review_received', 'review_request',
      ],
      required: true,
    },
    title: { type: String, required: true },
    body: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    refId: { type: Schema.Types.ObjectId },
    refModel: { type: String, enum: ['Booking', 'Conversation', 'Review'] },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
    toJSON: { virtuals: true, transform: (_d, r: Record<string, unknown>) => { r.id = r._id; r._id = undefined; return r; } },
  },
);

notificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });

export const Notification = model<INotification>('Notification', notificationSchema);