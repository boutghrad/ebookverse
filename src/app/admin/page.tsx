'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Users,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  ArrowRight,
  Eye,
  Star,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Stats {
  totalBooks: number;
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  totalReviews: number;
  totalNewsletterSubs: number;
  recentOrders: Array<{
    id: string;
    total: number;
    paymentStatus: string;
    createdAt: string;
    user: { id: string; name: string; email: string };
    orderItems: Array<{
      book: { id: string; title: string };
    }>;
  }>;
  topSellingBooks: Array<{
    id: string;
    title: string;
    author: string;
    price: number;
    discountPrice: number | null;
    totalSales: number;
    coverImage: string;
  }>;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
    orderCount: number;
  }>;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const statusColors: Record<string, string> = {
  COMPLETED: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  PENDING: 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
  FAILED: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20',
};

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

const formatMonth = (monthStr: string) => {
  const [year, month] = monthStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/admin/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
        }
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const statCards = stats
    ? [
        {
          label: 'Total Books',
          value: stats.totalBooks,
          icon: BookOpen,
          change: 12,
          up: true,
          gradient: 'from-violet-500 to-purple-600',
        },
        {
          label: 'Total Users',
          value: stats.totalUsers,
          icon: Users,
          change: 8,
          up: true,
          gradient: 'from-blue-500 to-cyan-500',
        },
        {
          label: 'Total Orders',
          value: stats.totalOrders,
          icon: ShoppingCart,
          change: 5,
          up: true,
          gradient: 'from-emerald-500 to-teal-500',
        },
        {
          label: 'Total Revenue',
          value: formatCurrency(stats.totalRevenue),
          icon: DollarSign,
          change: 15,
          up: true,
          gradient: 'from-orange-500 to-amber-500',
        },
      ]
    : [];

  const chartData = stats?.monthlyRevenue.map((item) => ({
    ...item,
    monthLabel: formatMonth(item.month),
  })) || [];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here&apos;s an overview of your eBook store.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-md">
            <Link href="/admin/books">
              <Plus className="size-4 mr-2" />
              Add New Book
            </Link>
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-muted rounded w-1/2" />
                    <div className="h-8 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/3" />
                  </div>
                </CardContent>
              </Card>
            ))
          : statCards.map((card) => (
              <Card key={card.label} className="overflow-hidden relative">
                <div className={cn('absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b', card.gradient)} />
                <CardContent className="p-6 pl-5">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground font-medium">{card.label}</p>
                      <p className="text-2xl font-bold">{card.value}</p>
                    </div>
                    <div className={cn('flex items-center justify-center size-12 rounded-xl bg-gradient-to-br shadow-lg', card.gradient)}>
                      <card.icon className="size-6 text-white" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-3">
                    {card.up ? (
                      <TrendingUp className="size-3.5 text-emerald-500" />
                    ) : (
                      <TrendingDown className="size-3.5 text-red-500" />
                    )}
                    <span className={cn('text-xs font-medium', card.up ? 'text-emerald-500' : 'text-red-500')}>
                      {card.change}%
                    </span>
                    <span className="text-xs text-muted-foreground">vs last month</span>
                  </div>
                </CardContent>
              </Card>
            ))}
      </motion.div>

      {/* Revenue Chart + Top Selling Books */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>Monthly revenue for the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-[300px] animate-pulse bg-muted rounded-lg" />
              ) : chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="monthLabel"
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <YAxis
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      tickFormatter={(val) => `$${val}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                      }}
                      formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                      fill="url(#revenueGradient)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No revenue data available yet
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Selling Books */}
        <motion.div variants={itemVariants}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Top Selling Books</CardTitle>
              <CardDescription>Best performers this month</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="animate-pulse flex items-center gap-3">
                      <div className="size-10 bg-muted rounded" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 bg-muted rounded w-3/4" />
                        <div className="h-2.5 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : stats?.topSellingBooks && stats.topSellingBooks.length > 0 ? (
                <div className="space-y-4">
                  {stats.topSellingBooks.map((book, i) => (
                    <div key={book.id} className="flex items-center gap-3">
                      <div className="flex items-center justify-center size-8 rounded-lg bg-gradient-to-br from-violet-500/10 to-purple-500/10 text-sm font-bold text-violet-600 dark:text-violet-400 shrink-0">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{book.title}</p>
                        <p className="text-xs text-muted-foreground">{book.author}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="flex items-center gap-1">
                          <Star className="size-3 text-amber-500 fill-amber-500" />
                          <span className="text-xs font-medium">{book.totalSales}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(book.discountPrice ?? book.price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8 text-sm">
                  No sales data yet
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Orders */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Latest 5 orders from your store</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/orders">
                View All <ArrowRight className="size-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="animate-pulse h-12 bg-muted rounded" />
                ))}
              </div>
            ) : stats?.recentOrders && stats.recentOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.recentOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-xs">
                          {order.id.slice(0, 8)}...
                        </TableCell>
                        <TableCell className="font-medium">
                          {order.user.name || order.user.email}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {order.orderItems.length} item{order.orderItems.length !== 1 ? 's' : ''}
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(order.total)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn('text-xs', statusColors[order.paymentStatus] || '')}
                          >
                            {order.paymentStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8 text-sm">
                No orders yet
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/admin/books" className="group">
          <Card className="hover:border-violet-500/50 transition-colors cursor-pointer h-full">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="flex items-center justify-center size-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg group-hover:scale-105 transition-transform">
                <Plus className="size-6 text-white" />
              </div>
              <div>
                <p className="font-semibold">Add New Book</p>
                <p className="text-sm text-muted-foreground">Create a new book listing</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/orders" className="group">
          <Card className="hover:border-violet-500/50 transition-colors cursor-pointer h-full">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="flex items-center justify-center size-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg group-hover:scale-105 transition-transform">
                <Eye className="size-6 text-white" />
              </div>
              <div>
                <p className="font-semibold">View All Orders</p>
                <p className="text-sm text-muted-foreground">Manage store orders</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/users" className="group">
          <Card className="hover:border-violet-500/50 transition-colors cursor-pointer h-full">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="flex items-center justify-center size-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg group-hover:scale-105 transition-transform">
                <Users className="size-6 text-white" />
              </div>
              <div>
                <p className="font-semibold">Manage Users</p>
                <p className="text-sm text-muted-foreground">View and edit users</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </motion.div>
    </motion.div>
  );
}
