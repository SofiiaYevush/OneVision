import { Schema, model, Document, Types } from 'mongoose';

export type Category =
  | 'photography'
  | 'music'
  | 'hosting'
  | 'decoration'
  | 'videography'
  | 'entertainment'
  | 'other';

export interface IPortfolioItem {
  _id: Types.ObjectId;
  url: string;
  caption?: string;
  uploadedAt: Date;
}

export interface IPerformerProfile extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  category: Category;
  bio: string;
  hourlyRate: number;
  city: string;
  tags: string[];
  languages: string[];
  experienceYears: number;
  portfolio: IPortfolioItem[];
  averageRating: number;
  reviewCount: number;
  totalBookings: number;
  isActive: boolean;
  responseTime: string;
  createdAt: Date;
  updatedAt: Date;
}

const portfolioItemSchema = new Schema<IPortfolioItem>(
  {
    url: { type: String, required: true },
    caption: { type: String, maxlength: 200 },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: true },
);

const performerProfileSchema = new Schema<IPerformerProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    category: {
      type: String,
      enum: ['photography', 'music', 'hosting', 'decoration', 'videography', 'entertainment', 'other'],
      required: true,
    },
    bio: { type: String, default: '', maxlength: 2000 },
    hourlyRate: { type: Number, default: 0, min: 0 },
    city: { type: String, default: '', trim: true },
    tags: [{ type: String, trim: true }],
    languages: [{ type: String, trim: true }],
    experienceYears: { type: Number, default: 0, min: 0 },
    portfolio: [portfolioItemSchema],
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    totalBookings: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    responseTime: { type: String, default: 'within a few hours' },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true, transform: (_d, r: Record<string, unknown>) => { r.id = r._id; r._id = undefined; return r; } },
  },
);

performerProfileSchema.index({ category: 1, isActive: 1 });
performerProfileSchema.index({ city: 1, isActive: 1 });
performerProfileSchema.index({ averageRating: -1 });
performerProfileSchema.index({ hourlyRate: 1 });
performerProfileSchema.index({ userId: 1 });
performerProfileSchema.index(
  { bio: 'text', tags: 'text', city: 'text' },
  { name: 'performer_text_search' },
);

export const PerformerProfile = model<IPerformerProfile>('PerformerProfile', performerProfileSchema);