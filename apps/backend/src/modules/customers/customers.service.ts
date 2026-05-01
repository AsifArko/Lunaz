import mongoose from 'mongoose';
import { UserModel } from '../auth/auth.model.js';
import { OrderModel } from '../orders/orders.model.js';
import { UserRole } from '../../constants/enums';

interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  sort?: string;
  order?: 1 | -1;
}

/**
 * Convert user document to customer response (omit sensitive data).
 */
function toCustomer(doc: Record<string, unknown>) {
  return {
    id: (doc._id as mongoose.Types.ObjectId).toString(),
    email: doc.email as string,
    name: doc.name as string,
    phone: (doc.phone as string) || '',
    role: doc.role as string,
    emailVerified: doc.emailVerified as boolean,
    addresses: ((doc.addresses as unknown[]) ?? []).map((a) => {
      const addr = a as Record<string, unknown>;
      return {
        id: (addr._id as mongoose.Types.ObjectId).toString(),
        label: addr.label,
        line1: addr.line1,
        line2: addr.line2,
        city: addr.city,
        state: addr.state,
        postalCode: addr.postalCode,
        country: addr.country,
        isDefault: addr.isDefault,
      };
    }),
    createdAt: (doc.createdAt as Date)?.toISOString?.(),
    updatedAt: (doc.updatedAt as Date)?.toISOString?.(),
  };
}

/**
 * List customers with pagination and search.
 */
export async function listCustomers(params: PaginationParams) {
  const { page, limit, search, sort = 'createdAt', order = -1 } = params;
  const skip = (page - 1) * limit;

  // Build query for customers only
  const query: Record<string, unknown> = { role: UserRole.CUSTOMER };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const [customers, total] = await Promise.all([
    UserModel.find(query)
      .select('-passwordHash')
      .sort({ [sort]: order })
      .skip(skip)
      .limit(limit)
      .lean(),
    UserModel.countDocuments(query),
  ]);

  return {
    data: customers.map(toCustomer),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get single customer by ID.
 */
export async function getCustomerById(id: string) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return null;
  }

  const customer = await UserModel.findOne({
    _id: id,
    role: UserRole.CUSTOMER,
  })
    .select('-passwordHash')
    .lean();

  if (!customer) return null;

  // Get order statistics for this customer
  const orderStats = await OrderModel.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(id) } },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalSpent: { $sum: '$total' },
        averageOrderValue: { $avg: '$total' },
      },
    },
  ]);

  const stats = orderStats[0] || { totalOrders: 0, totalSpent: 0, averageOrderValue: 0 };

  return {
    ...toCustomer(customer),
    stats: {
      totalOrders: stats.totalOrders,
      totalSpent: stats.totalSpent,
      averageOrderValue: stats.averageOrderValue,
    },
  };
}

/**
 * Get customer's orders.
 */
export async function getCustomerOrders(
  customerId: string,
  params: { page: number; limit: number }
) {
  const { page, limit } = params;
  const skip = (page - 1) * limit;

  if (!mongoose.Types.ObjectId.isValid(customerId)) {
    return { data: [], total: 0, page, limit, totalPages: 0 };
  }

  const query = { userId: new mongoose.Types.ObjectId(customerId) };

  const [orders, total] = await Promise.all([
    OrderModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    OrderModel.countDocuments(query),
  ]);

  return {
    data: orders.map((o) => ({
      id: o._id.toString(),
      orderNumber: o.orderNumber,
      status: o.status,
      total: o.total,
      currency: o.currency,
      itemCount: o.items.length,
      createdAt: o.createdAt.toISOString(),
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get aggregate customer statistics.
 */
export async function getCustomerStats() {
  const [totalCustomers, newCustomersThisMonth, customersByMonth] = await Promise.all([
    UserModel.countDocuments({ role: UserRole.CUSTOMER }),
    UserModel.countDocuments({
      role: UserRole.CUSTOMER,
      createdAt: { $gte: new Date(new Date().setDate(1)) },
    }),
    UserModel.aggregate([
      { $match: { role: UserRole.CUSTOMER } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 },
    ]),
  ]);

  return {
    totalCustomers,
    newCustomersThisMonth,
    customersByMonth: customersByMonth.map((c) => ({
      year: c._id.year,
      month: c._id.month,
      count: c.count,
    })),
  };
}
