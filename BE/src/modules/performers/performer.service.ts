import { FilterQuery } from 'mongoose';
import { PerformerProfile, IPerformerProfile } from './performer.model';
import { CreateProfileDto, UpdateProfileDto, BrowseQueryDto } from './performer.dto';
import { NotFound, Conflict } from '../../shared/errors';
import { buildMeta } from '../../shared/utils/pagination';
import { fileUrl } from '../../shared/middleware/upload';
import { env } from '../../config/env';
import path from 'path';

export async function createProfile(userId: string, dto: CreateProfileDto): Promise<IPerformerProfile> {
  const existing = await PerformerProfile.findOne({ userId });
  if (existing) throw Conflict('Performer profile already exists', 'PROFILE_EXISTS');
  return PerformerProfile.create({ userId, ...dto });
}

export async function getProfileByUserId(userId: string): Promise<IPerformerProfile> {
  const profile = await PerformerProfile.findOne({ userId }).populate('userId', 'firstName lastName avatar email');
  if (!profile) throw NotFound('Performer profile not found');
  return profile;
}

export async function getProfileById(profileId: string): Promise<IPerformerProfile> {
  const profile = await PerformerProfile.findById(profileId).populate('userId', 'firstName lastName avatar email city phone');
  if (!profile) throw NotFound('Performer profile not found');
  return profile;
}

export async function updateProfile(userId: string, dto: UpdateProfileDto): Promise<IPerformerProfile> {
  const profile = await PerformerProfile.findOneAndUpdate(
    { userId },
    { $set: dto },
    { new: true, runValidators: true },
  );
  if (!profile) throw NotFound('Performer profile not found');
  return profile;
}

export async function browse(query: BrowseQueryDto) {
  const filter: FilterQuery<IPerformerProfile> = { isActive: true };

  if (query.category) filter.category = query.category;
  if (query.city) filter.city = { $regex: query.city, $options: 'i' };
  if (query.minRating !== undefined) filter.averageRating = { $gte: query.minRating };
  if (query.minRate !== undefined || query.maxRate !== undefined) {
    filter.hourlyRate = {};
    if (query.minRate !== undefined) filter.hourlyRate.$gte = query.minRate;
    if (query.maxRate !== undefined) filter.hourlyRate.$lte = query.maxRate;
  }
  if (query.q) filter.$text = { $search: query.q };

  let sortObj: Record<string, 1 | -1> = { averageRating: -1 };
  if (query.sort === 'price_asc') sortObj = { hourlyRate: 1 };
  else if (query.sort === 'price_desc') sortObj = { hourlyRate: -1 };
  else if (query.sort === 'newest') sortObj = { createdAt: -1 };
  else if (query.sort === 'reviews') sortObj = { reviewCount: -1 };

  const skip = (query.page - 1) * query.limit;
  const [items, total] = await Promise.all([
    PerformerProfile.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(query.limit)
      .populate('userId', 'firstName lastName avatar'),
    PerformerProfile.countDocuments(filter),
  ]);

  return { items, meta: buildMeta(total, query.page, query.limit) };
}

export async function addPortfolioItem(
  userId: string,
  filePath: string,
  caption?: string,
): Promise<IPerformerProfile> {
  const relativePath = path.relative(env.UPLOAD_DIR, filePath);
  const url = fileUrl(relativePath);

  const profile = await PerformerProfile.findOneAndUpdate(
    { userId },
    { $push: { portfolio: { url, caption, uploadedAt: new Date() } } },
    { new: true },
  );
  if (!profile) throw NotFound('Performer profile not found');
  return profile;
}

export async function removePortfolioItem(userId: string, itemId: string): Promise<IPerformerProfile> {
  const profile = await PerformerProfile.findOneAndUpdate(
    { userId },
    { $pull: { portfolio: { _id: itemId } } },
    { new: true },
  );
  if (!profile) throw NotFound('Performer profile not found');
  return profile;
}

export async function recalcRating(performerProfileId: string, avgRating: number, reviewCount: number) {
  await PerformerProfile.findByIdAndUpdate(performerProfileId, {
    averageRating: Math.round(avgRating * 10) / 10,
    reviewCount,
  });
}

export async function incrementBookings(userId: string) {
  await PerformerProfile.findOneAndUpdate({ userId }, { $inc: { totalBookings: 1 } });
}