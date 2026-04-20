import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { env } from '../../config/env';
import { BadRequest } from '../errors';

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function storage(subdir: string) {
  const dest = path.join(env.UPLOAD_DIR, subdir);
  ensureDir(dest);
  return multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, dest),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
    },
  });
}

function fileFilter(_req: Request, file: Express.Multer.File, cb: FileFilterCallback) {
  if (ALLOWED_MIME.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(BadRequest('Only image files are allowed'));
  }
}

const maxSize = env.UPLOAD_MAX_SIZE_MB * 1024 * 1024;

export const avatarUpload = multer({ storage: storage('avatars'), fileFilter, limits: { fileSize: maxSize } });
export const portfolioUpload = multer({ storage: storage('portfolio'), fileFilter, limits: { fileSize: maxSize } });

export function fileUrl(relativePath: string): string {
  return `${env.PUBLIC_BASE_URL}/static/${relativePath.replace(/\\/g, '/')}`;
}