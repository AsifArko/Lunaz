import { Router } from 'express';
import multer from 'multer';
import { randomUUID } from 'crypto';
import { authMiddleware } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/requireRole.js';
import { validateBody } from '../../middleware/validate.js';
import { getConfig } from '../../config/index.js';
import { UserRole } from '@lunaz/types';
import { uploadToS3, extractKeyFromUrl, deleteFromS3 } from '../../lib/s3.js';
import { createCategorySchema, updateCategorySchema } from './categories.validation.js';
import * as categoryService from './categories.service.js';
import { CategoryModel } from './categories.model.js';

const router = Router();
const getConfigFn = getConfig;
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB

// GET /categories — public list (with optional counts)
router.get('/', async (req, res, next) => {
  try {
    const withCounts = req.query.withCounts === 'true';
    const data = withCounts
      ? await categoryService.getCategoriesWithCounts()
      : await categoryService.getAllCategories();
    res.json({ data });
  } catch (e) {
    next(e);
  }
});

// GET /categories/tree — public nested tree
router.get('/tree', async (_req, res, next) => {
  try {
    const categories = await categoryService.getCategoryTree();
    res.json({ categories });
  } catch (e) {
    next(e);
  }
});

// POST /categories/:id/images — admin upload image(s) — stored in S3
router.post(
  '/:id/images',
  authMiddleware(getConfigFn),
  requireRole(UserRole.ADMIN),
  upload.array('images', 10),
  async (req, res, next) => {
    try {
      const cfg = getConfigFn();
      const doc = await CategoryModel.findById(req.params.id);
      if (!doc) {
        res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Category not found' } });
        return;
      }

      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        res.status(400).json({ error: { code: 'NO_FILES', message: 'No files uploaded' } });
        return;
      }

      const uploadedImages: { id: string; url: string; order: number }[] = [];
      const currentMaxOrder = (doc.images ?? []).reduce((max, img) => Math.max(max, img.order), 0);

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const mimetype = file.mimetype || 'image/jpeg';
        const result = await uploadToS3(
          cfg,
          file.buffer,
          mimetype,
          'categories',
          doc._id.toString()
        );

        if (!result) {
          res.status(503).json({
            error: {
              code: 'UPLOAD_UNAVAILABLE',
              message:
                'File upload is not configured. Set S3_BUCKET, S3_REGION, AWS_ACCESS_KEY_ID, and AWS_SECRET_ACCESS_KEY in environment.',
            },
          });
          return;
        }

        const image = {
          id: randomUUID(),
          url: result.url,
          order: currentMaxOrder + i + 1,
        };
        doc.images = doc.images ?? [];
        doc.images.push(image);
        uploadedImages.push(image);
      }

      await doc.save();
      res.status(201).json({ images: uploadedImages });
    } catch (e) {
      next(e);
    }
  }
);

// POST /categories/:id/images/url — admin add image via URL (fetched and stored in S3)
router.post(
  '/:id/images/url',
  authMiddleware(getConfigFn),
  requireRole(UserRole.ADMIN),
  async (req, res, next) => {
    try {
      const cfg = getConfigFn();
      const doc = await CategoryModel.findById(req.params.id);
      if (!doc) {
        res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Category not found' } });
        return;
      }

      const { url } = req.body;
      if (!url || typeof url !== 'string') {
        res.status(400).json({ error: { code: 'INVALID_URL', message: 'URL is required' } });
        return;
      }

      try {
        new URL(url);
      } catch {
        res.status(400).json({ error: { code: 'INVALID_URL', message: 'Invalid URL format' } });
        return;
      }

      const response = await fetch(url);
      if (!response.ok) {
        res.status(400).json({
          error: { code: 'FETCH_FAILED', message: 'Failed to fetch image from URL' },
        });
        return;
      }
      const buffer = Buffer.from(await response.arrayBuffer());
      const contentType = response.headers.get('content-type') || 'image/jpeg';

      const result = await uploadToS3(cfg, buffer, contentType, 'categories', doc._id.toString());

      if (!result) {
        res.status(503).json({
          error: {
            code: 'UPLOAD_UNAVAILABLE',
            message:
              'File upload is not configured. Set S3_BUCKET, S3_REGION, AWS_ACCESS_KEY_ID, and AWS_SECRET_ACCESS_KEY in environment.',
          },
        });
        return;
      }

      const currentMaxOrder = (doc.images ?? []).reduce((max, img) => Math.max(max, img.order), 0);
      const image = {
        id: randomUUID(),
        url: result.url,
        order: currentMaxOrder + 1,
      };
      doc.images = doc.images ?? [];
      doc.images.push(image);

      await doc.save();
      res.status(201).json({ image });
    } catch (e) {
      next(e);
    }
  }
);

