import { Schema, model, Document, Types } from 'mongoose';
import { Category } from '../performers/performer.model';

export type ServiceStatus = 'active' | 'inactive' | 'pending_moderation' | 'rejected';

export interface IService extends Document {
  _id: Types.ObjectId;
  performerId: Types.ObjectId;
  performerProfileId: Types.ObjectId;
  title: string;
  description: string;
  category: Category;
  price: number;
  priceUnit: 'fixed' | 'per_hour' | 'per_day';
  duration?: number;
  location: string;
  tags: string[];
  status: ServiceStatus;
  createdAt: Date;
  updatedAt: Date;
}

const serviceSchema = new Schema<IService>(
  {
    performerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    performerProfileId: { type: Schema.Types.ObjectId, ref: 'PerformerProfile', required: true },
    title: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, required: true, maxlength: 3000 },
    category: {
      type: String,
      enum: ['photography', 'music', 'hosting', 'decoration', 'videography', 'entertainment', 'other'],
      required: true,
    },
    price: { type: Number, required: true, min: 0 },
    priceUnit: { type: String, enum: ['fixed', 'per_hour', 'per_day'], default: 'fixed' },
    duration: { type: Number, min: 0 },
    location: { type: String, default: '', trim: true },
    tags: [{ type: String, trim: true }],
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending_moderation', 'rejected'],
      default: 'active',
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true, transform: (_d, r: Record<string, unknown>) => { r.id = r._id; r._id = undefined; return r; } },
  },
);

serviceSchema.index({ performerId: 1, status: 1 });
serviceSchema.index({ category: 1, status: 1 });
serviceSchema.index({ price: 1 });
serviceSchema.index({ status: 1 });
serviceSchema.index({ title: 'text', description: 'text', tags: 'text' }, { name: 'service_text' });

export const Service = model<IService>('Service', serviceSchema);