import type { Request, Response, NextFunction } from 'express';
import type { z } from 'zod';

export function validateBody(schema: { shape?: { body: z.ZodTypeAny }; body?: z.ZodTypeAny }) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const bodySchema = schema.shape?.body ?? schema.body;
    if (!bodySchema) throw new Error('validateBody: schema must have body or shape.body');
    const parsed = bodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: parsed.error.flatten(),
        },
      });
      return;
    }
    req.body = parsed.data;
    next();
  };
}
