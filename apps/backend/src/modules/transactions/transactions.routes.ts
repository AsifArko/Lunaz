import { Router } from 'express';
import mongoose from 'mongoose';
import { authMiddleware } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/requireRole.js';
import { getConfig } from '../../config/index.js';
import { UserRole } from '../../constants/enums';
import { TransactionModel, PayoutModel } from './transactions.model.js';
import { OrderModel } from '../orders/orders.model.js';

const router = Router();
const getConfigFn = getConfig;

router.use(authMiddleware(getConfigFn));
router.use(requireRole(UserRole.ADMIN));

// GET /transactions — list transactions
router.get('/', async (req, res, next) => {
  try {
    const { dateFrom, dateTo, type, page = 1, limit = 20 } = req.query;
    const filter: Record<string, unknown> = {};

    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom)
        (filter.createdAt as Record<string, unknown>).$gte = new Date(dateFrom as string);
      if (dateTo) (filter.createdAt as Record<string, unknown>).$lte = new Date(dateTo as string);
    }
    if (type) filter.type = type;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));

    const [list, total] = await Promise.all([
      TransactionModel.find(filter)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      TransactionModel.countDocuments(filter),
    ]);

    const data = list.map((t) => ({
      id: (t._id as mongoose.Types.ObjectId).toString(),
      orderId: (t.orderId as mongoose.Types.ObjectId).toString(),
      type: t.type,
      amount: t.amount,
      currency: t.currency,
      paymentMethod: t.paymentMethod,
      externalId: t.externalId,
      status: t.status,
      metadata: t.metadata,
      createdAt: t.createdAt.toISOString(),
    }));

    res.json({
      data,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (e) {
    next(e);
  }
});

// GET /payouts — list payouts
router.get('/payouts', async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));

    const [list, total] = await Promise.all([
      PayoutModel.find()
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      PayoutModel.countDocuments(),
    ]);

    const data = list.map((p) => ({
      id: (p._id as mongoose.Types.ObjectId).toString(),
      amount: p.amount,
      currency: p.currency,
      status: p.status,
      reference: p.reference,
      createdAt: (p.createdAt as Date).toISOString(),
      completedAt: (p.completedAt as Date)?.toISOString?.(),
    }));

    res.json({
      data,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (e) {
    next(e);
  }
});

// GET /reports/sales — aggregated sales
router.get('/reports/sales', async (req, res, next) => {
  try {
    const { period = 'day', dateFrom, dateTo } = req.query;

    const matchStage: Record<string, unknown> = {
      status: { $nin: ['cancelled'] },
    };

    if (dateFrom || dateTo) {
      matchStage.createdAt = {};
      if (dateFrom)
        (matchStage.createdAt as Record<string, unknown>).$gte = new Date(dateFrom as string);
      if (dateTo)
        (matchStage.createdAt as Record<string, unknown>).$lte = new Date(dateTo as string);
    }

    // Group by period
    let dateFormat: string;
    switch (period) {
      case 'month':
        dateFormat = '%Y-%m';
        break;
      case 'week':
        dateFormat = '%Y-W%V';
        break;
      case 'day':
      default:
        dateFormat = '%Y-%m-%d';
    }

    const result = await OrderModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: '$createdAt' } },
          revenue: { $sum: '$total' },
          orderCount: { $sum: 1 },
          avgOrderValue: { $avg: '$total' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Summary totals
    const totals = await OrderModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
          totalOrders: { $sum: 1 },
          avgOrderValue: { $avg: '$total' },
        },
      },
    ]);

    res.json({
      period,
      data: result.map((r) => ({
        date: r._id,
        revenue: r.revenue,
        orderCount: r.orderCount,
        avgOrderValue: Math.round(r.avgOrderValue * 100) / 100,
      })),
      summary: totals[0] ?? { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 },
    });
  } catch (e) {
    next(e);
  }
});

export const transactionsRoutes = router;
