import bcrypt from 'bcrypt';
import crypto from 'crypto';
import type { UserSummary } from '@lunaz/types';
import { UserRole } from '@lunaz/types';
import { UserModel } from './auth.model.js';
import type {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from './auth.validation.js';
import { signToken } from '../../lib/jwt.js';
import type { BackendEnv } from '@lunaz/config';

function createError(message: string, statusCode: number): Error & { statusCode: number } {
  const err = new Error(message) as Error & { statusCode: number };
  err.statusCode = statusCode;
  return err;
}

export async function register(
  input: RegisterInput,
  getConfig: () => BackendEnv
): Promise<{ user: UserSummary; token: string }> {
  const existing = await UserModel.findOne({ email: input.email.toLowerCase() });
  if (existing) {
    throw createError('Email already registered', 409);
  }
  const hash = await bcrypt.hash(input.password, 10);
  const user = await UserModel.create({
    email: input.email.toLowerCase(),
    passwordHash: hash,
    name: input.name,
    phone: input.phone,
    role: UserRole.CUSTOMER,
  });
  const summary: UserSummary = {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role,
  };
  const token = signToken(summary, getConfig().JWT_SECRET, getConfig().JWT_EXPIRES_IN);
  return { user: summary, token };
}

export async function login(
  input: LoginInput,
  getConfig: () => BackendEnv
): Promise<{ user: UserSummary; token: string }> {
  const user = await UserModel.findOne({ email: input.email.toLowerCase() });
  if (!user) {
    throw createError('Invalid email or password', 401);
  }
  const ok = await bcrypt.compare(input.password, user.passwordHash);
  if (!ok) {
    throw createError('Invalid email or password', 401);
  }
  const summary: UserSummary = {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role,
  };
  const token = signToken(summary, getConfig().JWT_SECRET, getConfig().JWT_EXPIRES_IN);
  return { user: summary, token };
}

/**
 * Request password reset - generates token and returns it.
 * In production, this would send an email instead of returning the token.
 */
export async function forgotPassword(
  input: ForgotPasswordInput
): Promise<{ message: string; token?: string }> {
  const user = await UserModel.findOne({ email: input.email.toLowerCase() });

  // Always return success to prevent email enumeration
  if (!user) {
    return { message: 'If an account exists with that email, a reset link has been sent.' };
  }

  // Generate secure random token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  // Save hashed token with expiration (1 hour)
  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
  await user.save();

  // In production: send email with reset link containing resetToken
  // For development, we return the token (remove in production!)
  const isDev = process.env.NODE_ENV !== 'production';

  return {
    message: 'If an account exists with that email, a reset link has been sent.',
    ...(isDev && { token: resetToken }), // Only in development
  };
}

/**
 * Reset password using token.
 */
export async function resetPassword(
  input: ResetPasswordInput
): Promise<{ success: boolean; message: string }> {
  // Hash the provided token to compare with stored hash
  const hashedToken = crypto.createHash('sha256').update(input.token).digest('hex');

  const user = await UserModel.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: new Date() },
  });

  if (!user) {
    throw createError('Invalid or expired reset token', 400);
  }

  // Update password and clear reset token
  user.passwordHash = await bcrypt.hash(input.password, 10);
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  await user.save();

  return { success: true, message: 'Password has been reset successfully.' };
}

/**
 * Validate reset token without using it.
 */
export async function validateResetToken(token: string): Promise<{ valid: boolean }> {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await UserModel.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: new Date() },
  });

  return { valid: !!user };
}
