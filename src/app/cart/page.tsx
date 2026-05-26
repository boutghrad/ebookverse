'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, BookOpen, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCartStore } from '@/lib/store';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import CartItemCard from '@/components/shared/CartItemCard';

export default function CartPage() {
  const { items, getTotal, clearCart } = useCartStore();
  const itemCount = items.length;

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

  // Empty cart state
  if (itemCount === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-24 pb-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              {/* Empty Cart Illustration */}
              <div className="relative mb-8">
                <div className="w-40 h-40 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-950/40 dark:to-purple-950/40 flex items-center justify-center">
                  <ShoppingBag className="size-16 text-violet-400 dark:text-violet-500" />
                </div>
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -top-2 -right-2 w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg"
                >
                  <BookOpen className="size-6 text-white" />
                </motion.div>
              </div>
              <h2 className="text-2xl font-bold mb-2">Your Cart is Empty</h2>
              <p className="text-muted-foreground max-w-md mb-8">
                Looks like you haven&apos;t added any books yet. Start exploring our
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
            </motion.div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold">Shopping Cart</h1>
            <p className="text-muted-foreground mt-1">
              {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-3">
              <AnimatePresence mode="popLayout">
                {items.map((item) => (
                  <CartItemCard key={item.bookId} item={item} layout="horizontal" />
                ))}
              </AnimatePresence>

              {/* Continue Shopping */}
              <div className="pt-4">
                <Button variant="ghost" asChild className="text-muted-foreground">
                  <Link href="/#books">
                    <ArrowLeft className="size-4 mr-2" />
                    Continue Shopping
                  </Link>
                </Button>
              </div>
            </div>

            {/* Cart Summary Sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="sticky top-24 rounded-xl border bg-card p-6 shadow-sm space-y-5"
              >
                <h2 className="text-lg font-semibold">Order Summary</h2>

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
                  <span className="text-violet-600 dark:text-violet-400">
                    ${total.toFixed(2)}
                  </span>
                </div>

                <Button
                  asChild
                  className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg h-12 text-base"
                >
                  <Link href="/checkout">
                    Proceed to Checkout
                    <ArrowRight className="size-4 ml-2" />
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  className="w-full text-muted-foreground"
                  onClick={clearCart}
                >
                  Clear Cart
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
