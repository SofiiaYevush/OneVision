import { Schema, model, Document, Types } from 'mongoose';

export type MessageType = 'text' | 'system' | 'booking_update';

export interface IMessage extends Document {
  _id: Types.ObjectId;
  conversationId: Types.ObjectId;
  senderId: Types.ObjectId;
  content: string;
  type: MessageType;
  bookingId?: Types.ObjectId;
  readBy: Types.ObjectId[];
  createdAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, maxlength: 5000 },
    type: { type: String, enum: ['text', 'system', 'booking_update'], default: 'text' },
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', sparse: true },
    readBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
    toJSON: { virtuals: true, transform: (_d, r: Record<string, unknown>) => { r.id = r._id; r._id = undefined; return r; } },
  },
);

messageSchema.index({ conversationId: 1, createdAt: -1 });

export const Message = model<IMessage>('Message', messageSchema);