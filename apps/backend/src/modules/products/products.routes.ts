import mongoose from 'mongoose';
import { Router } from 'express';
import multer from 'multer';
import { randomUUID } from 'crypto';
import { authMiddleware } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/requireRole.js';
import { validateBody } from '../../middleware/validate.js';
import { getConfig } from '../../config/index.js';
import { UserRole, ProductStatus } from 'constants/enums';
import { ProductModel } from './products.model.js';
import { CategoryModel } from '../categories/categories.model.js';
import { uploadToS3, extractKeyFromUrl, deleteFromS3 } from '../../lib/s3.js';
import {
  createProductSchema,
  updateProductSchema,
  listProductsQuerySchema,
} from './products.validation.js';
const router = Router();
const getConfigFn = getConfig;
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB

function toProduct(doc: mongoose.Document | Record<string, unknown>) {
  const p = 'toObject' in doc && typeof doc.toObject === 'function' ? doc.toObject() : doc;
  const o = p as Record<string, unknown>;
  return {
    id: (o._id as mongoose.Types.ObjectId)?.toString?.(),
    name: o.name,
    slug: o.slug,
    description: o.description,
    categoryId: (o.categoryId as mongoose.Types.ObjectId)?.toString?.(),
    status: o.status,
    basePrice: o.basePrice,
    currency: o.currency,
    variants: o.variants,
    images: o.images,
    meta: o.meta,
    createdAt: (o.createdAt as Date)?.toISOString?.(),
    updatedAt: (o.updatedAt as Date)?.toISOString?.(),
  };
}

// GET /products — public list with pagination, filter, search
router.get('/', async (req, res, next) => {
  try {
    const query = listProductsQuerySchema.parse(req.query);
    const filter: Record<string, unknown> = {};

    // For public, only show published products (unless admin)
    const token = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice(7)
      : null;
    let isAdmin = false;
    if (token) {
      try {
        const { verifyToken } = await import('../../lib/jwt.js');
        const user = verifyToken(token, getConfigFn().JWT_SECRET);
        isAdmin = user.role === UserRole.ADMIN;
      } catch {
        // Invalid token, treat as public
      }
    }
    if (!isAdmin) {
      filter.status = ProductStatus.PUBLISHED;
    } else if (query.status) {
      filter.status = query.status;
    }

    // Category filter: include products from the selected category AND its child categories
    if (query.category) {
      // Find all child categories of the selected category
      const childCategories = await CategoryModel.find({ parentId: query.category }).lean();
      const childCategoryIds = childCategories.map((c) => c._id);

      // Include the selected category and all its children
      if (childCategoryIds.length > 0) {
        filter.categoryId = {
          $in: [new mongoose.Types.ObjectId(query.category), ...childCategoryIds],
        };
      } else {
        filter.categoryId = query.category;
      }
    }
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { description: { $regex: query.search, $options: 'i' } },
      ];
    }

    // Price range filtering
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      filter.basePrice = {};
      if (query.minPrice !== undefined) {
        (filter.basePrice as Record<string, number>).$gte = query.minPrice;
      }
      if (query.maxPrice !== undefined) {
        (filter.basePrice as Record<string, number>).$lte = query.maxPrice;
      }
    }

    const sortDir = query.order === 'asc' ? 1 : -1;
    const sortField = query.sort;

    const [list, total] = await Promise.all([
      ProductModel.find(filter)
        .sort({ [sortField]: sortDir })
        .skip((query.page - 1) * query.limit)
        .limit(query.limit)
        .lean(),
      ProductModel.countDocuments(filter),
    ]);

    const data = list.map(toProduct);
    res.json({
      data,
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    });
  } catch (e) {
    next(e);
  }
});

// GET /products/:id — public single product (by id or slug)
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { slug: id };
    const doc = await ProductModel.findOne(query);
    if (!doc) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Product not found' } });
      return;
    }
    res.json(toProduct(doc));
  } catch (e) {
    next(e);
  }
});

