import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import type { UserSummary } from 'types';

export function signToken(payload: UserSummary, secret: string, expiresIn: string): string {
  return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
}

export function verifyToken(token: string, secret: string): UserSummary {
  const decoded = jwt.verify(token, secret) as jwt.JwtPayload & UserSummary;
  return { id: decoded.id, email: decoded.email, name: decoded.name, role: decoded.role };
}

/** Generate a random opaque refresh token and its hash for storage. */
export function generateRefreshToken(): { token: string; hash: string } {
  const token = crypto.randomBytes(32).toString('hex');
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  return { token, hash };
}

/** Hash a refresh token for lookup (e.g. when client sends it back). */
export function hashRefreshToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
