'use client';

import { motion } from 'framer-motion';
import { Minus, Plus, Trash2, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore, type CartItem } from '@/lib/store';
import { cn } from '@/lib/utils';

const coverGradients = [
  'from-violet-500 via-purple-500 to-fuchsia-500',
  'from-rose-500 via-pink-500 to-purple-500',
  'from-amber-500 via-orange-500 to-red-500',
  'from-emerald-500 via-teal-500 to-cyan-500',
  'from-blue-500 via-indigo-500 to-violet-500',
  'from-pink-500 via-rose-500 to-red-500',
];

function getGradient(id: string) {
  const index = parseInt(id, 36) % coverGradients.length;
  return coverGradients[index];
}

interface CartItemCardProps {
  item: CartItem;
  layout?: 'horizontal' | 'vertical';
}

export default function CartItemCard({ item, layout = 'horizontal' }: CartItemCardProps) {
  const { updateQuantity, removeItem } = useCartStore();
  const gradient = getGradient(item.bookId);
  const effectivePrice = item.discountPrice || item.price;
  const hasDiscount = item.discountPrice && item.discountPrice < item.price;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'group rounded-xl border bg-card shadow-sm hover:shadow-md transition-shadow',
        layout === 'horizontal'
          ? 'flex flex-col sm:flex-row gap-4 p-4'
          : 'flex flex-col gap-3 p-4'
      )}
    >
      {/* Cover Image */}
      <div
        className={cn(
          'relative overflow-hidden rounded-lg flex-shrink-0',
          layout === 'horizontal'
            ? 'w-full sm:w-20 h-32 sm:h-28'
            : 'w-full h-40'
        )}
      >
        <div
          className={cn(
            'absolute inset-0 bg-gradient-to-br flex items-center justify-center',
            gradient
          )}
        >
          <BookOpen className="size-8 text-white/70" />
        </div>
      </div>

      {/* Details */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div className="space-y-1">
          <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
            {item.title}
          </h3>
          <p className="text-xs text-muted-foreground">{item.author}</p>
        </div>

        {/* Price + Controls */}
        <div className="flex items-center justify-between gap-4 mt-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-violet-600 dark:text-violet-400">
              ${effectivePrice.toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-muted-foreground line-through">
                ${item.price.toFixed(2)}
              </span>
            )}
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => updateQuantity(item.bookId, item.quantity - 1)}
              aria-label="Decrease quantity"
            >
              <Minus className="size-3" />
            </Button>
            <motion.span
              key={item.quantity}
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
              className="w-8 text-center text-sm font-semibold tabular-nums"
            >
              {item.quantity}
            </motion.span>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => updateQuantity(item.bookId, item.quantity + 1)}
              aria-label="Increase quantity"
            >
              <Plus className="size-3" />
            </Button>

            {/* Remove Button */}
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground hover:text-destructive"
              onClick={() => removeItem(item.bookId)}
              aria-label="Remove from cart"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
