
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from './app.js';

process.env.JWT_SECRET =
  'petcare-test-secret-key-with-at-least-32-characters';

describe('PetCare Control - API security', () => {
  let token;

  beforeAll(async () => {
    const email = `test-${Date.now()}@petcare.test`;
    const password = 'PetCare2026!';

    await request(app)
      .post('/api/auth/register')
      .send({ email, password })
      .expect(201);

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email, password })
      .expect(200);

    token = response.body.token;
  });

  it('allows access with a valid JWT', async () => {
    const response = await request(app)
      .get('/api/pets')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('rejects requests without a token', async () => {
    const response = await request(app)
      .get('/api/pets')
      .expect(401);

    expect(response.body.message).toBe('Token requerido');
  });

  it('rejects requests with an invalid JWT', async () => {
    const response = await request(app)
      .get('/api/pets')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);

    expect(response.body.message).toBe(
      'Token inválido o expirado'
    );
  });
});
