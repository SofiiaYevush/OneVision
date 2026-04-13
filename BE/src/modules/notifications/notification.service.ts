import { Notification, INotification, NotificationType } from './notification.model';
import { getIO } from '../../sockets/server';
import { buildMeta } from '../../shared/utils/pagination';

interface CreateNotificationInput {
  recipientId: string;
  type: NotificationType;
  title: string;
  body: string;
  refId?: string;
  refModel?: 'Booking' | 'Conversation' | 'Review';
}

export async function createNotification(input: CreateNotificationInput): Promise<INotification> {
  const notif = await Notification.create(input);

  try {
    const io = getIO();
    io.to(`user:${input.recipientId}`).emit('notification:new', notif);
  } catch {
    // Socket.io not initialized in tests
  }

  return notif;
}

export async function listNotifications(userId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Notification.find({ recipientId: userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Notification.countDocuments({ recipientId: userId }),
  ]);
  const unreadCount = await Notification.countDocuments({ recipientId: userId, isRead: false });
  return { items, meta: buildMeta(total, page, limit), unreadCount };
}

export async function markRead(notifId: string, userId: string): Promise<void> {
  await Notification.findOneAndUpdate(
    { _id: notifId, recipientId: userId },
    { isRead: true },
  );
}

export async function markAllRead(userId: string): Promise<void> {
  await Notification.updateMany({ recipientId: userId, isRead: false }, { isRead: true });
}