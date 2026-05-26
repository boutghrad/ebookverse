'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Loader2,
  Package,
  ArrowLeft,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  CreditCard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { cn } from '@/lib/utils';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  book: {
    id: string;
    title: string;
    author: string;
    coverImage: string;
    format: string;
  };
}

interface Order {
  id: string;
  total: number;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
  orderItems: OrderItem[];
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  PENDING: { label: 'Pending', color: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400', icon: Clock },
  PROCESSING: { label: 'Processing', color: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400', icon: Truck },
  COMPLETED: { label: 'Completed', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400', icon: CheckCircle2 },
  FAILED: { label: 'Failed', color: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400', icon: AlertCircle },
};

const statusSteps = [
  { key: 'PENDING', label: 'Order Placed', icon: Clock },
  { key: 'PROCESSING', label: 'Processing', icon: CreditCard },
  { key: 'COMPLETED', label: 'Completed', icon: CheckCircle2 },
];

function OrderStatusTracker({ status }: { status: string }) {
  const currentStepIndex = statusSteps.findIndex((s) => s.key === status);
  const activeStep = currentStepIndex === -1 ? 0 : currentStepIndex;

  return (
    <div className="flex items-center gap-2 sm:gap-4 py-4 overflow-x-auto">
      {statusSteps.map((step, index) => {
        const StepIcon = step.icon;
        const isCompleted = index < activeStep;
        const isCurrent = index === activeStep;
        const isFailed = status === 'FAILED';

        return (
          <div key={step.key} className="flex items-center gap-2 sm:gap-4 min-w-0">
            <div className="flex flex-col items-center gap-1.5 min-w-0">
              <div
                className={cn(
                  'flex items-center justify-center size-9 rounded-full border-2 transition-all',
                  isCompleted
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : isCurrent && !isFailed
                    ? 'bg-violet-500 border-violet-500 text-white'
                    : isFailed && isCurrent
                    ? 'bg-red-500 border-red-500 text-white'
                    : 'border-muted-foreground/30 text-muted-foreground/50'
                )}
              >
                <StepIcon className="size-4" />
              </div>
              <span
                className={cn(
                  'text-xs font-medium whitespace-nowrap',
                  isCompleted
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : isCurrent
                    ? isFailed
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-violet-600 dark:text-violet-400'
                    : 'text-muted-foreground/50'
                )}
              >
                {step.label}
              </span>
            </div>
            {index < statusSteps.length - 1 && (
              <div
                className={cn(
                  'h-0.5 w-8 sm:w-16 flex-shrink-0 rounded-full transition-colors',
                  index < activeStep
                    ? 'bg-emerald-500'
                    : 'bg-muted-foreground/20'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) {
      fetchOrders();
    }
  }, [session, fetchOrders]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-24 pb-16 flex items-center justify-center">
          <Loader2 className="size-8 animate-spin text-violet-500" />
        </main>
        <Footer />
      </div>
    );
  }

  const toggleExpand = (orderId: string) => {
    setExpandedOrder((prev) => (prev === orderId ? null : orderId));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Button variant="ghost" asChild className="mb-4 text-muted-foreground">
              <Link href="/profile">
                <ArrowLeft className="size-4 mr-2" />
                Back to Profile
              </Link>
            </Button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Order History</h1>
                <p className="text-muted-foreground mt-1">
                  Track and manage your orders
                </p>
              </div>
              <Badge variant="secondary" className="text-sm">
                {orders.length} {orders.length === 1 ? 'order' : 'orders'}
              </Badge>
            </div>
          </motion.div>

          {/* Orders List */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="size-8 animate-spin text-violet-500" />
            </div>
          ) : orders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-950/40 dark:to-purple-950/40 flex items-center justify-center mb-6">
                    <Package className="size-10 text-violet-400 dark:text-violet-500" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">No Orders Yet</h2>
                  <p className="text-muted-foreground max-w-md mb-8">
                    You haven&apos;t placed any orders yet. Start exploring our
                    collection and find your next great read!
                  </p>
                  <Button
                    asChild
                    className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg"
                  >
                    <Link href="/#books">
                      <BookOpen className="size-4 mr-2" />
                      Browse Books
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {orders.map((order, index) => {
                const statusInfo = statusConfig[order.paymentStatus] || statusConfig.PENDING;
                const StatusIcon = statusInfo.icon;
                const isExpanded = expandedOrder === order.id;

                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="overflow-hidden hover:shadow-md transition-shadow">
                      {/* Order Header */}
                      <button
                        onClick={() => toggleExpand(order.id)}
                        className="w-full text-left"
                      >
                        <CardContent className="p-4 sm:p-6">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-3 flex-wrap">
                                <span className="font-mono text-sm font-semibold">
                                  #{order.id.slice(-8).toUpperCase()}
                                </span>
                                <Badge
                                  variant="secondary"
                                  className={cn('text-xs', statusInfo.color)}
                                >
                                  <StatusIcon className="size-3 mr-1" />
                                  {statusInfo.label}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Placed on{' '}
                                {new Date(order.createdAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <span className="font-semibold text-lg text-violet-600 dark:text-violet-400">
                                  ${order.total.toFixed(2)}
                                </span>
                                <p className="text-xs text-muted-foreground">
                                  {order.orderItems.length}{' '}
                                  {order.orderItems.length === 1 ? 'item' : 'items'}
                                </p>
                              </div>
                              <motion.div
                                animate={{ rotate: isExpanded ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <ChevronDown className="size-5 text-muted-foreground" />
                              </motion.div>
                            </div>
                          </div>
                        </CardContent>
                      </button>

                      {/* Expanded Order Details */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                              <Separator className="mb-4" />

                              {/* Status Tracker */}
                              <div className="mb-6">
                                <h4 className="text-sm font-medium mb-2">Order Status</h4>
                                <OrderStatusTracker status={order.paymentStatus} />
                              </div>

                              {/* Order Items */}
                              <h4 className="text-sm font-medium mb-3">Items</h4>
                              <div className="space-y-3">
                                {order.orderItems.map((item) => (
                                  <div
                                    key={item.id}
                                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                                  >
                                    <div className="w-12 h-16 rounded bg-gradient-to-br from-violet-500 to-purple-600 flex-shrink-0 flex items-center justify-center">
                                      <BookOpen className="size-5 text-white/70" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h5 className="font-medium text-sm line-clamp-1">
                                        {item.book.title}
                                      </h5>
                                      <p className="text-xs text-muted-foreground">
                                        {item.book.author}
                                      </p>
                                      <div className="flex items-center gap-2 mt-1">
                                        <Badge variant="outline" className="text-[10px] h-5">
                                          {item.book.format || 'PDF'}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">
                                          Qty: {item.quantity}
                                        </span>
                                      </div>
                                    </div>
                                    <span className="font-semibold text-sm text-violet-600 dark:text-violet-400 flex-shrink-0">
                                      ${(item.price * item.quantity).toFixed(2)}
                                    </span>
                                  </div>
                                ))}
                              </div>

                              {/* Order Total */}
                              <Separator className="my-4" />
                              <div className="flex items-center justify-between">
                                <span className="font-medium">Order Total</span>
                                <span className="font-bold text-lg text-violet-600 dark:text-violet-400">
                                  ${order.total.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
