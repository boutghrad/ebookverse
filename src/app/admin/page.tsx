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
  Mail,
  MessageSquare,
  CreditCard,
  Clock,
  CheckCircle2,
  XCircle,
  Activity,
  RefreshCw,
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
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import Link from 'next/link';
import Image from 'next/image';
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
    paymentMethod?: string;
    createdAt: string;
    user: { id: string; name: string; email: string; image?: string };
    orderItems: Array<{
      book: { id: string; title: string; coverImage: string };
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
  changes: {
    orders: number;
    revenue: number;
    users: number;
    books: number;
  };
  orderStatus: {
    completed: number;
    pending: number;
    failed: number;
  };
  paymentMethods: {
    paypal: number;
    free: number;
    card: number;
  };
  categories: Array<{
    name: string;
    count: number;
  }>;
  recentUsers: Array<{
    id: string;
    name: string;
    email: string;
    image?: string;
    role: string;
    createdAt: string;
    _count: { orders: number; reviews: number };
  }>;
  newsletterChange: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
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

const PIE_COLORS = ['#8b5cf6', '#06b6d4', '#f59e0b', '#10b981', '#ef4444', '#ec4899', '#6366f1', '#14b8a6'];
const STATUS_COLORS = ['#10b981', '#f59e0b', '#ef4444'];
const PAYMENT_COLORS = ['#0070E0', '#10b981', '#8b5cf6'];

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

const formatMonth = (monthStr: string) => {
  const [year, month] = monthStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
};

const ChangeIndicator = ({ value }: { value: number }) => (
  <div className="flex items-center gap-1 mt-2">
    {value >= 0 ? (
      <TrendingUp className="size-3.5 text-emerald-500" />
    ) : (
      <TrendingDown className="size-3.5 text-red-500" />
    )}
    <span className={cn('text-xs font-medium', value >= 0 ? 'text-emerald-500' : 'text-red-500')}>
      {value >= 0 ? '+' : ''}{value}%
    </span>
    <span className="text-xs text-muted-foreground">vs last month</span>
  </div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
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
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const statCards = stats
    ? [
        {
          label: 'Total Revenue',
          value: formatCurrency(stats.totalRevenue),
          icon: DollarSign,
          change: stats.changes.revenue,
          gradient: 'from-violet-500 to-purple-600',
          bgLight: 'bg-violet-50 dark:bg-violet-950/30',
        },
        {
          label: 'Total Orders',
          value: stats.totalOrders,
          icon: ShoppingCart,
          change: stats.changes.orders,
          gradient: 'from-blue-500 to-cyan-500',
          bgLight: 'bg-blue-50 dark:bg-blue-950/30',
        },
        {
          label: 'Total Users',
          value: stats.totalUsers,
          icon: Users,
          change: stats.changes.users,
          gradient: 'from-emerald-500 to-teal-500',
          bgLight: 'bg-emerald-50 dark:bg-emerald-950/30',
        },
        {
          label: 'Total Books',
          value: stats.totalBooks,
          icon: BookOpen,
          change: stats.changes.books,
          gradient: 'from-orange-500 to-amber-500',
          bgLight: 'bg-orange-50 dark:bg-orange-950/30',
        },
        {
          label: 'Reviews',
          value: stats.totalReviews,
          icon: MessageSquare,
          change: 0,
          gradient: 'from-rose-500 to-pink-500',
          bgLight: 'bg-rose-50 dark:bg-rose-950/30',
        },
        {
          label: 'Newsletter Subs',
          value: stats.totalNewsletterSubs,
          icon: Mail,
          change: stats.newsletterChange,
          gradient: 'from-fuchsia-500 to-purple-600',
          bgLight: 'bg-fuchsia-50 dark:bg-fuchsia-950/30',
        },
      ]
    : [];

  const chartData = stats?.monthlyRevenue.map((item) => ({
    ...item,
    monthLabel: formatMonth(item.month),
  })) || [];

  const orderStatusData = stats ? [
    { name: 'Completed', value: stats.orderStatus.completed, color: STATUS_COLORS[0] },
    { name: 'Pending', value: stats.orderStatus.pending, color: STATUS_COLORS[1] },
    { name: 'Failed', value: stats.orderStatus.failed, color: STATUS_COLORS[2] },
  ].filter(d => d.value > 0) : [];

  const paymentMethodData = stats ? [
    { name: 'PayPal', value: stats.paymentMethods.paypal, color: PAYMENT_COLORS[0] },
    { name: 'Free', value: stats.paymentMethods.free, color: PAYMENT_COLORS[1] },
    { name: 'Card', value: stats.paymentMethods.card, color: PAYMENT_COLORS[2] },
  ].filter(d => d.value > 0) : [];

  const categoryData = stats?.categories.map((c, i) => ({
    ...c,
    color: PIE_COLORS[i % PIE_COLORS.length],
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
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here&apos;s an overview of your eBook store.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchStats} disabled={loading}>
            <RefreshCw className={cn('size-4 mr-2', loading && 'animate-spin')} />
            Refresh
          </Button>
          <Button asChild className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-md">
            <Link href="/admin/books">
              <Plus className="size-4 mr-2" />
              Add Book
            </Link>
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards - 6 cards in 2 rows */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-5">
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-muted rounded w-2/3" />
                    <div className="h-7 bg-muted rounded w-1/2" />
                    <div className="h-3 bg-muted rounded w-1/3" />
                  </div>
                </CardContent>
              </Card>
            ))
          : statCards.map((card) => (
              <Card key={card.label} className="overflow-hidden relative group hover:shadow-md transition-shadow">
                <div className={cn('absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b', card.gradient)} />
                <CardContent className="p-5 pl-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 min-w-0">
                      <p className="text-xs text-muted-foreground font-medium truncate">{card.label}</p>
                      <p className="text-xl font-bold truncate">{card.value}</p>
                    </div>
                    <div className={cn('flex items-center justify-center size-9 rounded-lg shrink-0', card.bgLight)}>
                      <card.icon className={cn('size-4 bg-gradient-to-br bg-clip-text', card.gradient)} style={{ color: 'inherit' }} />
                    </div>
                  </div>
                  <ChangeIndicator value={card.change} />
                </CardContent>
              </Card>
            ))}
      </motion.div>

      {/* Revenue Chart + Order Status + Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue & Orders Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="size-5 text-violet-500" />
                Revenue & Orders
              </CardTitle>
              <CardDescription>Monthly revenue and order count for the last 12 months</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-[320px] animate-pulse bg-muted rounded-lg" />
              ) : chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="monthLabel"
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                    />
                    <YAxis
                      yAxisId="revenue"
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                      tickFormatter={(val) => `$${val}`}
                    />
                    <YAxis
                      yAxisId="orders"
                      orientation="right"
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                      }}
                      formatter={(value: number, name: string) => [
                        name === 'revenue' ? formatCurrency(value) : value,
                        name === 'revenue' ? 'Revenue' : 'Orders',
                      ]}
                    />
                    <Legend />
                    <Area
                      yAxisId="revenue"
                      type="monotone"
                      dataKey="revenue"
                      stroke="#8b5cf6"
                      strokeWidth={2.5}
                      fill="url(#revenueGrad)"
                      dot={{ fill: '#8b5cf6', strokeWidth: 0, r: 3 }}
                      activeDot={{ r: 5, strokeWidth: 0 }}
                    />
                    <Area
                      yAxisId="orders"
                      type="monotone"
                      dataKey="orderCount"
                      stroke="#06b6d4"
                      strokeWidth={2.5}
                      fill="url(#ordersGrad)"
                      dot={{ fill: '#06b6d4', strokeWidth: 0, r: 3 }}
                      activeDot={{ r: 5, strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[320px] flex items-center justify-center text-muted-foreground">
                  No revenue data available yet
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Order Status + Payment Method Donuts */}
        <motion.div variants={itemVariants} className="space-y-6">
          {/* Order Status */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Order Status</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-[160px] animate-pulse bg-muted rounded-lg" />
              ) : orderStatusData.length > 0 ? (
                <div className="flex items-center gap-4">
                  <div className="w-[120px] h-[120px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={orderStatusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={30}
                          outerRadius={55}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {orderStatusData.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2"><CheckCircle2 className="size-3.5 text-emerald-500" /> Completed</span>
                      <span className="font-semibold">{stats?.orderStatus.completed}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2"><Clock className="size-3.5 text-yellow-500" /> Pending</span>
                      <span className="font-semibold">{stats?.orderStatus.pending}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2"><XCircle className="size-3.5 text-red-500" /> Failed</span>
                      <span className="font-semibold">{stats?.orderStatus.failed}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-[120px] flex items-center justify-center text-muted-foreground text-sm">
                  No orders yet
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Payment Methods</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-[160px] animate-pulse bg-muted rounded-lg" />
              ) : paymentMethodData.length > 0 ? (
                <div className="flex items-center gap-4">
                  <div className="w-[120px] h-[120px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={paymentMethodData}
                          cx="50%"
                          cy="50%"
                          innerRadius={30}
                          outerRadius={55}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {paymentMethodData.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <svg className="size-3.5" viewBox="0 0 24 24"><path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.77.77 0 0 1 .757-.654h6.328c2.352 0 4.047.644 4.898 1.867.395.566.637 1.207.72 1.916.087.754-.023 1.63-.337 2.676-.733 2.468-2.128 3.988-4.148 4.502a9.61 9.61 0 0 1-2.346.282H8.19a.77.77 0 0 0-.757.654l-.357 2.267" fill="#0070E0"/></svg>
                        PayPal
                      </span>
                      <span className="font-semibold">{stats?.paymentMethods.paypal}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2"><CreditCard className="size-3.5 text-violet-500" /> Card</span>
                      <span className="font-semibold">{stats?.paymentMethods.card}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2"><Star className="size-3.5 text-emerald-500" /> Free</span>
                      <span className="font-semibold">{stats?.paymentMethods.free}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-[120px] flex items-center justify-center text-muted-foreground text-sm">
                  No payments yet
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Books by Category + Top Selling Books */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Books by Category */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Books by Category</CardTitle>
              <CardDescription>Distribution across categories</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-[280px] animate-pulse bg-muted rounded-lg" />
              ) : categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={categoryData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                      angle={-30}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="count" name="Books" radius={[6, 6, 0, 0]}>
                      {categoryData.map((entry, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[280px] flex items-center justify-center text-muted-foreground">
                  No categories yet
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Selling Books */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Books</cardTitle>
              <CardDescription>Best performers by total sales</CardDescription>
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
                <div className="space-y-3">
                  {stats.topSellingBooks.map((book, i) => (
                    <div key={book.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="flex items-center justify-center size-8 rounded-lg bg-gradient-to-br from-violet-500/10 to-purple-500/10 text-sm font-bold text-violet-600 dark:text-violet-400 shrink-0">
                        {i + 1}
                      </div>
                      <div className="relative w-10 h-14 rounded overflow-hidden shrink-0 bg-gradient-to-br from-violet-500/20 to-purple-500/20">
                        <Image
                          src={book.coverImage || '/placeholder-book.jpg'}
                          alt={book.title}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
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
              <CardDescription>Latest orders from your store</CardDescription>
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
                      <TableHead>Books</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Method</TableHead>
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
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="size-7 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                              {(order.user.name || order.user.email)[0].toUpperCase()}
                            </div>
                            <span className="font-medium text-sm">{order.user.name || order.user.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-0.5">
                            {order.orderItems.slice(0, 2).map((item, i) => (
                              <span key={i} className="text-xs text-muted-foreground truncate max-w-[150px]">
                                {item.book.title}
                              </span>
                            ))}
                            {order.orderItems.length > 2 && (
                              <span className="text-xs text-muted-foreground">
                                +{order.orderItems.length - 2} more
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(order.total)}
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-muted-foreground capitalize">
                            {order.paymentMethod || 'card'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn('text-xs', statusColors[order.paymentStatus] || '')}
                          >
                            {order.paymentStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">
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

      {/* Recent Users + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Users */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>New Users</CardTitle>
              <CardDescription>Recently registered users</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="animate-pulse h-12 bg-muted rounded" />
                  ))}
                </div>
              ) : stats?.recentUsers && stats.recentUsers.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentUsers.map((user) => (
                    <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="size-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white font-bold shrink-0">
                        {(user.name || user.email)[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{user.name || 'No name'}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{user._count.orders} orders</span>
                          <span>{user._count.reviews} reviews</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                      {user.role === 'ADMIN' && (
                        <Badge variant="outline" className="text-xs border-violet-500/30 text-violet-600 dark:text-violet-400">
                          Admin
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8 text-sm">
                  No users yet
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/admin/books" className="group block">
                <div className="flex items-center gap-3 p-3 rounded-lg border hover:border-violet-500/50 hover:bg-accent/50 transition-all">
                  <div className="flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-md group-hover:scale-105 transition-transform">
                    <Plus className="size-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Add New Book</p>
                    <p className="text-xs text-muted-foreground">Create a book listing</p>
                  </div>
                </div>
              </Link>
              <Link href="/admin/orders" className="group block">
                <div className="flex items-center gap-3 p-3 rounded-lg border hover:border-emerald-500/50 hover:bg-accent/50 transition-all">
                  <div className="flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-md group-hover:scale-105 transition-transform">
                    <Eye className="size-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">View Orders</p>
                    <p className="text-xs text-muted-foreground">Manage store orders</p>
                  </div>
                </div>
              </Link>
              <Link href="/admin/users" className="group block">
                <div className="flex items-center gap-3 p-3 rounded-lg border hover:border-blue-500/50 hover:bg-accent/50 transition-all">
                  <div className="flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-md group-hover:scale-105 transition-transform">
                    <Users className="size-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Manage Users</p>
                    <p className="text-xs text-muted-foreground">View and edit users</p>
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
