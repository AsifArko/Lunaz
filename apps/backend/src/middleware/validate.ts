import type { Request, Response, NextFunction } from 'express';
import type { z } from 'zod';

function hasWrappedBodyShape(s: z.ZodTypeAny): boolean {
  // ZodObject has .shape with body key
  const shape = (s as z.ZodObject<z.ZodRawShape>).shape as Record<string, unknown> | undefined;
  if (
    shape &&
    'body' in shape &&
    typeof (shape.body as { safeParse?: unknown })?.safeParse === 'function'
  ) {
    return true;
  }
  // ZodEffects (e.g. .refine()) has _def.innerType — check the inner schema
  const inner = (s as { _def?: { innerType?: z.ZodTypeAny } })._def?.innerType;
  return inner ? hasWrappedBodyShape(inner) : false;
}

export function validateBody(schema: z.ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const isWrappedSchema = hasWrappedBodyShape(schema);

    if (isWrappedSchema) {
      // Normalize missing body so we get a clearer validation error instead of "body: Required"
      const rawBody = req.body !== undefined && req.body !== null ? req.body : {};
      const parsed = schema.safeParse({ body: rawBody });
      if (!parsed.success) {
        const flattened = parsed.error.flatten();
        const bodyErrors = flattened.fieldErrors?.body;
        const bodyArr = Array.isArray(bodyErrors) ? bodyErrors : undefined;
        const firstBodyMsg = bodyArr?.[0] != null ? String(bodyArr[0]) : undefined;
        const isMissingBody =
          Object.keys(rawBody).length === 0 &&
          (bodyArr?.some((m) => String(m).toLowerCase().includes('required')) ?? false);
        const message = isMissingBody
          ? 'Request body is required. Send JSON with "credential" (One Tap) or "code" and "redirectUri" (redirect flow).'
          : (firstBodyMsg ?? 'Validation failed');
        res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message,
            details: flattened,
          },
        });
        return;
      }
      req.body = (parsed.data as { body: unknown }).body;
    } else {
      // Direct body schema
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        const flattened = parsed.error.flatten();
        const firstFieldError = Object.values(flattened.fieldErrors || {}).flat()[0];
        const message = typeof firstFieldError === 'string' ? firstFieldError : 'Validation failed';
        res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message,
            details: flattened,
          },
        });
        return;
      }
      req.body = parsed.data;
    }
    next();
  };
}

export function validateQuery(schema: z.ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Query validation failed',
          details: parsed.error.flatten(),
        },
      });
      return;
    }
    req.query = parsed.data;
    next();
  };
}

export function validateParams(schema: z.ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse(req.params);
    if (!parsed.success) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Params validation failed',
          details: parsed.error.flatten(),
        },
      });
      return;
    }
    req.params = parsed.data;
    next();
  };
}
