/* eslint-disable no-console */
/**
 * Seed script to create an admin user.
 *
 * Usage:
 *   npx tsx src/scripts/seed-admin.ts
 *   # or with npm script:
 *   npm run seed:admin
 *
 * Environment variables (loaded from .env automatically):
 *   MONGODB_URI - MongoDB connection string
 *
 * Optional environment variables:
 *   ADMIN_EMAIL - Admin email (default: admin@lunaz.local)
 *   ADMIN_PASSWORD - Admin password (default: Admin123!)
 *   ADMIN_NAME - Admin name (default: Admin)
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { UserRole } from '@lunaz/types';

// Load .env from project root (3 levels up from this script)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

// Simple user schema (matches auth.model.ts)
const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.CUSTOMER,
    },
    emailVerified: { type: Boolean, default: false },
    addresses: { type: Array, default: [] },
  },
  { timestamps: true }
);

const UserModel = mongoose.model('User', userSchema);

async function seedAdmin() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('❌ MONGODB_URI environment variable is required');
    process.exit(1);
  }

  // Default credentials (override with env vars)
  const email = process.env.ADMIN_EMAIL || 'admin@lunaz.local';
  const password = process.env.ADMIN_PASSWORD || 'Admin123!';
  const name = process.env.ADMIN_NAME || 'Admin';

  console.log('🔌 Connecting to MongoDB...');
  await mongoose.connect(mongoUri);
  console.log('✅ Connected to MongoDB');

  try {
    // Check if admin already exists
    const existing = await UserModel.findOne({ email: email.toLowerCase() });

    if (existing) {
      if (existing.role === UserRole.ADMIN) {
        console.log(`ℹ️  Admin user already exists: ${email}`);
        console.log('   To create a different admin, set ADMIN_EMAIL env var');
      } else {
        // Upgrade existing user to admin
        existing.role = UserRole.ADMIN;
        await existing.save();
        console.log(`✅ Upgraded existing user to admin: ${email}`);
      }
    } else {
      // Create new admin user
      const passwordHash = await bcrypt.hash(password, 10);
      await UserModel.create({
        email: email.toLowerCase(),
        passwordHash,
        name,
        role: UserRole.ADMIN,
        emailVerified: true,
      });

      console.log('');
      console.log('✅ Admin user created successfully!');
      console.log('');
      console.log('   Email:    ', email);
      console.log('   Password: ', password);
      console.log('   Name:     ', name);
      console.log('');
      console.log('⚠️  Change the password after first login in production!');
    }
  } catch (err) {
    if ((err as { code?: number }).code === 11000) {
      console.log(`ℹ️  User with email ${email} already exists`);
    } else {
      throw err;
    }
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

seedAdmin().catch((err) => {
  console.error('❌ Error seeding admin:', err);
  process.exit(1);
});
