import { User } from '../users/user.model';
import { Service } from '../services/service.model';
import { Booking } from '../bookings/booking.model';
import { PerformerProfile } from '../performers/performer.model';
import { NotFound, BadRequest } from '../../shared/errors';
import { buildMeta } from '../../shared/utils/pagination';
import { z } from 'zod';

export const adminUserQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  role: z.enum(['client', 'performer', 'admin']).optional(),
  status: z.enum(['active', 'blocked']).optional(),
  q: z.string().optional(),
});

export const adminBookingQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['pending', 'confirmed', 'rejected', 'cancelled', 'completed']).optional(),
});

export async function listUsers(query: z.infer<typeof adminUserQuerySchema>) {
  const filter: Record<string, unknown> = {};
  if (query.role) filter.role = query.role;
  if (query.status === 'blocked') filter.isBlocked = true;
  if (query.status === 'active') filter.isBlocked = false;
  if (query.q) {
    filter.$or = [
      { firstName: { $regex: query.q, $options: 'i' } },
      { lastName: { $regex: query.q, $options: 'i' } },
      { email: { $regex: query.q, $options: 'i' } },
    ];
  }

  const skip = (query.page - 1) * query.limit;
  const [items, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(query.limit),
    User.countDocuments(filter),
  ]);
  return { items, meta: buildMeta(total, query.page, query.limit) };
}

export async function blockUser(id: string) {
  const user = await User.findById(id);
  if (!user) throw NotFound('User not found');
  if (user.role === 'admin') throw BadRequest('Cannot block an admin');
  user.isBlocked = true;
  await user.save();
  return user;
}

export async function unblockUser(id: string) {
  const user = await User.findOneAndUpdate({ _id: id }, { isBlocked: false }, { new: true });
  if (!user) throw NotFound('User not found');
  return user;
}

export async function deleteUser(id: string) {
  const user = await User.findById(id);
  if (!user) throw NotFound('User not found');
  if (user.role === 'admin') throw BadRequest('Cannot delete an admin');
  await user.deleteOne();
}

export async function listServicesForModeration(query: { page: number; limit: number; status?: string }) {
  const filter: Record<string, unknown> = {};
  if (query.status) filter.status = query.status;

  const skip = (query.page - 1) * query.limit;
  const [items, total] = await Promise.all([
    Service.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(query.limit)
      .populate('performerId', 'firstName lastName email'),
    Service.countDocuments(filter),
  ]);
  return { items, meta: buildMeta(total, query.page, query.limit) };
}

export async function moderateService(id: string, action: 'approve' | 'reject') {
  const service = await Service.findById(id);
  if (!service) throw NotFound('Service not found');
  service.status = action === 'approve' ? 'active' : 'rejected';
  await service.save();
  return service;
}

export async function deleteService(id: string) {
  const service = await Service.findByIdAndDelete(id);
  if (!service) throw NotFound('Service not found');
}

export async function listAllBookings(query: z.infer<typeof adminBookingQuerySchema>) {
  const filter: Record<string, unknown> = {};
  if (query.status) filter.status = query.status;

  const skip = (query.page - 1) * query.limit;
  const [items, total] = await Promise.all([
    Booking.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(query.limit)
      .populate('clientId', 'firstName lastName')
      .populate('performerId', 'firstName lastName')
      .populate('serviceId', 'title'),
    Booking.countDocuments(filter),
  ]);
  return { items, meta: buildMeta(total, query.page, query.limit) };
}

export async function getPlatformStats() {
  const [
    totalUsers, totalClients, totalPerformers,
    totalBookings, pendingBookings, completedBookings,
    totalServices, activeServices,
    topPerformers,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'client' }),
    User.countDocuments({ role: 'performer' }),
    Booking.countDocuments(),
    Booking.countDocuments({ status: 'pending' }),
    Booking.countDocuments({ status: 'completed' }),
    Service.countDocuments(),
    Service.countDocuments({ status: 'active' }),
    PerformerProfile.find({ isActive: true })
      .sort({ averageRating: -1, reviewCount: -1 })
      .limit(5)
      .populate('userId', 'firstName lastName avatar'),
  ]);

  const bookingsByStatus = await Booking.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const recentUsers = await User.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select('firstName lastName email role createdAt');

  return {
    users: { total: totalUsers, clients: totalClients, performers: totalPerformers },
    bookings: {
      total: totalBookings,
      pending: pendingBookings,
      completed: completedBookings,
      byStatus: bookingsByStatus,
    },
    services: { total: totalServices, active: activeServices },
    topPerformers,
    recentUsers,
  };
}