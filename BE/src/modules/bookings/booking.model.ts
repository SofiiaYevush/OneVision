import { Schema, model, Document, Types } from 'mongoose';

export type BookingStatus = 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'completed';

export interface IBooking extends Document {
  _id: Types.ObjectId;
  clientId: Types.ObjectId;
  performerId: Types.ObjectId;
  serviceId: Types.ObjectId;
  performerProfileId: Types.ObjectId;
  eventDate: Date;
  eventName: string;
  eventType: string;
  eventAddress: string;
  startTime?: string;
  duration?: number;
  guestCount?: number;
  notes?: string;
  price: number;
  status: BookingStatus;
  cancelledBy?: 'client' | 'performer';
  cancelReason?: string;
  conversationId?: Types.ObjectId;
  reviewId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    clientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    performerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    serviceId: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
    performerProfileId: { type: Schema.Types.ObjectId, ref: 'PerformerProfile', required: true },
    eventDate: { type: Date, required: true },
    eventName: { type: String, required: true, trim: true, maxlength: 200 },
    eventType: { type: String, required: true, trim: true },
    eventAddress: { type: String, required: true, trim: true },
    startTime: { type: String },
    duration: { type: Number, min: 0 },
    guestCount: { type: Number, min: 0 },
    notes: { type: String, maxlength: 2000 },
    price: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'rejected', 'cancelled', 'completed'],
      default: 'pending',
    },
    cancelledBy: { type: String, enum: ['client', 'performer'] },
    cancelReason: { type: String, maxlength: 500 },
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation' },
    reviewId: { type: Schema.Types.ObjectId, ref: 'Review' },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true, transform: (_d, r: Record<string, unknown>) => { r.id = r._id; r._id = undefined; return r; } },
  },
);

bookingSchema.index({ clientId: 1, status: 1, createdAt: -1 });
bookingSchema.index({ performerId: 1, status: 1, eventDate: 1 });
bookingSchema.index({ status: 1, eventDate: 1 });

export const Booking = model<IBooking>('Booking', bookingSchema);