// DELETE /categories/:id/images/:imageId — admin delete image
router.delete(
  '/:id/images/:imageId',
  authMiddleware(getConfigFn),
  requireRole(UserRole.ADMIN),
  async (req, res, next) => {
    try {
      const cfg = getConfigFn();
      const doc = await CategoryModel.findById(req.params.id);
      if (!doc) {
        res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Category not found' } });
        return;
      }

      const imgIndex = (doc.images ?? []).findIndex((img) => img.id === req.params.imageId);
      if (imgIndex === -1) {
        res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Image not found' } });
        return;
      }

      const img = doc.images![imgIndex];
      const key = extractKeyFromUrl(cfg, img.url);
      if (key) {
        await deleteFromS3(cfg, key);
      }

      doc.images!.splice(imgIndex, 1);
      await doc.save();
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  }
);

// GET /categories/:id — public single (by id or slug)
router.get('/:id', async (req, res, next) => {
  try {
    const category = await categoryService.getCategoryByIdOrSlug(req.params.id);
    if (!category) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Category not found' } });
      return;
    }
    res.json(category);
  } catch (e) {
    next(e);
  }
});

// GET /categories/:id/children — public children of category
router.get('/:id/children', async (req, res, next) => {
  try {
    const children = await categoryService.getCategoryChildren(req.params.id);
    res.json({ data: children });
  } catch (e) {
    next(e);
  }
});

// POST /categories — admin create
router.post(
  '/',
  authMiddleware(getConfigFn),
  requireRole(UserRole.ADMIN),
  validateBody(createCategorySchema),
  async (req, res, next) => {
    try {
      const created = await categoryService.createCategory(req.body);
      res.status(201).json(created);
    } catch (e) {
      next(e);
    }
  }
);

// PATCH /categories/:id — admin update
router.patch(
  '/:id',
  authMiddleware(getConfigFn),
  requireRole(UserRole.ADMIN),
  validateBody(updateCategorySchema),
  async (req, res, next) => {
    try {
      const updated = await categoryService.updateCategory(req.params.id, req.body);
      if (!updated) {
        res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Category not found' } });
        return;
      }
      res.json(updated);
    } catch (e) {
      next(e);
    }
  }
);

// DELETE /categories/:id — admin delete (removes images from S3)
router.delete(
  '/:id',
  authMiddleware(getConfigFn),
  requireRole(UserRole.ADMIN),
  async (req, res, next) => {
    try {
      const cfg = getConfigFn();
      const doc = await CategoryModel.findById(req.params.id);
      if (!doc) {
        res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Category not found' } });
        return;
      }

      const hasKids = await categoryService.hasChildren(req.params.id);
      if (hasKids) {
        res.status(400).json({
          error: {
            code: 'HAS_CHILDREN',
            message: 'Cannot delete category with children. Delete or reassign children first.',
          },
        });
        return;
      }

      for (const img of doc.images ?? []) {
        const key = extractKeyFromUrl(cfg, img.url);
        if (key) {
          await deleteFromS3(cfg, key).catch(() => {});
        }
      }

      const deleted = await categoryService.deleteCategory(req.params.id);
      if (!deleted) {
        res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Category not found' } });
        return;
      }
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  }
);

export const categoriesRoutes = router;
