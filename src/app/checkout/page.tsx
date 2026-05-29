'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import {
  CreditCard,
  Lock,
  CheckCircle2,
  ShoppingBag,
  BookOpen,
  ArrowLeft,
  Loader2,
  Gift,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCartStore } from '@/lib/store';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';

// Dynamically import PayPalButtons to avoid SSR issues
const PayPalButtons = dynamic(
  () => import('@paypal/react-paypal-js').then((mod) => mod.PayPalButtons),
  { ssr: false }
);

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { items, getTotal, clearCart } = useCartStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState('');

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  const discount = useMemo(() => {
    return items.reduce((sum, item) => {
      if (item.discountPrice) {
        return sum + (item.price - item.discountPrice) * item.quantity;
      }
      return sum;
    }, 0);
  }, [items]);

  const total = getTotal();

  // Check if all items are free
  const isAllFree = total === 0;
  const hasAnyFree = items.some((item) => item.price === 0 || item.discountPrice === 0);

  // PayPal Client ID
  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  // Loading auth state
  if (status === 'loading') {
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

  // Not logged in
  if (!session) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-24 pb-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-950/40 dark:to-purple-950/40 flex items-center justify-center mb-6">
                <Lock className="size-10 text-violet-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Please Sign In to Checkout</h2>
              <p className="text-muted-foreground max-w-md mb-8">
                You need to be logged in to complete your purchase. Sign in to
                access your cart and place orders.
              </p>
              <div className="flex items-center gap-4">
                <Button
                  asChild
                  className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg"
                >
                  <Link href="/auth/signin">Sign In</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/#books">Browse Books</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Order success state
  if (orderSuccess) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-24 pb-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, type: 'spring' }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center mb-6 shadow-lg"
              >
                <CheckCircle2 className="size-12 text-white" />
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-3xl font-bold mb-2"
              >
                Order Placed Successfully!
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-muted-foreground max-w-md mb-2"
              >
                {isAllFree
                  ? 'Your free books are ready to download. Enjoy your reading!'
                  : 'Thank you for your purchase. Your order has been confirmed.'}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="inline-flex items-center gap-2 rounded-lg bg-muted px-4 py-2 mb-8"
              >
                <span className="text-sm text-muted-foreground">Order Number:</span>
                <span className="font-mono font-semibold text-violet-600 dark:text-violet-400">
                  {orderNumber}
                </span>
              </motion.div>
              {/* Download Books Section */}
              {isAllFree && items.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.65 }}
                  className="mb-8 w-full max-w-lg"
                >
                  <div className="rounded-xl border bg-emerald-50/50 dark:bg-emerald-950/20 p-5">
                    <h3 className="font-semibold text-emerald-700 dark:text-emerald-300 mb-3 flex items-center gap-2">
                      <Download className="size-5" />
                      Download Your Free Books
                    </h3>
                    <div className="space-y-2">
                      {items.map((item) => (
                        <Button
                          key={item.bookId}
                          variant="outline"
                          size="sm"
                          className="w-full justify-start gap-2 text-sm border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-950/30"
                          onClick={async () => {
                            try {
                              const res = await fetch(`/api/download/${item.bookId}`);
                              if (!res.ok) {
                                toast.error('Download failed. Please try again from your orders page.');
                                return;
                              }
                              const blob = await res.blob();
                              const url = window.URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `${item.title.replace(/\s+/g, '-').toLowerCase()}.pdf`;
                              document.body.appendChild(a);
                              a.click();
                              window.URL.revokeObjectURL(url);
                              document.body.removeChild(a);
                              toast.success(`Downloading ${item.title}...`);
                            } catch {
                              toast.error('Download failed');
                            }
                          }}
                        >
                          <Download className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                          {item.title}
                        </Button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex items-center gap-4"
              >
                <Button
                  asChild
                  className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg"
                >
                  <Link href="/profile/orders">
                    <ShoppingBag className="size-4 mr-2" />
                    View Orders
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/#books">
                    <BookOpen className="size-4 mr-2" />
                    Continue Shopping
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Empty cart - redirect to cart page
  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-24 pb-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-950/40 dark:to-purple-950/40 flex items-center justify-center mb-6">
                <ShoppingBag className="size-10 text-violet-400" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Your Cart is Empty</h2>
              <p className="text-muted-foreground max-w-md mb-8">
                Add some books to your cart before checking out.
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
            </motion.div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Handle card/simulated payment
  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const orderItems = items.map((item) => ({
        bookId: item.bookId,
        quantity: item.quantity,
      }));

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: orderItems,
          paymentMethod: paymentMethod,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to place order');
      }

      const data = await res.json();
      setOrderNumber(data.order?.id || 'ORD-' + Date.now().toString(36).toUpperCase());
      clearCart();
      setOrderSuccess(true);
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // PayPal create order callback
  const handlePayPalCreateOrder = async () => {
    try {
      const paypalItems = items.map((item) => ({
        bookId: item.bookId,
        title: item.title,
        quantity: item.quantity,
        price: (item.discountPrice || item.price),
      }));

      const res = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ total, items: paypalItems }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create PayPal order');
      }

      const data = await res.json();
      return data.orderID;
    } catch (error) {
      console.error('PayPal create order error:', error);
      toast.error('Failed to initiate PayPal payment. Please try again.');
      throw error;
    }
  };

  // PayPal on approve callback
  const handlePayPalOnApprove = async (data: { orderID: string }) => {
    setIsSubmitting(true);
    try {
      const orderItems = items.map((item) => ({
        bookId: item.bookId,
        quantity: item.quantity,
      }));

      const res = await fetch('/api/paypal/capture-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paypalOrderID: data.orderID,
          items: orderItems,
        }),
      });

      if (!res.ok) {
        const responseData = await res.json();
        throw new Error(responseData.error || 'Failed to capture PayPal payment');
      }

      const responseData = await res.json();
      setOrderNumber(responseData.order?.id || 'ORD-' + Date.now().toString(36).toUpperCase());
      clearCart();
      setOrderSuccess(true);
      toast.success('Payment completed successfully!');
    } catch (error) {
      console.error('PayPal capture error:', error);
      toast.error('PayPal payment failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
              <Link href="/cart">
                <ArrowLeft className="size-4 mr-2" />
                Back to Cart
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">Checkout</h1>
            <p className="text-muted-foreground mt-1">
              Complete your purchase
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Payment Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Free Order Notice */}
              {isAllFree && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 p-6 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <Gift className="size-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-emerald-700 dark:text-emerald-300 text-lg">
                        Free Order - No Payment Required!
                      </h3>
                      <p className="text-sm text-emerald-600/80 dark:text-emerald-400/80 mt-1">
                        All items in your cart are free. Just confirm your order and download your books instantly. No credit card needed.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Payment Method - only show if not all free */}
              {!isAllFree && (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-xl border bg-card p-6 shadow-sm"
                  >
                    <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                      <div
                        className={cn(
                          "flex items-center space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-accent/50 transition-colors",
                          paymentMethod === 'card' && 'border-violet-500 bg-violet-50/50 dark:bg-violet-950/20'
                        )}
                      >
                        <RadioGroupItem value="card" id="card" />
                        <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer flex-1">
                          <CreditCard className="size-4 text-violet-500" />
                          <span className="font-medium">Credit / Debit Card</span>
                        </Label>
                        <span className="text-xs text-muted-foreground">Secure</span>
                      </div>
                      <div
                        className={cn(
                          "flex items-center space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-accent/50 transition-colors",
                          paymentMethod === 'paypal' && 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
                        )}
                      >
                        <RadioGroupItem value="paypal" id="paypal" />
                        <Label htmlFor="paypal" className="flex items-center gap-2 cursor-pointer flex-1">
                          <svg className="size-4" viewBox="0 0 24 24" fill="none">
                            <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.77.77 0 0 1 .757-.654h6.328c2.352 0 4.047.644 4.898 1.867.395.566.637 1.207.72 1.916.087.754-.023 1.63-.337 2.676-.733 2.468-2.128 3.988-4.148 4.502a9.61 9.61 0 0 1-2.346.282H8.19a.77.77 0 0 0-.757.654l-.357 2.267-.01.063-1.057 6.744z" fill="#003087"/>
                            <path d="M21.076 8.933c-.023.146-.049.295-.078.447-.953 4.878-4.215 6.565-8.38 6.565h-2.12a1.03 1.03 0 0 0-1.017.868l-.957 6.06-.252 1.598a.544.544 0 0 0 .537.629h3.764a.901.901 0 0 0 .888-.76l.037-.189.705-4.468.046-.246a.901.901 0 0 1 .888-.76h.56c3.624 0 6.457-1.47 7.288-5.724.346-1.777.167-3.26-.75-4.3-.278-.314-.622-.577-1.017-.8z" fill="#0070E0"/>
                            <path d="M19.823 8.393a6.69 6.69 0 0 0-.836-.19 10.6 10.6 0 0 0-1.692-.128h-5.116a.9.9 0 0 0-.888.761l-.745 4.726-.023.148a1.03 1.03 0 0 1 1.017-.868h2.12c4.165 0 7.427-1.688 8.38-6.565.029-.152.055-.301.078-.447a5.21 5.21 0 0 0-.8-.341 7.028 7.028 0 0 0-.447-.132 4.09 4.09 0 0 1-.848-.064z" fill="#012169"/>
                          </svg>
                          <span className="font-medium">PayPal</span>
                        </Label>
                        <span className="text-xs text-muted-foreground">Fast & Secure</span>
                      </div>
                    </RadioGroup>
                  </motion.div>

                  {/* Credit Card Form */}
                  <AnimatePresence>
                    {paymentMethod === 'card' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="rounded-xl border bg-card p-6 shadow-sm overflow-hidden"
                      >
                        <h2 className="text-lg font-semibold mb-4">Card Details</h2>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="cardName">Name on Card</Label>
                            <Input
                              id="cardName"
                              placeholder="John Doe"
                              value={cardName}
                              onChange={(e) => setCardName(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cardNumber">Card Number</Label>
                            <div className="relative">
                              <Input
                                id="cardNumber"
                                placeholder="4242 4242 4242 4242"
                                value={cardNumber}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/\D/g, '').slice(0, 16);
                                  const formatted = val.replace(/(.{4})/g, '$1 ').trim();
                                  setCardNumber(formatted);
                                }}
                                maxLength={19}
                                className="pr-12"
                              />
                              <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="expiry">Expiry Date</Label>
                              <Input
                                id="expiry"
                                placeholder="MM/YY"
                                value={cardExpiry}
                                onChange={(e) => {
                                  let val = e.target.value.replace(/\D/g, '').slice(0, 4);
                                  if (val.length > 2) val = val.slice(0, 2) + '/' + val.slice(2);
                                  setCardExpiry(val);
                                }}
                                maxLength={5}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="cvc">CVC</Label>
                              <Input
                                id="cvc"
                                placeholder="123"
                                value={cardCvc}
                                onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                maxLength={4}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                          <Lock className="size-3" />
                          <span>Your payment information is encrypted and secure</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* PayPal Payment Section */}
                  <AnimatePresence>
                    {paymentMethod === 'paypal' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="rounded-xl border bg-card p-6 shadow-sm overflow-hidden"
                      >
                        <h2 className="text-lg font-semibold mb-4">Pay with PayPal</h2>
                        <p className="text-sm text-muted-foreground mb-4">
                          You will be redirected to PayPal to complete your payment securely.
                        </p>
                        {paypalClientId ? (
                          <div className="min-h-[150px]">
                            <PayPalButtons
                              style={{
                                layout: 'vertical',
                                color: 'gold',
                                shape: 'rect',
                                label: 'paypal',
                                height: 45,
                              }}
                              createOrder={handlePayPalCreateOrder}
                              onApprove={handlePayPalOnApprove}
                              onError={(err) => {
                                console.error('PayPal button error:', err);
                                toast.error('PayPal payment failed. Please try again.');
                              }}
                              onCancel={() => {
                                toast.info('PayPal payment cancelled.');
                              }}
                            />
                          </div>
                        ) : (
                          <div className="rounded-lg border border-dashed border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-950/20 p-4 text-center">
                            <p className="text-sm text-yellow-700 dark:text-yellow-400">
                              PayPal is being configured. Please use card payment for now.
                            </p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}

              {/* Mixed cart notice - some free, some paid */}
              {hasAnyFree && !isAllFree && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20 p-4 shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <Gift className="size-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Your cart contains free books. They will be included in your order at no charge.
                    </p>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="sticky top-24 rounded-xl border bg-card p-6 shadow-sm space-y-5"
              >
                <h2 className="text-lg font-semibold">Order Summary</h2>

                {/* Item List */}
                <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
                  {items.map((item) => {
                    const effectivePrice = item.discountPrice || item.price;
                    const itemIsFree = item.price === 0 || item.discountPrice === 0;
                    return (
                      <div key={item.bookId} className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-14 rounded flex-shrink-0 flex items-center justify-center",
                          itemIsFree
                            ? "bg-gradient-to-br from-emerald-500 to-teal-500"
                            : "bg-gradient-to-br from-violet-500 to-purple-600"
                        )}>
                          {itemIsFree ? (
                            <Gift className="size-4 text-white/70" />
                          ) : (
                            <BookOpen className="size-4 text-white/70" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-1">{item.title}</p>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <span className="text-sm font-medium">
                          {itemIsFree ? (
                            <span className="text-emerald-600 dark:text-emerald-400">FREE</span>
                          ) : (
                            `$${(effectivePrice * item.quantity).toFixed(2)}`
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Discount</span>
                      <span className="text-emerald-600 dark:text-emerald-400">
                        -${discount.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-emerald-600 dark:text-emerald-400">Free</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span className={isAllFree ? 'text-emerald-600 dark:text-emerald-400' : 'text-violet-600 dark:text-violet-400'}>
                    {isAllFree ? 'FREE' : `$${total.toFixed(2)}`}
                  </span>
                </div>

                {/* Place Order button - only for card/free orders */}
                {(paymentMethod === 'card' || isAllFree) && (
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className={cn(
                      'w-full shadow-lg h-12 text-base',
                      isAllFree
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white'
                        : 'bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white'
                    )}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="size-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : isAllFree ? (
                      <>
                        <Download className="size-4 mr-2" />
                        Confirm Free Order
                      </>
                    ) : (
                      <>
                        <Lock className="size-4 mr-2" />
                        Place Order
                      </>
                    )}
                  </Button>
                )}

                {/* PayPal info when PayPal is selected */}
                {paymentMethod === 'paypal' && !isAllFree && (
                  <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 p-3 text-center">
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      Click the PayPal button above to complete your payment
                    </p>
                  </div>
                )}

                <p className="text-xs text-center text-muted-foreground">
                  {isAllFree
                    ? 'Confirm to download your free books instantly'
                    : 'By placing your order, you agree to our Terms of Service'
                  }
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
