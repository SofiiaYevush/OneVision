import { Schema, model, Document, Types } from 'mongoose';

export interface IConversation extends Document {
  _id: Types.ObjectId;
  clientId: Types.ObjectId;
  performerId: Types.ObjectId;
  lastMessage?: string;
  lastMessageAt?: Date;
  unreadClient: number;
  unreadPerformer: number;
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>(
  {
    clientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    performerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    lastMessage: { type: String },
    lastMessageAt: { type: Date },
    unreadClient: { type: Number, default: 0 },
    unreadPerformer: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true, transform: (_d, r: Record<string, unknown>) => { r.id = r._id; r._id = undefined; return r; } },
  },
);

conversationSchema.index({ clientId: 1, performerId: 1 }, { unique: true });
conversationSchema.index({ clientId: 1, lastMessageAt: -1 });
conversationSchema.index({ performerId: 1, lastMessageAt: -1 });

export const Conversation = model<IConversation>('Conversation', conversationSchema);