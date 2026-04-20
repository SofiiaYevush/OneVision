import request from 'supertest';
import { createApp } from '../src/app';
import { User } from '../src/modules/users/user.model';
import { PerformerProfile } from '../src/modules/performers/performer.model';
import { Service } from '../src/modules/services/service.model';

const app = createApp();

async function createTestClient() {
  const reg = await request(app).post('/api/auth/register').send({
    email: `client-${Date.now()}@test.com`,
    password: 'password123',
    firstName: 'Client',
    lastName: 'Test',
    role: 'client',
  });
  return { token: reg.body.data.accessToken as string, userId: reg.body.data.user.id as string };
}

async function createTestPerformerWithService() {
  const reg = await request(app).post('/api/auth/register').send({
    email: `performer-${Date.now()}@test.com`,
    password: 'password123',
    firstName: 'Performer',
    lastName: 'Test',
    role: 'performer',
  });
  const token = reg.body.data.accessToken as string;
  const userId = reg.body.data.user.id as string;

  const profile = await PerformerProfile.create({
    userId,
    category: 'photography',
    bio: 'Test performer',
    hourlyRate: 80,
    city: 'Kyiv',
  });

  const service = await Service.create({
    performerId: userId,
    performerProfileId: profile._id,
    title: 'Test Photography',
    description: 'Test service description for testing',
    category: 'photography',
    price: 200,
    priceUnit: 'fixed',
    status: 'active',
  });

  return { token, userId, profileId: profile.id as string, serviceId: service.id as string };
}

describe('Booking API', () => {
  it('client can create a booking request', async () => {
    const client = await createTestClient();
    const performer = await createTestPerformerWithService();

    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 2);

    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${client.token}`)
      .send({
        serviceId: performer.serviceId,
        eventDate: futureDate.toISOString(),
        eventName: 'My Wedding',
        eventType: 'Wedding',
        eventAddress: 'Marriott Hotel, Kyiv',
        guestCount: 80,
        notes: 'Please arrive 30 min early',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('pending');
    expect(res.body.data.price).toBe(200);
  });

  it('performer can confirm a booking', async () => {
    const client = await createTestClient();
    const performer = await createTestPerformerWithService();

    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 3);

    const createRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${client.token}`)
      .send({
        serviceId: performer.serviceId,
        eventDate: futureDate.toISOString(),
        eventName: 'Birthday Party',
        eventType: 'Birthday',
        eventAddress: 'Home address, Kyiv',
      });

    const bookingId = createRes.body.data.id as string;

    const confirmRes = await request(app)
      .post(`/api/bookings/${bookingId}/confirm`)
      .set('Authorization', `Bearer ${performer.token}`);

    expect(confirmRes.status).toBe(200);
    expect(confirmRes.body.data.status).toBe('confirmed');
  });

  it('prevents booking own service', async () => {
    const performer = await createTestPerformerWithService();
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 1);

    await User.findByIdAndUpdate(performer.userId, { role: 'client' });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: (await User.findById(performer.userId))!.email, password: 'password123' });
    const clientToken = loginRes.body.data.accessToken as string;

    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        serviceId: performer.serviceId,
        eventDate: futureDate.toISOString(),
        eventName: 'Self booking',
        eventType: 'Other',
        eventAddress: 'Test address Kyiv',
      });

    expect(res.status).toBe(400);
  });
});