'use client';

import { useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BookOpen, Heart, Star, ShoppingCart, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartStore, useWishlistStore } from '@/lib/store';
import { cn } from '@/lib/utils';

export interface BookProps {
  id: string;
  title: string;
  slug: string;
  author: string;
  coverImage?: string;
  price: number;
  discountPrice?: number;
  rating: number;
  totalReviews: number;
  category: string;
}

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

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            'size-3.5',
            star <= Math.round(rating)
              ? 'fill-amber-400 text-amber-400'
              : 'fill-muted text-muted'
          )}
        />
      ))}
    </div>
  );
}

const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export default function BookCard({ book }: { book: BookProps }) {
  const [isHovered, setIsHovered] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();
  const mounted = useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot);
  const inWishlist = mounted ? isInWishlist(book.id) : false;
  const gradient = getGradient(book.id);

  const isFree = book.price === 0 || book.discountPrice === 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      bookId: book.id,
      title: book.title,
      author: book.author,
      price: book.price,
      discountPrice: book.discountPrice,
      coverImage: book.coverImage || '',
    });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWishlist) {
      removeFromWishlist(book.id);
    } else {
      addToWishlist({
        bookId: book.id,
        title: book.title,
        author: book.author,
        price: book.price,
        discountPrice: book.discountPrice,
        coverImage: book.coverImage || '',
        slug: book.slug,
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      transition={{ duration: 0.3 }}
    >
      <Link href={`/books/${book.slug}`} className="block group">
        <div className="rounded-xl border bg-card overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
          {/* Cover Image */}
          <div className="relative aspect-[3/4] overflow-hidden">
            <div
              className={cn(
                'absolute inset-0 bg-gradient-to-br',
                isFree ? 'from-emerald-500 via-teal-500 to-cyan-500' : gradient,
                'flex items-center justify-center transition-transform duration-500 group-hover:scale-105'
              )}
            >
              <BookOpen className="size-16 text-white/70" />
            </div>

            {/* Wishlist Button */}
            <button
              onClick={handleWishlist}
              className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
              aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart
                className={cn(
                  'size-4 transition-colors',
                  inWishlist ? 'fill-red-500 text-red-500' : 'text-white'
                )}
              />
            </button>

            {/* Category Badge */}
            <div className="absolute top-3 left-3 z-10">
              <Badge variant="secondary" className="bg-white/20 backdrop-blur-sm text-white border-0 text-xs">
                {book.category}
              </Badge>
            </div>

            {/* FREE Badge */}
            {isFree && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 mt-8">
                <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 px-3 py-1 text-sm font-bold shadow-lg animate-pulse">
                  FREE
                </Badge>
              </div>
            )}

            {/* Add to Cart / Get Free Overlay */}
            <motion.div
              initial={false}
              animate={{ opacity: isHovered ? 1 : 0 }}
              className="absolute inset-x-0 bottom-0 z-10 p-3"
            >
              <Button
                onClick={handleAddToCart}
                className={cn(
                  'w-full backdrop-blur-sm shadow-lg',
                  isFree
                    ? 'bg-emerald-500/90 hover:bg-emerald-600 text-white'
                    : 'bg-white/90 text-foreground hover:bg-white'
                )}
                size="sm"
              >
                {isFree ? (
                  <>
                    <Download className="size-4 mr-1" />
                    Get Free
                  </>
                ) : (
                  <>
                    <ShoppingCart className="size-4 mr-1" />
                    Add to Cart
                  </>
                )}
              </Button>
            </motion.div>
          </div>

          {/* Info */}
          <div className="p-4 space-y-2">
            <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
              {book.title}
            </h3>
            <p className="text-xs text-muted-foreground">{book.author}</p>
            <div className="flex items-center gap-2">
              <StarRating rating={book.rating} />
              <span className="text-xs text-muted-foreground">({book.totalReviews})</span>
            </div>
            <div className="flex items-center gap-2 pt-1">
              {isFree ? (
                <span className="font-bold text-base text-emerald-600 dark:text-emerald-400">
                  FREE
                </span>
              ) : book.discountPrice ? (
                <>
                  <span className="font-bold text-base text-violet-600 dark:text-violet-400">
                    ${book.discountPrice.toFixed(2)}
                  </span>
                  <span className="text-sm text-muted-foreground line-through">
                    ${book.price.toFixed(2)}
                  </span>
                </>
              ) : (
                <span className="font-bold text-base text-violet-600 dark:text-violet-400">
                  ${book.price.toFixed(2)}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
