import { Types } from 'mongoose';
import { Conversation, IConversation } from './conversation.model';
import { Message, IMessage } from './message.model';
import { NotFound, Forbidden } from '../../shared/errors';
import { buildMeta } from '../../shared/utils/pagination';
import { bus, Events } from '../../shared/events/bus';

export interface SendMessagePayload {
  conversationId: string;
  senderId: string;
  content: string;
  bookingId?: string;
}

export async function getOrCreateConversation(
  clientId: string,
  performerId: string,
): Promise<IConversation> {
  const existing = await Conversation.findOne({ clientId, performerId });
  if (existing) return existing;
  return Conversation.create({ clientId, performerId });
}

export async function getConversation(id: string, userId: string): Promise<IConversation> {
  const conv = await Conversation.findById(id)
    .populate('clientId', 'firstName lastName avatar')
    .populate('performerId', 'firstName lastName avatar');
  if (!conv) throw NotFound('Conversation not found');

  const member =
    conv.clientId.toString() === userId || conv.performerId.toString() === userId;
  if (!member) throw Forbidden();
  return conv;
}

export async function listMyConversations(userId: string) {
  const conversations = await Conversation.find({
    $or: [{ clientId: userId }, { performerId: userId }],
  })
    .sort({ lastMessageAt: -1 })
    .populate('clientId', 'firstName lastName avatar')
    .populate('performerId', 'firstName lastName avatar');
  return conversations;
}

export async function getMessages(
  conversationId: string,
  userId: string,
  page = 1,
  limit = 30,
) {
  const conv = await Conversation.findById(conversationId);
  if (!conv) throw NotFound('Conversation not found');
  const member =
    conv.clientId.toString() === userId || conv.performerId.toString() === userId;
  if (!member) throw Forbidden();

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Message.find({ conversationId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('senderId', 'firstName lastName avatar'),
    Message.countDocuments({ conversationId }),
  ]);

  await markRead(conversationId, userId);
  return { items: items.reverse(), meta: buildMeta(total, page, limit) };
}

export async function sendMessage(payload: SendMessagePayload): Promise<IMessage> {
  const conv = await Conversation.findById(payload.conversationId);
  if (!conv) throw NotFound('Conversation not found');

  const isClient = conv.clientId.toString() === payload.senderId;
  const isPerformer = conv.performerId.toString() === payload.senderId;
  if (!isClient && !isPerformer) throw Forbidden();

  const msg = await Message.create({
    conversationId: payload.conversationId,
    senderId: payload.senderId,
    content: payload.content,
    type: payload.bookingId ? 'booking_update' : 'text',
    ...(payload.bookingId ? { bookingId: payload.bookingId } : {}),
    readBy: [new Types.ObjectId(payload.senderId)],
  });

  await Conversation.findByIdAndUpdate(payload.conversationId, {
    lastMessage: payload.content.slice(0, 100),
    lastMessageAt: new Date(),
    ...(isClient ? { $inc: { unreadPerformer: 1 } } : { $inc: { unreadClient: 1 } }),
  });

  const populated = await msg.populate('senderId', 'firstName lastName avatar');

  bus.emit<IMessage>(Events.MESSAGE_SENT, populated);
  return populated;
}

async function markRead(conversationId: string, userId: string) {
  const conv = await Conversation.findById(conversationId);
  if (!conv) return;
  const isClient = conv.clientId.toString() === userId;

  await Message.updateMany(
    { conversationId, readBy: { $ne: new Types.ObjectId(userId) } },
    { $addToSet: { readBy: new Types.ObjectId(userId) } },
  );

  await Conversation.findByIdAndUpdate(
    conversationId,
    isClient ? { unreadClient: 0 } : { unreadPerformer: 0 },
  );
}

export async function createSystemMessage(
  conversationId: string,
  content: string,
  bookingId?: string,
): Promise<IMessage> {
  const systemUserId = new Types.ObjectId('000000000000000000000000');
  const msg = await Message.create({
    conversationId,
    senderId: systemUserId,
    content,
    type: bookingId ? 'booking_update' : 'system',
    ...(bookingId ? { bookingId } : {}),
    readBy: [],
  });

  await Conversation.findByIdAndUpdate(conversationId, {
    lastMessage: content.slice(0, 100),
    lastMessageAt: new Date(),
    $inc: { unreadClient: 1, unreadPerformer: 1 },
  });

  return msg;
}