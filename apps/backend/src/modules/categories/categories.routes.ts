import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/requireRole.js';
import { validateBody } from '../../middleware/validate.js';
import { getConfig } from '../../config/index.js';
import { UserRole } from '@lunaz/types';
import { createCategorySchema, updateCategorySchema } from './categories.validation.js';
import * as categoryService from './categories.service.js';

const router = Router();
const getConfigFn = getConfig;

// GET /categories — public list
router.get('/', async (_req, res, next) => {
  try {
    const data = await categoryService.getAllCategories();
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

// DELETE /categories/:id — admin delete
router.delete(
  '/:id',
  authMiddleware(getConfigFn),
  requireRole(UserRole.ADMIN),
  async (req, res, next) => {
    try {
      // Check for children
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
