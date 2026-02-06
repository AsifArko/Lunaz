import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import type { UserSummary } from '@lunaz/types';
import { UserRole } from '@lunaz/types';
import { UserModel } from './auth.model.js';
import { AuthSessionModel } from './auth-session.model.js';
import { AuthLogModel, AuthLogEvent, AuthLogMethod } from './auth-log.model.js';
import type {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from './auth.validation.js';
import { signToken, generateRefreshToken, hashRefreshToken } from '../../lib/jwt.js';
import type { BackendEnv } from '@lunaz/config';

/** Placeholder phone for OAuth users until they set a real one (required for orders). */
export const OAUTH_PENDING_PHONE = '__OAUTH_PENDING__';

export interface AuthMeta {
  ip?: string;
  userAgent?: string;
}

function createError(message: string, statusCode: number): Error & { statusCode: number } {
  const err = new Error(message) as Error & { statusCode: number };
  err.statusCode = statusCode;
  return err;
}

export async function logAuthEvent(params: {
  userId?: string;
  event: (typeof AuthLogEvent)[keyof typeof AuthLogEvent];
  method?: (typeof AuthLogMethod)[keyof typeof AuthLogMethod];
  ip?: string;
  userAgent?: string;
  success: boolean;
  reason?: string;
}): Promise<void> {
  await AuthLogModel.create({
    userId: params.userId,
    event: params.event,
    method: params.method,
    ip: params.ip ?? '',
    userAgent: params.userAgent ?? '',
    success: params.success,
    reason: params.reason,
  });
}

async function createSession(userId: string, meta: AuthMeta): Promise<{ refreshToken: string }> {
  const { token: refreshToken, hash } = generateRefreshToken();
  await AuthSessionModel.create({
    userId,
    refreshTokenHash: hash,
    userAgent: meta.userAgent ?? '',
    ip: meta.ip ?? '',
    lastUsedAt: new Date(),
  });
  return { refreshToken };
}

export async function register(
  input: RegisterInput,
  getConfig: () => BackendEnv,
  meta: AuthMeta = {}
): Promise<{ user: UserSummary; token: string; refreshToken: string; expiresIn?: string }> {
  const existing = await UserModel.findOne({ email: input.email.toLowerCase() });
  if (existing) {
    await logAuthEvent({
      event: AuthLogEvent.REGISTER,
      method: AuthLogMethod.PASSWORD,
      success: false,
      reason: 'Email already registered',
      ...meta,
    });
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
  const { refreshToken } = await createSession(user._id.toString(), meta);
  await logAuthEvent({
    userId: user._id.toString(),
    event: AuthLogEvent.REGISTER,
    method: AuthLogMethod.PASSWORD,
    success: true,
    ...meta,
  });
  return {
    user: summary,
    token,
    refreshToken,
    expiresIn: getConfig().JWT_EXPIRES_IN,
  };
}

export async function login(
  input: LoginInput,
  getConfig: () => BackendEnv,
  meta: AuthMeta = {}
): Promise<{ user: UserSummary; token: string; refreshToken: string; expiresIn?: string }> {
  const user = await UserModel.findOne({ email: input.email.toLowerCase() });
  if (!user) {
    await logAuthEvent({
      event: AuthLogEvent.LOGIN_FAILED,
      method: AuthLogMethod.PASSWORD,
      success: false,
      reason: 'User not found',
      ...meta,
    });
    throw createError('Invalid email or password', 401);
  }
  if (!user.passwordHash) {
    await logAuthEvent({
      userId: user._id.toString(),
      event: AuthLogEvent.LOGIN_FAILED,
      method: AuthLogMethod.PASSWORD,
      success: false,
      reason: 'Password not set (OAuth account)',
      ...meta,
    });
    throw createError('Invalid email or password', 401);
  }
  const ok = await bcrypt.compare(input.password, user.passwordHash);
  if (!ok) {
    await logAuthEvent({
      userId: user._id.toString(),
      event: AuthLogEvent.LOGIN_FAILED,
      method: AuthLogMethod.PASSWORD,
      success: false,
      reason: 'Invalid password',
      ...meta,
    });
    throw createError('Invalid email or password', 401);
  }
  const summary: UserSummary = {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role,
  };
  const token = signToken(summary, getConfig().JWT_SECRET, getConfig().JWT_EXPIRES_IN);
  const { refreshToken } = await createSession(user._id.toString(), meta);
  await logAuthEvent({
    userId: user._id.toString(),
    event: AuthLogEvent.LOGIN,
    method: AuthLogMethod.PASSWORD,
    success: true,
    ...meta,
  });
  return {
    user: summary,
    token,
    refreshToken,
    expiresIn: getConfig().JWT_EXPIRES_IN,
  };
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

/**
 * Refresh access token using a valid refresh token.
 */
export async function refresh(
  refreshToken: string,
  getConfig: () => BackendEnv,
  meta: AuthMeta = {}
): Promise<{ user: UserSummary; token: string; refreshToken: string; expiresIn?: string }> {
  const hash = hashRefreshToken(refreshToken);
  const session = await AuthSessionModel.findOne({
    refreshTokenHash: hash,
    revokedAt: null,
  }).exec();
  if (!session) {
    await logAuthEvent({
      event: AuthLogEvent.REFRESH_FAILED,
      success: false,
      reason: 'Invalid or revoked refresh token',
      ...meta,
    });
    throw createError('Invalid or expired refresh token', 401);
  }
  const user = await UserModel.findById(session.userId);
  if (!user) {
    session.revokedAt = new Date();
    await session.save();
    await logAuthEvent({
      event: AuthLogEvent.REFRESH_FAILED,
      success: false,
      reason: 'User not found',
      ...meta,
    });
    throw createError('Invalid or expired refresh token', 401);
  }
  session.lastUsedAt = new Date();
  await session.save();
  const summary: UserSummary = {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role,
  };
  const token = signToken(summary, getConfig().JWT_SECRET, getConfig().JWT_EXPIRES_IN);
  await logAuthEvent({
    userId: user._id.toString(),
    event: AuthLogEvent.REFRESH,
    success: true,
    ...meta,
  });
  return {
    user: summary,
    token,
    refreshToken,
    expiresIn: getConfig().JWT_EXPIRES_IN,
  };
}

/**
 * Logout: revoke the session for the given refresh token.
 */
export async function logout(refreshToken: string, meta: AuthMeta = {}): Promise<void> {
  const hash = hashRefreshToken(refreshToken);
  const session = await AuthSessionModel.findOne({
    refreshTokenHash: hash,
    revokedAt: null,
  }).exec();
  if (session) {
    session.revokedAt = new Date();
    await session.save();
    await logAuthEvent({
      userId: session.userId.toString(),
      event: AuthLogEvent.LOGOUT,
      success: true,
      ...meta,
    });
  }
}

/**
 * List active sessions for a user (for "logged-in devices" UI).
 */
export async function listSessions(userId: string): Promise<
  Array<{
    id: string;
    userAgent: string;
    ip: string;
    deviceLabel: string;
    lastUsedAt: Date;
    createdAt: Date;
  }>
> {
  const sessions = await AuthSessionModel.find({
    userId,
    revokedAt: null,
  })
    .sort({ lastUsedAt: -1 })
    .lean()
    .exec();
  return sessions.map((s) => ({
    id: s._id.toString(),
    userAgent: s.userAgent ?? '',
    ip: s.ip ?? '',
    deviceLabel: s.deviceLabel ?? '',
    lastUsedAt: s.lastUsedAt,
    createdAt: s.createdAt,
  }));
}

/**
 * Revoke a session by id; only if it belongs to the given user.
 */
export async function revokeSession(
  sessionId: string,
  userId: string,
  meta: AuthMeta = {}
): Promise<boolean> {
  const session = await AuthSessionModel.findOne({
    _id: sessionId,
    userId,
    revokedAt: null,
  }).exec();
  if (!session) return false;
  session.revokedAt = new Date();
  await session.save();
  await logAuthEvent({
    userId,
    event: AuthLogEvent.LOGOUT,
    success: true,
    reason: 'Session revoked by user',
    ...meta,
  });
  return true;
}

/** Google ID token payload from verifyIdToken */
interface GoogleTokenPayload {
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
}

async function verifyGoogleIdToken(
  credential: string,
  clientId: string
): Promise<GoogleTokenPayload> {
  const client = new OAuth2Client(clientId);
  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: clientId,
  });
  const payload = ticket.getPayload();
  if (!payload?.sub) {
    throw createError('Invalid Google credential', 401);
  }
  return {
    sub: payload.sub,
    email: payload.email,
    email_verified: payload.email_verified,
    name: payload.name,
  };
}

/** Exchange authorization code for tokens; returns id_token for verification. */
async function exchangeGoogleCodeForIdToken(
  code: string,
  redirectUri: string,
  clientId: string,
  clientSecret: string
): Promise<string> {
  const client = new OAuth2Client(clientId, clientSecret, redirectUri);
  const { tokens } = await client.getToken({ code });
  const idToken = tokens.id_token;
  if (!idToken) {
    throw createError('Google did not return an ID token', 401);
  }
  return idToken;
}

/** Facebook Graph API me response */
interface FacebookMeResponse {
  id: string;
  email?: string;
  name?: string;
}

async function verifyFacebookAccessToken(
  accessToken: string,
  _appId: string,
  appSecret: string
): Promise<FacebookMeResponse> {
  const appSecretProof = crypto.createHmac('sha256', appSecret).update(accessToken).digest('hex');
  const url = new URL('https://graph.facebook.com/v18.0/me');
  url.searchParams.set('fields', 'id,email,name');
  url.searchParams.set('access_token', accessToken);
  url.searchParams.set('appsecret_proof', appSecretProof);
  const res = await fetch(url.toString());
  if (!res.ok) {
    throw createError('Invalid Facebook token', 401);
  }
  const data = (await res.json()) as FacebookMeResponse;
  if (!data?.id) {
    throw createError('Invalid Facebook token', 401);
  }
  return data;
}

export type OAuthResult =
  | {
      requiresPhone: true;
      user: UserSummary;
      token: string;
      refreshToken: string;
      expiresIn?: string;
    }
  | { user: UserSummary; token: string; refreshToken: string; expiresIn?: string };

/**
 * Google OAuth: verify ID token (or exchange code for id_token), find or create user, create session.
 * If new user and no phone provided, return requiresPhone and placeholder user; frontend should collect phone and PATCH /users/me.
 * Accepts either credential (ID token from One Tap) or code + redirectUri (redirect flow).
 */
export async function oauthGoogle(
  input: { credential?: string; code?: string; redirectUri?: string; phone?: string },
  getConfig: () => BackendEnv,
  meta: AuthMeta = {}
): Promise<OAuthResult> {
  const config = getConfig() as BackendEnv & {
    GOOGLE_CLIENT_ID?: string;
    GOOGLE_CLIENT_SECRET?: string;
  };
  const clientId = config.GOOGLE_CLIENT_ID;
  if (!clientId) {
    await logAuthEvent({
      event: AuthLogEvent.LOGIN_FAILED,
      method: AuthLogMethod.GOOGLE,
      success: false,
      reason: 'Google OAuth not configured',
      ...meta,
    });
    throw createError('Google OAuth is not configured', 503);
  }
  let idToken: string;
  if (input.credential) {
    idToken = input.credential;
  } else if (input.code && input.redirectUri) {
    const clientSecret = config.GOOGLE_CLIENT_SECRET;
    if (!clientSecret) {
      throw createError('Google OAuth client secret is required for code exchange', 503);
    }
    try {
      idToken = await exchangeGoogleCodeForIdToken(
        input.code,
        input.redirectUri,
        clientId,
        clientSecret
      );
    } catch (err) {
      const msg =
        err &&
        typeof err === 'object' &&
        'message' in err &&
        typeof (err as { message: string }).message === 'string'
          ? (err as { message: string }).message
          : '';
      const resData =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { error?: string; error_description?: string } } })
              .response?.data
          : undefined;
      const googleError = resData?.error ?? '';
      const googleDesc = resData?.error_description ?? '';
      const isRedirectMismatch =
        /redirect_uri_mismatch|redirect_uri/i.test(msg) || googleError === 'redirect_uri_mismatch';
      await logAuthEvent({
        event: AuthLogEvent.LOGIN_FAILED,
        method: AuthLogMethod.GOOGLE,
        success: false,
        reason: isRedirectMismatch
          ? 'redirect_uri_mismatch'
          : 'Invalid or expired authorization code',
        ...meta,
      });
      if (isRedirectMismatch) {
        const hint =
          googleDesc ||
          `Add this exact URI in Google Cloud Console → Credentials → your OAuth client → Authorized redirect URIs: ${input.redirectUri}`;
        throw createError(
          `Google redirect_uri_mismatch. ${hint}. If you use 127.0.0.1, add http://127.0.0.1:PORT/auth/google/callback as well.`,
          400
        );
      }
      const detail = googleDesc || msg || 'Invalid or expired authorization code';
      throw createError(detail, 401);
    }
  } else {
    throw createError('Either credential or code+redirectUri is required', 400);
  }
  let payload: GoogleTokenPayload;
  try {
    payload = await verifyGoogleIdToken(idToken, clientId);
  } catch {
    await logAuthEvent({
      event: AuthLogEvent.LOGIN_FAILED,
      method: AuthLogMethod.GOOGLE,
      success: false,
      reason: 'Invalid Google credential',
      ...meta,
    });
    throw createError('Invalid Google credential', 401);
  }
  const email = (payload.email ?? '').toLowerCase() || `${payload.sub}@google.oauth`;
  let user = await UserModel.findOne({ googleId: payload.sub }).exec();
  if (!user) {
    user = await UserModel.findOne({ email }).exec();
    if (user) {
      user.googleId = payload.sub;
      await user.save();
    }
  }
  if (!user) {
    const phoneToUse = input.phone?.trim() || OAUTH_PENDING_PHONE;
    if (!input.phone?.trim()) {
      user = await UserModel.create({
        email,
        name: payload.name ?? email.split('@')[0],
        phone: OAUTH_PENDING_PHONE,
        role: UserRole.CUSTOMER,
        googleId: payload.sub,
        emailVerified: payload.email_verified === true,
      });
      const summary: UserSummary = {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      };
      const token = signToken(summary, getConfig().JWT_SECRET, getConfig().JWT_EXPIRES_IN);
      const { refreshToken } = await createSession(user._id.toString(), meta);
      await logAuthEvent({
        userId: user._id.toString(),
        event: AuthLogEvent.LOGIN,
        method: AuthLogMethod.GOOGLE,
        success: true,
        ...meta,
      });
      return {
        requiresPhone: true,
        user: summary,
        token,
        refreshToken,
        expiresIn: getConfig().JWT_EXPIRES_IN,
      };
    }
    user = await UserModel.create({
      email,
      name: payload.name ?? email.split('@')[0],
      phone: phoneToUse,
      role: UserRole.CUSTOMER,
      googleId: payload.sub,
      emailVerified: payload.email_verified === true,
    });
  }
  const summary: UserSummary = {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role,
  };
  const token = signToken(summary, getConfig().JWT_SECRET, getConfig().JWT_EXPIRES_IN);
  const { refreshToken } = await createSession(user._id.toString(), meta);
  await logAuthEvent({
    userId: user._id.toString(),
    event: AuthLogEvent.LOGIN,
    method: AuthLogMethod.GOOGLE,
    success: true,
    ...meta,
  });
  return {
    user: summary,
    token,
    refreshToken,
    expiresIn: getConfig().JWT_EXPIRES_IN,
  };
}

