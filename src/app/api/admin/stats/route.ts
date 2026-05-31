import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = 'force-dynamic';

// GET /api/admin/stats - Get dashboard stats (admin only)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if ((session.user as Record<string, unknown>).role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Run all stats queries in parallel
    const [
      totalUsers,
      totalBooks,
      totalOrders,
      totalRevenue,
      totalReviews,
      totalNewsletterSubs,
      recentOrders,
      topSellingBooks,
      ordersByMonth,
      // This month vs last month comparisons
      thisMonthOrders,
      lastMonthOrders,
      thisMonthRevenue,
      lastMonthRevenue,
      thisMonthUsers,
      lastMonthUsers,
      thisMonthBooks,
      // Order status distribution
      completedOrders,
      pendingOrders,
      failedOrders,
      // Payment method distribution
      paypalOrders,
      freeOrders,
      cardOrders,
      // Category distribution
      booksByCategory,
      // Recent users
      recentUsers,
      // Newsletter growth
      thisMonthNewsletter,
      lastMonthNewsletter,
    ] = await Promise.all([
      db.user.count(),
      db.book.count(),
      db.order.count(),
      db.order.aggregate({
        _sum: { total: true },
        where: { paymentStatus: "COMPLETED" },
      }),
      db.review.count(),
      db.newsletter.count(),
      db.order.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true, email: true, image: true } },
          orderItems: {
            include: {
              book: { select: { id: true, title: true, coverImage: true } },
            },
          },
        },
      }),
      db.book.findMany({
        take: 5,
        orderBy: { totalSales: "desc" },
        select: {
          id: true,
          title: true,
          author: true,
          price: true,
          discountPrice: true,
          totalSales: true,
          coverImage: true,
        },
      }),
      // Get orders grouped by month for the last 12 months
      db.order.findMany({
        where: {
          createdAt: {
            gte: new Date(new Date().setMonth(new Date().getMonth() - 12)),
          },
        },
        select: {
          total: true,
          createdAt: true,
          paymentStatus: true,
        },
      }),
      // This month order count
      db.order.count({ where: { createdAt: { gte: thisMonthStart } } }),
      // Last month order count
      db.order.count({ where: { createdAt: { gte: lastMonthStart, lte: lastMonthEnd } } }),
      // This month revenue
      db.order.aggregate({
        _sum: { total: true },
        where: { paymentStatus: "COMPLETED", createdAt: { gte: thisMonthStart } },
      }),
      // Last month revenue
      db.order.aggregate({
        _sum: { total: true },
        where: { paymentStatus: "COMPLETED", createdAt: { gte: lastMonthStart, lte: lastMonthEnd } },
      }),
      // This month new users
      db.user.count({ where: { createdAt: { gte: thisMonthStart } } }),
      // Last month new users
      db.user.count({ where: { createdAt: { gte: lastMonthStart, lte: lastMonthEnd } } }),
      // This month new books
      db.book.count({ where: { createdAt: { gte: thisMonthStart } } }),
      // Order status counts
      db.order.count({ where: { paymentStatus: "COMPLETED" } }),
      db.order.count({ where: { paymentStatus: "PENDING" } }),
      db.order.count({ where: { paymentStatus: "FAILED" } }),
      // Payment method counts
      db.order.count({ where: { paymentMethod: "paypal" } }),
      db.order.count({ where: { paymentMethod: "free" } }),
      db.order.count({ where: { paymentMethod: "card" } }),
      // Books by category
      db.category.findMany({
        include: {
          _count: { select: { books: true } },
        },
        orderBy: { books: { _count: 'desc' } },
        take: 8,
      }),
      // Recent users
      db.user.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          createdAt: true,
          _count: { select: { orders: true, reviews: true } },
        },
      }),
      // Newsletter growth
      db.newsletter.count({ where: { createdAt: { gte: thisMonthStart } } }),
      db.newsletter.count({ where: { createdAt: { gte: lastMonthStart, lte: lastMonthEnd } } }),
    ]);

    // Process orders by month
    const monthlyData = new Map<string, { total: number; count: number }>();
    ordersByMonth.forEach((order) => {
      const monthKey = order.createdAt.toISOString().slice(0, 7);
      const existing = monthlyData.get(monthKey) || { total: 0, count: 0 };
      existing.total += order.total;
      existing.count += 1;
      monthlyData.set(monthKey, existing);
    });

    const monthlyRevenue = Array.from(monthlyData.entries())
      .map(([month, data]) => ({
        month,
        revenue: Math.round(data.total * 100) / 100,
        orderCount: data.count,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Calculate percentage changes
    const calcChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const stats = {
      totalUsers,
      totalBooks,
      totalOrders,
      totalRevenue: totalRevenue._sum.total || 0,
      totalReviews,
      totalNewsletterSubs,
      recentOrders,
      topSellingBooks,
      monthlyRevenue,
      // Comparison data
      changes: {
        orders: calcChange(thisMonthOrders, lastMonthOrders),
        revenue: calcChange(thisMonthRevenue._sum.total || 0, lastMonthRevenue._sum.total || 0),
        users: calcChange(thisMonthUsers, lastMonthUsers),
        books: thisMonthBooks,
      },
      // Distributions
      orderStatus: {
        completed: completedOrders,
        pending: pendingOrders,
        failed: failedOrders,
      },
      paymentMethods: {
        paypal: paypalOrders,
        free: freeOrders,
        card: cardOrders,
      },
      categories: booksByCategory.map(c => ({
        name: c.name,
        count: c._count.books,
      })),
      recentUsers,
      newsletterChange: calcChange(thisMonthNewsletter, lastMonthNewsletter),
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
