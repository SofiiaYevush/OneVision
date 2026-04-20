import { FilterQuery } from 'mongoose';
import { Service, IService } from './service.model';
import { CreateServiceDto, UpdateServiceDto, ServiceQueryDto } from './service.dto';
import { PerformerProfile } from '../performers/performer.model';
import { NotFound, Forbidden } from '../../shared/errors';
import { buildMeta } from '../../shared/utils/pagination';

export async function createService(userId: string, dto: CreateServiceDto): Promise<IService> {
  const profile = await PerformerProfile.findOne({ userId });
  if (!profile) throw NotFound('Performer profile not found. Create your profile first.');

  return Service.create({
    performerId: userId,
    performerProfileId: profile._id,
    ...dto,
  });
}

export async function getService(id: string): Promise<IService> {
  const service = await Service.findById(id).populate('performerId', 'firstName lastName avatar');
  if (!service || service.status === 'rejected') throw NotFound('Service not found');
  return service;
}

export async function listMyServices(userId: string): Promise<IService[]> {
  return Service.find({ performerId: userId }).sort({ createdAt: -1 });
}

export async function updateService(id: string, userId: string, dto: UpdateServiceDto): Promise<IService> {
  const service = await Service.findById(id);
  if (!service) throw NotFound('Service not found');
  if (service.performerId.toString() !== userId) throw Forbidden();

  return Service.findByIdAndUpdate(id, { $set: dto }, { new: true, runValidators: true }) as Promise<IService>;
}

export async function deleteService(id: string, userId: string): Promise<void> {
  const service = await Service.findById(id);
  if (!service) throw NotFound('Service not found');
  if (service.performerId.toString() !== userId) throw Forbidden();
  await service.deleteOne();
}

export async function toggleServiceStatus(id: string, userId: string): Promise<IService> {
  const service = await Service.findById(id);
  if (!service) throw NotFound('Service not found');
  if (service.performerId.toString() !== userId) throw Forbidden();

  const newStatus = service.status === 'active' ? 'inactive' : 'active';
  return Service.findByIdAndUpdate(id, { status: newStatus }, { new: true }) as Promise<IService>;
}

export async function listServices(query: ServiceQueryDto) {
  const filter: FilterQuery<IService> = { status: 'active' };

  if (query.category) filter.category = query.category;
  if (query.performerId) filter.performerId = query.performerId;
  if (query.q) filter.$text = { $search: query.q };
  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    filter.price = {};
    if (query.minPrice !== undefined) filter.price.$gte = query.minPrice;
    if (query.maxPrice !== undefined) filter.price.$lte = query.maxPrice;
  }

  let sort: Record<string, 1 | -1> = { createdAt: -1 };
  if (query.sort === 'price_asc') sort = { price: 1 };
  if (query.sort === 'price_desc') sort = { price: -1 };

  const skip = (query.page - 1) * query.limit;
  const [items, total] = await Promise.all([
    Service.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(query.limit)
      .populate('performerId', 'firstName lastName avatar'),
    Service.countDocuments(filter),
  ]);

  return { items, meta: buildMeta(total, query.page, query.limit) };
}