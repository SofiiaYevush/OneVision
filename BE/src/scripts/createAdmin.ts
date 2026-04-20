import 'dotenv/config';
import mongoose from 'mongoose';
import { env } from '../config/env';
import { User } from '../modules/users/user.model';
import { hashPassword } from '../shared/utils/password';

async function run() {
  await mongoose.connect(env.MONGO_URI);

  const existing = await User.findOne({ email: env.ADMIN_EMAIL });
  if (existing) {
    console.log(`Admin already exists: ${env.ADMIN_EMAIL}`);
    await mongoose.disconnect();
    return;
  }

  const passwordHash = await hashPassword(env.ADMIN_PASSWORD);
  await User.create({
    email: env.ADMIN_EMAIL,
    passwordHash,
    role: 'admin',
    firstName: env.ADMIN_FIRST_NAME,
    lastName: env.ADMIN_LAST_NAME,
    isEmailVerified: true,
  });

  console.log(`Admin created: ${env.ADMIN_EMAIL}`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});