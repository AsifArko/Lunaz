import { OrderModel } from '../orders/orders.model.js';
import { ProductModel } from '../products/products.model.js';
import { UserModel } from '../auth/auth.model.js';
import { UserRole, OrderStatus, ProductStatus } from '@lunaz/types';

/**
 * Get main dashboard statistics.
 */
export async function getDashboardStats() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  // Run all queries in parallel
  const [
    totalRevenue,
    monthlyRevenue,
    lastMonthRevenue,
    totalOrders,
    monthlyOrders,
    pendingOrders,
    totalProducts,
    publishedProducts,
    totalCustomers,
    newCustomersThisMonth,
  ] = await Promise.all([
    // Total revenue (all time)
    OrderModel.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]).then((r) => r[0]?.total || 0),

    // This month's revenue
    OrderModel.aggregate([
      { $match: { paymentStatus: 'paid', createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]).then((r) => r[0]?.total || 0),

    // Last month's revenue (for comparison)
    OrderModel.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
          createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
        },
      },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]).then((r) => r[0]?.total || 0),

    // Total orders
    OrderModel.countDocuments(),

    // This month's orders
    OrderModel.countDocuments({ createdAt: { $gte: startOfMonth } }),

    // Pending orders
    OrderModel.countDocuments({ status: { $in: [OrderStatus.PENDING, OrderStatus.CONFIRMED] } }),

    // Total products
    ProductModel.countDocuments(),

    // Published products
    ProductModel.countDocuments({ status: ProductStatus.PUBLISHED }),

    // Total customers
    UserModel.countDocuments({ role: UserRole.CUSTOMER }),

    // New customers this month
    UserModel.countDocuments({
      role: UserRole.CUSTOMER,
      createdAt: { $gte: startOfMonth },
    }),
  ]);

  // Calculate percentage changes
  const revenueChange =
    lastMonthRevenue > 0 ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;

  return {
    revenue: {
      total: totalRevenue,
      thisMonth: monthlyRevenue,
      lastMonth: lastMonthRevenue,
      changePercent: Math.round(revenueChange * 10) / 10,
    },
    orders: {
      total: totalOrders,
      thisMonth: monthlyOrders,
      pending: pendingOrders,
    },
    products: {
      total: totalProducts,
      published: publishedProducts,
      draft: totalProducts - publishedProducts,
    },
    customers: {
      total: totalCustomers,
      newThisMonth: newCustomersThisMonth,
    },
  };
}

/**
 * Get recent orders for dashboard.
 */
export async function getRecentOrders(limit: number) {
  const orders = await OrderModel.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('userId', 'name email')
    .lean();

  return orders.map((o) => ({
    id: o._id.toString(),
    orderNumber: o.orderNumber,
    customer: o.userId
      ? {
          id: (o.userId as unknown as Record<string, unknown>)._id?.toString(),
          name: (o.userId as unknown as Record<string, unknown>).name,
          email: (o.userId as unknown as Record<string, unknown>).email,
        }
      : null,
    status: o.status,
    paymentStatus: o.paymentStatus,
    total: o.total,
    currency: o.currency,
    itemCount: o.items.length,
    createdAt: o.createdAt.toISOString(),
  }));
}

/**
 * Get top selling products.
 */
export async function getTopProducts(limit: number) {
  const topProducts = await OrderModel.aggregate([
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.productId',
        productName: { $first: '$items.productName' },
        totalQuantity: { $sum: '$items.quantity' },
        totalRevenue: { $sum: '$items.total' },
      },
    },
    { $sort: { totalRevenue: -1 } },
    { $limit: limit },
  ]);

  // Enrich with current product data
  const productIds = topProducts.map((p) => p._id);
  const products = await ProductModel.find({ _id: { $in: productIds } })
    .select('name slug images status')
    .lean();

  const productMap = new Map(products.map((p) => [p._id.toString(), p]));

  return topProducts.map((tp) => {
    const product = productMap.get(tp._id.toString());
    return {
      id: tp._id.toString(),
      name: product?.name || tp.productName,
      slug: product?.slug,
      imageUrl: product?.images?.[0]?.url || null,
      totalQuantity: tp.totalQuantity,
      totalRevenue: tp.totalRevenue,
    };
  });
}

/**
 * Get sales chart data for the last N days.
 */
export async function getSalesChartData(days: number) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  const salesByDay = await OrderModel.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' },
        },
        revenue: { $sum: '$total' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
  ]);

  // Fill in missing days with zero values
  const result: Array<{ date: string; revenue: number; orders: number }> = [];
  const currentDate = new Date(startDate);
  const today = new Date();

  while (currentDate <= today) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const day = currentDate.getDate();

    const found = salesByDay.find(
      (s) => s._id.year === year && s._id.month === month && s._id.day === day
    );

    result.push({
      date: currentDate.toISOString().split('T')[0],
      revenue: found?.revenue || 0,
      orders: found?.orders || 0,
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return result;
}
