'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import {
  User,
  Mail,
  Calendar,
  ShoppingBag,
  Heart,
  BookOpen,
  Trash2,
  ShoppingCart,
  Loader2,
  Save,
  Package,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Bell,
  MailCheck,
  MailX,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCartStore, useWishlistStore } from '@/lib/store';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { cn } from '@/lib/utils';

interface OrderItem {
  id: string;
  title: string;
  author: string;
  coverImage: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  total: number;
  paymentStatus: string;
  createdAt: string;
  orderItems: {
    id: string;
    quantity: number;
    price: number;
    book: {
      id: string;
      title: string;
      author: string;
      coverImage: string;
    };
  }[];
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  PENDING: { label: 'Pending', color: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400', icon: Clock },
  COMPLETED: { label: 'Completed', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400', icon: CheckCircle2 },
  FAILED: { label: 'Failed', color: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400', icon: AlertCircle },
};

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { addItem } = useCartStore();
  const { items: wishlistItems, removeItem: removeFromWishlist } = useWishlistStore();

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [updatingEmailPref, setUpdatingEmailPref] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      setOrdersLoading(true);
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) {
      setEditName(session.user?.name || '');
      setEditEmail(session.user?.email || '');
      setEmailNotifications((session.user as any)?.emailNotifications ?? true);
      fetchOrders();
    }
  }, [session, fetchOrders]);

  // Redirect if not logged in
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

  const userInitials = session?.user?.name
    ? session.user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  const handleSaveProfile = async () => {
    setIsSaving(true);
    // Simulate save
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    setIsEditing(false);
  };

  const handleAddToCart = (item: typeof wishlistItems[0]) => {
    addItem({
      bookId: item.bookId,
      title: item.title,
      author: item.author,
      price: item.price,
      discountPrice: item.discountPrice,
      coverImage: item.coverImage,
    });
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
            <h1 className="text-3xl font-bold">My Profile</h1>
            <p className="text-muted-foreground mt-1">Manage your account and orders</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* User Info Card */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center">
                      <Avatar className="size-20 mb-4">
                        <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white text-xl font-bold">
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                      <h2 className="font-semibold text-lg">{session?.user?.name || 'User'}</h2>
                      <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
                      <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                        <Calendar className="size-3" />
                        <span>Member since 2024</span>
                      </div>
                    </div>

                    <Separator className="my-6" />

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">
                          {orders.length}
                        </p>
                        <p className="text-xs text-muted-foreground">Orders</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">
                          {wishlistItems.length}
                        </p>
                        <p className="text-xs text-muted-foreground">Wishlist</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Edit Profile Form */}
                <Card className="mt-4">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center justify-between">
                      <span>Edit Profile</span>
                      {!isEditing && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsEditing(true)}
                          className="text-xs text-violet-600 dark:text-violet-400"
                        >
                          Edit
                        </Button>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AnimatePresence mode="wait">
                      {isEditing ? (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-4"
                        >
                          <div className="space-y-2">
                            <Label htmlFor="editName" className="text-xs">
                              <User className="size-3 inline mr-1" />
                              Name
                            </Label>
                            <Input
                              id="editName"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="h-9 text-sm"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="editEmail" className="text-xs">
                              <Mail className="size-3 inline mr-1" />
                              Email
                            </Label>
                            <Input
                              id="editEmail"
                              type="email"
                              value={editEmail}
                              onChange={(e) => setEditEmail(e.target.value)}
                              className="h-9 text-sm"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={handleSaveProfile}
                              disabled={isSaving}
                              className="flex-1 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white"
                            >
                              {isSaving ? (
                                <Loader2 className="size-3 animate-spin mr-1" />
                              ) : (
                                <Save className="size-3 mr-1" />
                              )}
                              Save
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setIsEditing(false);
                                setEditName(session?.user?.name || '');
                                setEditEmail(session?.user?.email || '');
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="space-y-3 text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <User className="size-4 text-muted-foreground" />
                            <span>{session?.user?.name || 'Not set'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="size-4 text-muted-foreground" />
                            <span>{session?.user?.email || 'Not set'}</span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Tabs: Orders & Wishlist */}
            <div className="lg:col-span-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Tabs defaultValue="orders" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-3 max-w-lg">
                    <TabsTrigger value="orders" className="flex items-center gap-2">
                      <ShoppingBag className="size-4" />
                      My Orders
                    </TabsTrigger>
                    <TabsTrigger value="wishlist" className="flex items-center gap-2">
                      <Heart className="size-4" />
                      Wishlist
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="flex items-center gap-2">
                      <Bell className="size-4" />
                      Notifications
                    </TabsTrigger>
                  </TabsList>

                  {/* Orders Tab */}
                  <TabsContent value="orders" className="space-y-4">
                    {ordersLoading ? (
                      <div className="flex items-center justify-center py-16">
                        <Loader2 className="size-8 animate-spin text-violet-500" />
                      </div>
                    ) : orders.length === 0 ? (
                      <Card>
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                          <Package className="size-12 text-muted-foreground/50 mb-4" />
                          <h3 className="font-semibold text-lg mb-1">No Orders Yet</h3>
                          <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                            You haven&apos;t placed any orders yet. Start browsing and find
                            your next great read!
                          </p>
                          <Button
                            asChild
                            className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white"
                          >
                            <Link href="/#books">
                              <BookOpen className="size-4 mr-2" />
                              Browse Books
                            </Link>
                          </Button>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="space-y-3">
                        {orders.map((order, index) => {
                          const statusInfo = statusConfig[order.paymentStatus] || statusConfig.PENDING;
                          const StatusIcon = statusInfo.icon;
                          return (
                            <motion.div
                              key={order.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                            >
                              <Card className="hover:shadow-md transition-shadow">
                                <CardContent className="p-4 sm:p-6">
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-3">
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
                                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                                          year: 'numeric',
                                          month: 'long',
                                          day: 'numeric',
                                        })}
                                        {' · '}
                                        {order.orderItems.length}{' '}
                                        {order.orderItems.length === 1 ? 'item' : 'items'}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                      <span className="font-semibold text-lg text-violet-600 dark:text-violet-400">
                                        ${order.total.toFixed(2)}
                                      </span>
                                      <Button variant="outline" size="sm" asChild>
                                        <Link href={`/profile/orders`}>
                                          View
                                          <ChevronRight className="size-3 ml-1" />
                                        </Link>
                                      </Button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}

                    {orders.length > 0 && (
                      <div className="text-center pt-4">
                        <Button variant="outline" asChild>
                          <Link href="/profile/orders">
                            View All Orders
                            <ChevronRight className="size-4 ml-1" />
                          </Link>
                        </Button>
                      </div>
                    )}
                  </TabsContent>

                  {/* Notifications Tab */}
                  <TabsContent value="notifications" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Mail className="size-5" />
                          Email Notifications
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-accent/50">
                          <div className="flex items-center gap-3">
                            {emailNotifications ? (
                              <div className="size-10 rounded-full bg-violet-100 dark:bg-violet-950/40 flex items-center justify-center">
                                <MailCheck className="size-5 text-violet-600" />
                              </div>
                            ) : (
                              <div className="size-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                <MailX className="size-5 text-gray-400" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-sm">Email Notifications</p>
                              <p className="text-xs text-muted-foreground">
                                Receive order confirmations, promotions, and account updates via email
                              </p>
                            </div>
                          </div>
                          <Button
                            variant={emailNotifications ? 'default' : 'outline'}
                            size="sm"
                            className={emailNotifications ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white' : ''}
                            disabled={updatingEmailPref}
                            onClick={async () => {
                              setUpdatingEmailPref(true);
                              try {
                                const res = await fetch('/api/user/preferences', {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ emailNotifications: !emailNotifications }),
                                });
                                if (res.ok) {
                                  setEmailNotifications(!emailNotifications);
                                }
                              } catch (err) {
                                console.error('Failed to update preference:', err);
                              } finally {
                                setUpdatingEmailPref(false);
                              }
                            }}
                          >
                            {updatingEmailPref ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : emailNotifications ? (
                              'Enabled'
                            ) : (
                              'Disabled'
                            )}
                          </Button>
                        </div>

                        <div className="space-y-3 pt-2">
                          <h4 className="font-medium text-sm">You will receive emails for:</h4>
                          <div className="space-y-2">
                            {[
                              { icon: '📦', label: 'Order confirmations', desc: 'When your order is placed and confirmed' },
                              { icon: '📚', label: 'Free book downloads', desc: 'When you download a free eBook' },
                              { icon: '⭐', label: 'Review confirmations', desc: 'When your review is published' },
                              { icon: '🏷️', label: 'Promotions & discounts', desc: 'Special offers and seasonal sales' },
                              { icon: '📢', label: 'System announcements', desc: 'Important updates from EbookVerse' },
                            ].map((item) => (
                              <div
                                key={item.label}
                                className={cn(
                                  'flex items-center gap-3 p-3 rounded-md transition-colors',
                                  emailNotifications ? 'bg-accent/30' : 'opacity-50'
                                )}
                              >
                                <span className="text-lg">{item.icon}</span>
                                <div>
                                  <p className="text-sm font-medium">{item.label}</p>
                                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Wishlist Tab */}
                  <TabsContent value="wishlist" className="space-y-4">
                    {wishlistItems.length === 0 ? (
                      <Card>
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                          <Heart className="size-12 text-muted-foreground/50 mb-4" />
                          <h3 className="font-semibold text-lg mb-1">Wishlist is Empty</h3>
                          <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                            Save books you&apos;re interested in and come back to them later.
                          </p>
                          <Button
                            asChild
                            className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white"
                          >
                            <Link href="/#books">
                              <BookOpen className="size-4 mr-2" />
                              Browse Books
                            </Link>
                          </Button>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                        {wishlistItems.map((item, index) => {
                          const effectivePrice = item.discountPrice || item.price;
                          const hasDiscount = item.discountPrice && item.discountPrice < item.price;
                          return (
                            <motion.div
                              key={item.bookId}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                            >
                              <Card className="hover:shadow-md transition-shadow overflow-hidden">
                                <div className="flex gap-3 p-4">
                                  {/* Cover */}
                                  <div className="w-16 h-22 rounded-md bg-gradient-to-br from-violet-500 to-purple-600 flex-shrink-0 flex items-center justify-center">
                                    <BookOpen className="size-6 text-white/70" />
                                  </div>
                                  {/* Info */}
                                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                                    <div>
                                      <h4 className="font-medium text-sm line-clamp-2">
                                        {item.title}
                                      </h4>
                                      <p className="text-xs text-muted-foreground mt-0.5">
                                        {item.author}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                      <span className="font-semibold text-sm text-violet-600 dark:text-violet-400">
                                        ${effectivePrice.toFixed(2)}
                                      </span>
                                      {hasDiscount && (
                                        <span className="text-xs text-muted-foreground line-through">
                                          ${item.price.toFixed(2)}
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-7 text-xs flex-1"
                                        onClick={() => handleAddToCart(item)}
                                      >
                                        <ShoppingCart className="size-3 mr-1" />
                                        Add to Cart
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-7 text-xs text-muted-foreground hover:text-destructive"
                                        onClick={() => removeFromWishlist(item.bookId)}
                                      >
                                        <Trash2 className="size-3" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </Card>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