// POST /products — admin create
router.post(
  '/',
  authMiddleware(getConfigFn),
  requireRole(UserRole.ADMIN),
  validateBody(createProductSchema),
  async (req, res, next) => {
    try {
      const created = await ProductModel.create({ ...req.body, images: [] });
      res.status(201).json(toProduct(created));
    } catch (e) {
      next(e);
    }
  }
);

// PATCH /products/:id — admin update
router.patch(
  '/:id',
  authMiddleware(getConfigFn),
  requireRole(UserRole.ADMIN),
  validateBody(updateProductSchema),
  async (req, res, next) => {
    try {
      const doc = await ProductModel.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true }
      );
      if (!doc) {
        res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Product not found' } });
        return;
      }
      res.json(toProduct(doc));
    } catch (e) {
      next(e);
    }
  }
);

// DELETE /products/:id — admin delete (removes images from S3)
router.delete(
  '/:id',
  authMiddleware(getConfigFn),
  requireRole(UserRole.ADMIN),
  async (req, res, next) => {
    try {
      const cfg = getConfigFn();
      const doc = await ProductModel.findById(req.params.id);
      if (!doc) {
        res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Product not found' } });
        return;
      }
      for (const img of doc.images) {
        const key = extractKeyFromUrl(cfg, img.url);
        if (key) {
          await deleteFromS3(cfg, key).catch(() => {});
        }
      }
      await doc.deleteOne();
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  }
);

// POST /products/:id/images — admin upload image(s) — stored in S3
router.post(
  '/:id/images',
  authMiddleware(getConfigFn),
  requireRole(UserRole.ADMIN),
  upload.array('images', 10),
  async (req, res, next) => {
    try {
      const cfg = getConfigFn();
      const doc = await ProductModel.findById(req.params.id);
      if (!doc) {
        res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Product not found' } });
        return;
      }

      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        res.status(400).json({ error: { code: 'NO_FILES', message: 'No files uploaded' } });
        return;
      }

      const uploadedImages: { id: string; url: string; order: number }[] = [];
      const currentMaxOrder = doc.images.reduce((max, img) => Math.max(max, img.order), 0);

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const mimetype = file.mimetype || 'image/jpeg';
        const result = await uploadToS3(cfg, file.buffer, mimetype, 'products', doc._id.toString());

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

// POST /products/:id/images/url — admin add image via URL (fetched and stored in S3)
router.post(
  '/:id/images/url',
  authMiddleware(getConfigFn),
  requireRole(UserRole.ADMIN),
  async (req, res, next) => {
    try {
      const cfg = getConfigFn();
      const doc = await ProductModel.findById(req.params.id);
      if (!doc) {
        res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Product not found' } });
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
        res
          .status(400)
          .json({ error: { code: 'FETCH_FAILED', message: 'Failed to fetch image from URL' } });
        return;
      }
      const buffer = Buffer.from(await response.arrayBuffer());
      const contentType = response.headers.get('content-type') || 'image/jpeg';

      const result = await uploadToS3(cfg, buffer, contentType, 'products', doc._id.toString());

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

      const currentMaxOrder = doc.images.reduce((max, img) => Math.max(max, img.order), 0);
      const image = {
        id: randomUUID(),
        url: result.url,
        order: currentMaxOrder + 1,
      };
      doc.images.push(image);

      await doc.save();
      res.status(201).json({ image });
    } catch (e) {
      next(e);
    }
  }
);

// DELETE /products/:id/images/:imageId — admin delete image
router.delete(
  '/:id/images/:imageId',
  authMiddleware(getConfigFn),
  requireRole(UserRole.ADMIN),
  async (req, res, next) => {
    try {
      const cfg = getConfigFn();
      const doc = await ProductModel.findById(req.params.id);
      if (!doc) {
        res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Product not found' } });
        return;
      }

      const imgIndex = doc.images.findIndex((img) => img.id === req.params.imageId);
      if (imgIndex === -1) {
        res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Image not found' } });
        return;
      }

      const img = doc.images[imgIndex];
      const key = extractKeyFromUrl(cfg, img.url);
      if (key) {
        await deleteFromS3(cfg, key);
      }

      doc.images.splice(imgIndex, 1);
      await doc.save();
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  }
);

export const productsRoutes = router;
