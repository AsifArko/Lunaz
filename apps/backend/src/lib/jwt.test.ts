import { describe, it, expect } from 'vitest';
import { signToken, verifyToken, generateRefreshToken, hashRefreshToken } from './jwt.js';
import type { UserSummary } from '@lunaz/types';

const testUser: UserSummary = {
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  role: 'customer',
};

const secret = 'test-secret-min-32-characters-long';

describe('jwt', () => {
  describe('signToken', () => {
    it('returns a JWT string', () => {
      const token = signToken(testUser, secret, '1h');
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });
  });

  describe('verifyToken', () => {
    it('decodes a valid token back to user summary', () => {
      const token = signToken(testUser, secret, '1h');
      const decoded = verifyToken(token, secret);
      expect(decoded).toEqual(testUser);
    });

    it('throws for invalid token', () => {
      expect(() => verifyToken('invalid.token.here', secret)).toThrow();
    });

    it('throws for wrong secret', () => {
      const token = signToken(testUser, secret, '1h');
      expect(() => verifyToken(token, 'wrong-secret')).toThrow();
    });
  });

  describe('generateRefreshToken', () => {
    it('returns token and hash', () => {
      const { token, hash } = generateRefreshToken();
      expect(typeof token).toBe('string');
      expect(token).toHaveLength(64);
      expect(/^[a-f0-9]+$/.test(token)).toBe(true);
      expect(typeof hash).toBe('string');
      expect(hash).toHaveLength(64);
    });

    it('generates unique tokens each call', () => {
      const a = generateRefreshToken();
      const b = generateRefreshToken();
      expect(a.token).not.toBe(b.token);
      expect(a.hash).not.toBe(b.hash);
    });

    it('hash matches hashRefreshToken of the token', () => {
      const { token, hash } = generateRefreshToken();
      expect(hashRefreshToken(token)).toBe(hash);
    });
  });

  describe('hashRefreshToken', () => {
    it('returns consistent hash for same input', () => {
      const token = 'abc123';
      expect(hashRefreshToken(token)).toBe(hashRefreshToken(token));
    });

    it('returns different hash for different input', () => {
      expect(hashRefreshToken('a')).not.toBe(hashRefreshToken('b'));
    });
  });
});
