import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Restaurant from '../models/Restaurant.js';

// Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend folder
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Connect to MongoDB before all tests
beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

// Disconnect after all tests
afterAll(async () => {
  await mongoose.connection.close();
});

describe('Restaurant collection', () => {
  test('should contain a restaurant named Panda Express', async () => {
    const restaurant = await Restaurant.findOne({ name: 'Panda Express' });
    expect(restaurant).not.toBeNull();
    expect(restaurant.name).toBe('Panda Express');
  });

  test('should NOT contain a restaurant named Panda Expres (typo)', async () => {
    const restaurant = await Restaurant.findOne({ name: 'Panda Expres' });
    expect(restaurant).toBeNull(); // must be null
  });
});
