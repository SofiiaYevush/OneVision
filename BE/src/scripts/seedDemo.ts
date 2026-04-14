import 'dotenv/config';
import mongoose from 'mongoose';
import { env } from '../config/env';
import { User } from '../modules/users/user.model';
import { PerformerProfile } from '../modules/performers/performer.model';
import { Service } from '../modules/services/service.model';
import { hashPassword } from '../shared/utils/password';

const performers = [
  {
    email: 'anna.kovalenko@demo.com',
    firstName: 'Anna',
    lastName: 'Kovalenko',
    city: 'Kyiv',
    profile: { category: 'photography', bio: 'Professional wedding & event photographer with 4+ years of experience.', hourlyRate: 80, city: 'Kyiv', tags: ['Wedding', 'Portrait', 'Event'], languages: ['Ukrainian', 'English'], experienceYears: 4 },
    services: [
      { title: 'Wedding Photography (Full Day)', description: 'Up to 10 hours, 500+ edited photos, online gallery included.', price: 800, priceUnit: 'fixed', category: 'photography', tags: ['Wedding'] },
      { title: 'Portrait Session', description: '1 hour portrait session, 30 edited photos, studio or outdoor.', price: 80, priceUnit: 'per_hour', category: 'photography', tags: ['Portrait'] },
    ],
  },
  {
    email: 'dj.maxim@demo.com',
    firstName: 'Maxim',
    lastName: 'Petrov',
    city: 'Kyiv',
    profile: { category: 'music', bio: 'DJ with 6 years on the decks. Weddings, clubs, corporate events.', hourlyRate: 120, city: 'Kyiv', tags: ['Wedding', 'Club', 'Corporate'], languages: ['Ukrainian', 'Russian', 'English'], experienceYears: 6 },
    services: [
      { title: 'DJ Set — Wedding', description: 'Full evening DJ set for weddings, 6–8 hours.', price: 600, priceUnit: 'fixed', category: 'music', tags: ['Wedding'] },
    ],
  },
  {
    email: 'sofia.decor@demo.com',
    firstName: 'Sofia',
    lastName: 'Romanova',
    city: 'Kyiv',
    profile: { category: 'decoration', bio: 'Floral & event decorator specializing in weddings and intimate celebrations.', hourlyRate: 50, city: 'Kyiv', tags: ['Floral', 'Wedding', 'Birthday'], languages: ['Ukrainian'], experienceYears: 3 },
    services: [
      { title: 'Wedding Floral Decoration', description: 'Full wedding decoration package: arch, tables, ceremony area.', price: 500, priceUnit: 'fixed', category: 'decoration', tags: ['Wedding', 'Floral'] },
    ],
  },
];

const clients = [
  { email: 'maria@demo.com', firstName: 'Maria', lastName: 'Sydorenko', city: 'Kyiv' },
  { email: 'taras@demo.com', firstName: 'Taras', lastName: 'Kovalchuk', city: 'Lviv' },
];

async function run() {
  await mongoose.connect(env.MONGO_URI);
  console.log('Connected to MongoDB');

  const passwordHash = await hashPassword('demo1234');

  for (const c of clients) {
    await User.findOneAndUpdate(
      { email: c.email },
      { ...c, passwordHash, role: 'client', isEmailVerified: true },
      { upsert: true, new: true },
    );
    console.log(`Client seeded: ${c.email}`);
  }

  for (const p of performers) {
    const user = await User.findOneAndUpdate(
      { email: p.email },
      { email: p.email, firstName: p.firstName, lastName: p.lastName, city: p.city, passwordHash, role: 'performer', isEmailVerified: true },
      { upsert: true, new: true },
    );

    const profile = await PerformerProfile.findOneAndUpdate(
      { userId: user!._id },
      { userId: user!._id, ...p.profile },
      { upsert: true, new: true },
    );

    for (const s of p.services) {
      await Service.findOneAndUpdate(
        { performerId: user!._id, title: s.title },
        { performerId: user!._id, performerProfileId: profile!._id, ...s, status: 'active' },
        { upsert: true, new: true },
      );
    }

    console.log(`Performer seeded: ${p.email}`);
  }

  console.log('\nDemo credentials:');
  console.log('Clients: maria@demo.com / taras@demo.com (pass: demo1234)');
  console.log('Performers: anna.kovalenko@demo.com / dj.maxim@demo.com / sofia.decor@demo.com (pass: demo1234)');

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});