/**
 * Facebook OAuth: verify access token, find or create user, create session.
 * Same phone handling as Google.
 */
export async function oauthFacebook(
  accessToken: string,
  phone: string | undefined,
  getConfig: () => BackendEnv,
  meta: AuthMeta = {}
): Promise<OAuthResult> {
  const appId = (
    getConfig() as BackendEnv & { FACEBOOK_APP_ID?: string; FACEBOOK_APP_SECRET?: string }
  ).FACEBOOK_APP_ID;
  const appSecret = (
    getConfig() as BackendEnv & { FACEBOOK_APP_ID?: string; FACEBOOK_APP_SECRET?: string }
  ).FACEBOOK_APP_SECRET;
  if (!appId || !appSecret) {
    await logAuthEvent({
      event: AuthLogEvent.LOGIN_FAILED,
      method: AuthLogMethod.FACEBOOK,
      success: false,
      reason: 'Facebook OAuth not configured',
      ...meta,
    });
    throw createError('Facebook OAuth is not configured', 503);
  }
  let fbUser: FacebookMeResponse;
  try {
    fbUser = await verifyFacebookAccessToken(accessToken, appId, appSecret);
  } catch {
    await logAuthEvent({
      event: AuthLogEvent.LOGIN_FAILED,
      method: AuthLogMethod.FACEBOOK,
      success: false,
      reason: 'Invalid Facebook token',
      ...meta,
    });
    throw createError('Invalid Facebook token', 401);
  }
  const email = (fbUser.email ?? '').toLowerCase() || `${fbUser.id}@facebook.oauth`;
  let user = await UserModel.findOne({ facebookId: fbUser.id }).exec();
  if (!user) {
    user = await UserModel.findOne({ email }).exec();
    if (user) {
      user.facebookId = fbUser.id;
      await user.save();
    }
  }
  if (!user) {
    if (!phone?.trim()) {
      user = await UserModel.create({
        email,
        name: fbUser.name ?? email.split('@')[0],
        phone: OAUTH_PENDING_PHONE,
        role: UserRole.CUSTOMER,
        facebookId: fbUser.id,
      });
      const summary: UserSummary = {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      };
      const token = signToken(summary, getConfig().JWT_SECRET, getConfig().JWT_EXPIRES_IN);
      const { refreshToken } = await createSession(user._id.toString(), meta);
      await logAuthEvent({
        userId: user._id.toString(),
        event: AuthLogEvent.LOGIN,
        method: AuthLogMethod.FACEBOOK,
        success: true,
        ...meta,
      });
      return {
        requiresPhone: true,
        user: summary,
        token,
        refreshToken,
        expiresIn: getConfig().JWT_EXPIRES_IN,
      };
    }
    user = await UserModel.create({
      email,
      name: fbUser.name ?? email.split('@')[0],
      phone: phone.trim(),
      role: UserRole.CUSTOMER,
      facebookId: fbUser.id,
    });
  }
  const summary: UserSummary = {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role,
  };
  const token = signToken(summary, getConfig().JWT_SECRET, getConfig().JWT_EXPIRES_IN);
  const { refreshToken } = await createSession(user._id.toString(), meta);
  await logAuthEvent({
    userId: user._id.toString(),
    event: AuthLogEvent.LOGIN,
    method: AuthLogMethod.FACEBOOK,
    success: true,
    ...meta,
  });
  return {
    user: summary,
    token,
    refreshToken,
    expiresIn: getConfig().JWT_EXPIRES_IN,
  };
}
