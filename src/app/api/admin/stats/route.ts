import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

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
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true, email: true } },
          orderItems: {
            include: {
              book: { select: { id: true, title: true } },
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
      // Get orders grouped by month for the last 6 months
      db.order.findMany({
        where: {
          createdAt: {
            gte: new Date(new Date().setMonth(new Date().getMonth() - 6)),
          },
        },
        select: {
          total: true,
          createdAt: true,
        },
      }),
    ]);

    // Process orders by month
    const monthlyData = new Map<string, { total: number; count: number }>();
    ordersByMonth.forEach((order) => {
      const monthKey = order.createdAt.toISOString().slice(0, 7); // YYYY-MM
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
