import { Schema, model, Document, Types } from 'mongoose';

export interface IReview extends Document {
  _id: Types.ObjectId;
  bookingId: Types.ObjectId;
  clientId: Types.ObjectId;
  performerId: Types.ObjectId;
  performerProfileId: Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
    clientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    performerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    performerProfileId: { type: Schema.Types.ObjectId, ref: 'PerformerProfile', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, maxlength: 2000 },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
    toJSON: { virtuals: true, transform: (_d, r: Record<string, unknown>) => { r.id = r._id; r._id = undefined; return r; } },
  },
);

reviewSchema.index({ performerProfileId: 1, createdAt: -1 });
reviewSchema.index({ clientId: 1 });

export const Review = model<IReview>('Review', reviewSchema);