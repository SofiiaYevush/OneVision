import { Schema, model, Document, Types } from 'mongoose';

export type BlockType = 'booked' | 'blocked_by_performer';

export interface IAvailability extends Document {
  _id: Types.ObjectId;
  performerId: Types.ObjectId;
  date: Date;
  type: BlockType;
  bookingId?: Types.ObjectId;
  createdAt: Date;
}

const availabilitySchema = new Schema<IAvailability>(
  {
    performerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    type: { type: String, enum: ['booked', 'blocked_by_performer'], required: true },
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', sparse: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  },
);

availabilitySchema.index({ performerId: 1, date: 1 }, { unique: true });

export const Availability = model<IAvailability>('Availability', availabilitySchema);