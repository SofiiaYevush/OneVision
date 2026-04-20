import request from 'supertest';
import { createApp } from '../src/app';

const app = createApp();

describe('Auth API', () => {
  describe('POST /api/auth/register', () => {
    it('registers a new client and returns accessToken', async () => {
      const res = await request(app).post('/api/auth/register').send({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: 'client',
      });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.user.email).toBe('test@example.com');
      expect(res.body.data.user.role).toBe('client');
      expect(res.body.data.user.passwordHash).toBeUndefined();
    });

    it('rejects duplicate email', async () => {
      await request(app).post('/api/auth/register').send({
        email: 'dup@example.com',
        password: 'password123',
        firstName: 'A',
        lastName: 'B',
        role: 'client',
      });

      const res = await request(app).post('/api/auth/register').send({
        email: 'dup@example.com',
        password: 'password123',
        firstName: 'A',
        lastName: 'B',
        role: 'client',
      });

      expect(res.status).toBe(409);
      expect(res.body.code).toBe('EMAIL_TAKEN');
    });

    it('validates required fields', async () => {
      const res = await request(app).post('/api/auth/register').send({ email: 'bad' });
      expect(res.status).toBe(422);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/register').send({
        email: 'login@example.com',
        password: 'password123',
        firstName: 'Login',
        lastName: 'User',
        role: 'client',
      });
    });

    it('returns accessToken on valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'login@example.com', password: 'password123' });

      expect(res.status).toBe(200);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('rejects wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'login@example.com', password: 'wrong' });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/users/me', () => {
    it('returns current user when authenticated', async () => {
      const reg = await request(app).post('/api/auth/register').send({
        email: 'me@example.com',
        password: 'password123',
        firstName: 'Me',
        lastName: 'User',
        role: 'performer',
      });

      const token = reg.body.data.accessToken as string;
      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe('me@example.com');
    });

    it('returns 401 without token', async () => {
      const res = await request(app).get('/api/users/me');
      expect(res.status).toBe(401);
    });
  });
});