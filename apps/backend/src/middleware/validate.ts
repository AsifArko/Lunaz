import type { Request, Response, NextFunction } from 'express';
import type { z } from 'zod';

export function validateBody(schema: z.ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Check if schema wraps body in { body: ... } structure
    // This is determined by checking if the schema's shape has a 'body' key
    // and that 'body' is itself a Zod schema (has safeParse method)
    const schemaShape = (schema as z.ZodObject<any>).shape;
    const isWrappedSchema =
      schemaShape && 'body' in schemaShape && typeof schemaShape.body?.safeParse === 'function';

    if (isWrappedSchema) {
      // Schema wraps body, parse { body: req.body }
      const parsed = schema.safeParse({ body: req.body });
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
      req.body = (parsed.data as { body: unknown }).body;
    } else {
      // Direct body schema
      const parsed = schema.safeParse(req.body);
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
