import { Schema, model, Document, Types } from 'mongoose';

export type UserRole = 'client' | 'performer' | 'admin';

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  passwordHash: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone?: string;
  city?: string;
  avatar?: string;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  refreshTokenHash?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
  fullName(): string;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['client', 'performer', 'admin'], required: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    city: { type: String, trim: true },
    avatar: { type: String },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },
    refreshTokenHash: { type: String, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    isBlocked: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = ret._id;
        ret._id = undefined;
        ret.passwordHash = undefined;
        ret.refreshTokenHash = undefined;
        ret.emailVerificationToken = undefined;
        ret.emailVerificationExpires = undefined;
        ret.passwordResetToken = undefined;
        ret.passwordResetExpires = undefined;
        return ret;
      },
    },
  },
);

userSchema.index({ role: 1, isBlocked: 1 });
userSchema.index({ emailVerificationToken: 1 }, { sparse: true });
userSchema.index({ passwordResetToken: 1 }, { sparse: true });

userSchema.methods.fullName = function () {
  return `${this.firstName} ${this.lastName}`;
};

export const User = model<IUser>('User', userSchema);