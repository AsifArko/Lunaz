import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().min(1),
    phone: z
      .string()
      .min(11, 'Phone number must be at least 11 digits')
      .regex(/^(\+?88)?01[3-9]\d{8}$/, 'Please enter a valid Bangladeshi phone number'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1),
    password: z.string().min(8),
  }),
});

export const validateTokenSchema = z.object({
  body: z.object({
    token: z.string().min(1),
  }),
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1),
  }),
});

export const logoutSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1),
  }),
});

/** Direct body schema (no top-level "body" wrapper) so validateBody parses req.body as-is after merge. */
export const oauthGoogleSchema = z
  .object({
    credential: z.string().min(1).optional(),
    code: z.string().min(1).optional(),
    redirectUri: z.string().min(1).optional(),
    redirect_uri: z.string().min(1).optional(),
    phone: z.string().optional(),
  })
  .transform((b) => ({
    ...b,
    redirectUri: b.redirectUri ?? b.redirect_uri,
  }))
  .refine(
    (data) =>
      (data.credential != null && data.credential !== '') ||
      (data.code != null &&
        data.code !== '' &&
        data.redirectUri != null &&
        data.redirectUri !== ''),
    { message: 'Either credential or (code + redirectUri) is required' }
  );

export const oauthFacebookSchema = z.object({
  body: z.object({
    credential: z.string().min(1),
    phone: z.string().optional(),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>['body'];
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>['body'];
