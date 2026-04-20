import { User, IUser } from './user.model';
import { UpdateProfileDto } from './user.dto';
import { NotFound, Forbidden } from '../../shared/errors';
import { fileUrl } from '../../shared/middleware/upload';
import { env } from '../../config/env';
import path from 'path';

export async function getUserById(id: string): Promise<IUser> {
  const user = await User.findById(id);
  if (!user) throw NotFound('User not found');
  return user;
}

export async function updateProfile(id: string, dto: UpdateProfileDto): Promise<IUser> {
  const user = await User.findByIdAndUpdate(id, { $set: dto }, { new: true, runValidators: true });
  if (!user) throw NotFound('User not found');
  return user;
}

export async function updateAvatar(id: string, filePath: string): Promise<IUser> {
  const relativePath = path.relative(env.UPLOAD_DIR, filePath);
  const user = await User.findByIdAndUpdate(
    id,
    { $set: { avatar: fileUrl(relativePath) } },
    { new: true },
  );
  if (!user) throw NotFound('User not found');
  return user;
}

export async function deleteAccount(id: string, requesterId: string): Promise<void> {
  if (id !== requesterId) throw Forbidden();
  await User.findByIdAndDelete(id);
}