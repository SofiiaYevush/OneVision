import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { User, IUser } from '../users/user.model';
import { RegisterDto, LoginDto } from './auth.dto';
import { hashPassword, comparePassword } from '../../shared/utils/password';
import { signAccessToken, signRefreshToken, verifyRefreshToken, JwtPayload } from '../../shared/utils/jwt';
import { Conflict, Unauthorized, BadRequest } from '../../shared/errors';
import { sendVerificationEmail, sendPasswordResetEmail } from '../emails/email.service';

function makeToken() {
  return crypto.randomBytes(32).toString('hex');
}

export async function register(dto: RegisterDto): Promise<{ user: IUser; accessToken: string; refreshToken: string }> {
  const existing = await User.findOne({ email: dto.email.toLowerCase() });
  if (existing) throw Conflict('Email already in use', 'EMAIL_TAKEN');

  const passwordHash = await hashPassword(dto.password);
  const verificationToken = makeToken();

  const user = await User.create({
    email: dto.email.toLowerCase(),
    passwordHash,
    role: dto.role,
    firstName: dto.firstName,
    lastName: dto.lastName,
    emailVerificationToken: verificationToken,
    emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  sendVerificationEmail(user.email, verificationToken).catch(() => null);

  const payload: JwtPayload = { sub: user.id, role: user.role, email: user.email };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(user.id);

  const refreshHash = await bcrypt.hash(refreshToken, 8);
  await User.findByIdAndUpdate(user.id, { refreshTokenHash: refreshHash });

  return { user, accessToken, refreshToken };
}

export async function login(dto: LoginDto): Promise<{ user: IUser; accessToken: string; refreshToken: string }> {
  const user = await User.findOne({ email: dto.email.toLowerCase() }).select('+passwordHash');
  if (!user) throw Unauthorized('Invalid credentials');
  if (user.isBlocked) throw Unauthorized('Account is blocked');

  const valid = await comparePassword(dto.password, user.passwordHash);
  if (!valid) throw Unauthorized('Invalid credentials');

  const payload: JwtPayload = { sub: user.id, role: user.role, email: user.email };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(user.id);

  const refreshHash = await bcrypt.hash(refreshToken, 8);
  await User.findByIdAndUpdate(user.id, { refreshTokenHash: refreshHash });

  return { user, accessToken, refreshToken };
}

export async function refresh(token: string): Promise<{ accessToken: string; refreshToken: string }> {
  const payload = verifyRefreshToken(token);
  if (!payload) throw Unauthorized('Invalid refresh token');

  const user = await User.findById(payload.sub).select('+refreshTokenHash');
  if (!user || !user.refreshTokenHash) throw Unauthorized('Session expired');
  if (user.isBlocked) throw Unauthorized('Account is blocked');

  const valid = await bcrypt.compare(token, user.refreshTokenHash);
  if (!valid) throw Unauthorized('Invalid refresh token');

  const jwtPayload: JwtPayload = { sub: user.id, role: user.role, email: user.email };
  const newAccess = signAccessToken(jwtPayload);
  const newRefresh = signRefreshToken(user.id);

  const newHash = await bcrypt.hash(newRefresh, 8);
  await User.findByIdAndUpdate(user.id, { refreshTokenHash: newHash });

  return { accessToken: newAccess, refreshToken: newRefresh };
}

export async function logout(userId: string): Promise<void> {
  await User.findByIdAndUpdate(userId, { $unset: { refreshTokenHash: 1 } });
}

export async function verifyEmail(token: string): Promise<void> {
  const user = await User.findOne({ emailVerificationToken: token }).select(
    '+emailVerificationToken +emailVerificationExpires',
  );
  if (!user) throw BadRequest('Invalid or expired verification link', 'INVALID_TOKEN');
  if (user.emailVerificationExpires && user.emailVerificationExpires < new Date()) {
    throw BadRequest('Verification link expired', 'TOKEN_EXPIRED');
  }

  await User.findByIdAndUpdate(user.id, {
    isEmailVerified: true,
    $unset: { emailVerificationToken: 1, emailVerificationExpires: 1 },
  });
}

export async function forgotPassword(email: string): Promise<void> {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return;

  const token = makeToken();
  await User.findByIdAndUpdate(user.id, {
    passwordResetToken: token,
    passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000),
  });

  sendPasswordResetEmail(user.email, token).catch(() => null);
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  const user = await User.findOne({ passwordResetToken: token }).select(
    '+passwordResetToken +passwordResetExpires',
  );
  if (!user) throw BadRequest('Invalid or expired reset link', 'INVALID_TOKEN');
  if (user.passwordResetExpires && user.passwordResetExpires < new Date()) {
    throw BadRequest('Reset link expired', 'TOKEN_EXPIRED');
  }

  const passwordHash = await hashPassword(newPassword);
  await User.findByIdAndUpdate(user.id, {
    passwordHash,
    $unset: { passwordResetToken: 1, passwordResetExpires: 1, refreshTokenHash: 1 },
  });
}