import { Router } from 'express';
import {
  register,
  login,
  forgotPassword,
  resetPassword,
  validateResetToken,
  refresh,
  logout,
  listSessions,
  revokeSession,
  oauthGoogle,
  oauthFacebook,
} from './auth.service.js';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  validateTokenSchema,
  refreshSchema,
  logoutSchema,
  oauthGoogleSchema,
  oauthFacebookSchema,
} from './auth.validation.js';
import type { Request, Response, NextFunction } from 'express';
import { validateBody } from '../../middleware/validate.js';
import { authMiddleware } from '../../middleware/auth.js';
import { getConfig } from '../../config/index.js';

const router = Router();
const getConfigFn = getConfig;

function authMeta(req: { ip?: string; get?: (name: string) => string | undefined }) {
  return {
    ip: req.ip ?? req.get?.('x-forwarded-for')?.split(',')[0]?.trim() ?? undefined,
    userAgent: req.get?.('user-agent') ?? undefined,
  };
}

/** Merge code/redirectUri from query into body (this middleware only runs for POST /oauth/google) */
function mergeOAuthQueryIntoBody(req: Request, _res: Response, next: NextFunction): void {
  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const q = req.query as Record<string, string | undefined>;
  const code = body.code ?? q.code;
  const redirectUri = body.redirectUri ?? body.redirect_uri ?? q.redirectUri ?? q.redirect_uri;
  req.body = {
    ...body,
    ...(typeof code === 'string' && { code }),
    ...(typeof redirectUri === 'string' && { redirectUri }),
  };
  next();
}

// POST /auth/register
router.post('/register', validateBody(registerSchema), async (req, res, next) => {
  try {
    const result = await register(req.body, getConfigFn, authMeta(req));
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
});

// POST /auth/login
router.post('/login', validateBody(loginSchema), async (req, res, next) => {
  try {
    const result = await login(req.body, getConfigFn, authMeta(req));
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// POST /auth/refresh
router.post('/refresh', validateBody(refreshSchema), async (req, res, next) => {
  try {
    const result = await refresh(req.body.refreshToken, getConfigFn, authMeta(req));
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// POST /auth/logout
router.post('/logout', validateBody(logoutSchema), async (req, res, next) => {
  try {
    await logout(req.body.refreshToken, authMeta(req));
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
});

// POST /auth/oauth/google — body or query: { credential } (One Tap) or { code, redirectUri } (redirect flow); optional phone
router.post(
  '/oauth/google',
  mergeOAuthQueryIntoBody,
  validateBody(oauthGoogleSchema),
  async (req, res, next) => {
    try {
      const result = await oauthGoogle(
        {
          credential: req.body.credential,
          code: req.body.code,
          redirectUri: req.body.redirectUri,
          phone: req.body.phone,
        },
        getConfigFn,
        authMeta(req)
      );
      res.json(result);
    } catch (e) {
      next(e);
    }
  }
);

// POST /auth/oauth/facebook — frontend sends credential = accessToken from FB SDK
router.post('/oauth/facebook', validateBody(oauthFacebookSchema), async (req, res, next) => {
  try {
    const result = await oauthFacebook(
      req.body.credential,
      req.body.phone,
      getConfigFn,
      authMeta(req)
    );
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// GET /auth/me
router.get('/me', authMiddleware(getConfigFn), (req, res) => {
  res.json({ user: req.user });
});

// POST /auth/forgot-password
router.post('/forgot-password', validateBody(forgotPasswordSchema), async (req, res, next) => {
  try {
    const result = await forgotPassword(req.body);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// POST /auth/reset-password
router.post('/reset-password', validateBody(resetPasswordSchema), async (req, res, next) => {
  try {
    const result = await resetPassword(req.body);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// POST /auth/validate-reset-token
router.post('/validate-reset-token', validateBody(validateTokenSchema), async (req, res, next) => {
  try {
    const result = await validateResetToken(req.body.token);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// GET /auth/sessions — list active sessions (devices) for current user
router.get('/sessions', authMiddleware(getConfigFn), async (req, res, next) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
    }
    const sessions = await listSessions(req.user.id);
    res.json({ sessions });
  } catch (e) {
    next(e);
  }
});

// POST /auth/sessions/:id/revoke — revoke a session (log out device)
router.post('/sessions/:id/revoke', authMiddleware(getConfigFn), async (req, res, next) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
    }
    const revoked = await revokeSession(req.params.id, req.user.id, authMeta(req));
    if (!revoked) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Session not found' } });
    }
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
});

export const authRoutes = router;
