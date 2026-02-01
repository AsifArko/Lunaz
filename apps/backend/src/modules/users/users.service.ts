import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { UserModel } from '../auth/auth.model.js';
import type {
  UpdateProfileInput,
  ChangePasswordInput,
  CreateAddressInput,
  UpdateAddressInput,
} from './users.validation.js';

function createError(message: string, statusCode: number): Error & { statusCode: number } {
  const err = new Error(message) as Error & { statusCode: number };
  err.statusCode = statusCode;
  return err;
}

export async function getProfile(userId: string) {
  const user = await UserModel.findById(userId).select('-passwordHash').lean();
  if (!user) throw createError('User not found', 404);
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role,
    emailVerified: user.emailVerified,
    addresses: (user.addresses ?? []).map((a) => {
      const addr = a as unknown as Record<string, unknown>;
      return {
        id: (addr._id as mongoose.Types.ObjectId).toString(),
        label: addr.label,
        line1: addr.line1,
        line2: addr.line2,
        city: addr.city,
        state: addr.state,
        postalCode: addr.postalCode,
        country: addr.country,
        isDefault: addr.isDefault,
      };
    }),
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export async function updateProfile(userId: string, input: UpdateProfileInput) {
  const update: Record<string, unknown> = {};
  if (input.name) update.name = input.name;
  if (input.email) {
    const existing = await UserModel.findOne({
      email: input.email.toLowerCase(),
      _id: { $ne: userId },
    });
    if (existing) throw createError('Email already in use', 409);
    update.email = input.email.toLowerCase();
  }
  const user = await UserModel.findByIdAndUpdate(userId, { $set: update }, { new: true }).select(
    '-passwordHash'
  );
  if (!user) throw createError('User not found', 404);
  return getProfile(userId);
}

export async function changePassword(userId: string, input: ChangePasswordInput) {
  const user = await UserModel.findById(userId);
  if (!user) throw createError('User not found', 404);
  const valid = await bcrypt.compare(input.currentPassword, user.passwordHash);
  if (!valid) throw createError('Current password is incorrect', 401);
  user.passwordHash = await bcrypt.hash(input.newPassword, 10);
  await user.save();
  return { success: true };
}

export async function listAddresses(userId: string) {
  const user = await UserModel.findById(userId).select('addresses').lean();
  if (!user) throw createError('User not found', 404);
  return (user.addresses ?? []).map((a) => {
    const addr = a as unknown as Record<string, unknown>;
    return {
      id: (addr._id as mongoose.Types.ObjectId).toString(),
      label: addr.label,
      line1: addr.line1,
      line2: addr.line2,
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      country: addr.country,
      isDefault: addr.isDefault,
    };
  });
}

export async function addAddress(userId: string, input: CreateAddressInput) {
  const user = await UserModel.findById(userId);
  if (!user) throw createError('User not found', 404);

  // If this is the first address or marked default, clear other defaults
  if (input.isDefault || !user.addresses?.length) {
    user.addresses?.forEach((a) => (a.isDefault = false));
    input.isDefault = true;
  }

  user.addresses = user.addresses ?? [];
  user.addresses.push(input as never);
  await user.save();

  const newAddr = user.addresses[user.addresses.length - 1] as unknown as Record<string, unknown>;
  return {
    id: (newAddr._id as mongoose.Types.ObjectId).toString(),
    label: newAddr.label,
    line1: newAddr.line1,
    line2: newAddr.line2,
    city: newAddr.city,
    state: newAddr.state,
    postalCode: newAddr.postalCode,
    country: newAddr.country,
    isDefault: newAddr.isDefault,
  };
}

export async function updateAddress(userId: string, addressId: string, input: UpdateAddressInput) {
  const user = await UserModel.findById(userId);
  if (!user) throw createError('User not found', 404);

  const addr = user.addresses?.id(addressId);
  if (!addr) throw createError('Address not found', 404);

  Object.assign(addr, input);
  await user.save();

  return {
    id: addr._id.toString(),
    label: addr.label,
    line1: addr.line1,
    line2: addr.line2,
    city: addr.city,
    state: addr.state,
    postalCode: addr.postalCode,
    country: addr.country,
    isDefault: addr.isDefault,
  };
}

export async function deleteAddress(userId: string, addressId: string) {
  const user = await UserModel.findById(userId);
  if (!user) throw createError('User not found', 404);

  const addr = user.addresses?.id(addressId);
  if (!addr) throw createError('Address not found', 404);

  const wasDefault = addr.isDefault;
  addr.deleteOne();

  // If deleted was default, set first remaining as default
  if (wasDefault && user.addresses?.length) {
    user.addresses[0].isDefault = true;
  }
  await user.save();
  return { success: true };
}

export async function setDefaultAddress(userId: string, addressId: string) {
  const user = await UserModel.findById(userId);
  if (!user) throw createError('User not found', 404);

  const addr = user.addresses?.id(addressId);
  if (!addr) throw createError('Address not found', 404);

  user.addresses?.forEach((a) => (a.isDefault = false));
  addr.isDefault = true;
  await user.save();

  return {
    id: addr._id.toString(),
    label: addr.label,
    line1: addr.line1,
    line2: addr.line2,
    city: addr.city,
    state: addr.state,
    postalCode: addr.postalCode,
    country: addr.country,
    isDefault: addr.isDefault,
  };
}
