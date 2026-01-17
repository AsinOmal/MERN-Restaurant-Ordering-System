const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');  // Assuming you export app separately from server.js
const User = require('../../src/models/User');

describe('Auth Integration Tests', () => {
  beforeAll(async () => {
    // Connect to test database
    const testDbUrl = process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/restaurant-test';
    await mongoose.connect(testDbUrl);
  });

  afterAll(async () => {
    // Clean up and disconnect
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear users before each test
    await User.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    test('should register a new user successfully', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'customer',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.data.user).toHaveProperty('email', userData.email);
      expect(response.body.data.user).not.toHaveProperty('password');
    });

    test('should reject duplicate email registration', async () => {
      const userData = {
        name: 'Test User',
        email: 'duplicate@example.com',
        password: 'password123',
        role: 'customer',
      };

      // Register first time
      await request(app).post('/api/auth/register').send(userData);

      // Try to register again
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.status).toBe('fail');
    });

    test('should reject invalid email format', async () => {
      const userData = {
        name: 'Test User',
        email: 'invalid-email',
        password: 'password123',
        role: 'customer',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.status).toBe('fail');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user
      await User.create({
        name: 'Login Test',
        email: 'login@example.com',
        password: 'password123',
        role: 'customer',
      });
    });

    test('should login with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'password123',
        })
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.token).toBeDefined();
      expect(response.body.data.user).toHaveProperty('email', 'login@example.com');
    });

    test('should reject incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body.status).toBe('fail');
      expect(response.body.token).toBeUndefined();
    });

    test('should reject non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
        .expect(401);

      expect(response.body.status).toBe('fail');
    });
  });
});
