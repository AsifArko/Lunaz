import jwt from 'jsonwebtoken';
import type { UserSummary } from '@lunaz/types';

export function signToken(payload: UserSummary, secret: string, expiresIn: string): string {
  return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
}

export function verifyToken(token: string, secret: string): UserSummary {
  const decoded = jwt.verify(token, secret) as jwt.JwtPayload & UserSummary;
  return { id: decoded.id, email: decoded.email, name: decoded.name, role: decoded.role };
}
