const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const Review = require('../models/Review');
const User = require('../models/User');

let token;
let userId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  // Create a test user
  const user = new User({ username: 'testuser', email: 'test@example.com', password: 'hashedpassword' });
  await user.save();
  userId = user._id;
  token = 'fake_token'; // In real test, generate proper token
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Review Routes', () => {
  it('should create a review', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test Review',
        description: 'Test description',
        originalCode: 'console.log("old");',
        changedCode: 'console.log("new");'
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('_id');
  });

  it('should get reviews', async () => {
    const res = await request(app)
      .get('/api/reviews')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});