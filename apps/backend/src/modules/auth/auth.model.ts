import mongoose from 'mongoose';
import { UserRole } from 'constants/enums';

const addressSchema = new mongoose.Schema(
  {
    label: String,
    line1: { type: String, required: true },
    line2: String,
    city: { type: String, required: true },
    state: String,
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: false },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    role: { type: String, enum: Object.values(UserRole), default: UserRole.CUSTOMER },
    emailVerified: { type: Boolean, default: false },
    addresses: [addressSchema],
    // OAuth provider IDs (optional; at least one of passwordHash or these must be set)
    googleId: { type: String, default: null, sparse: true, unique: true },
    facebookId: { type: String, default: null, sparse: true, unique: true },
    // Password reset
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
  },
  { timestamps: true }
);

// Index already defined via `unique: true` on email field
userSchema.index({ resetPasswordToken: 1 }, { sparse: true });

export const UserModel = mongoose.model('User', userSchema);
