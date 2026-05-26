'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  Heart,
  Star,
  Send,
  Loader2,
  Check,
  BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useCartStore, useWishlistStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface BookData {
  id: string;
  title: string;
  slug: string;
  author: string;
  coverImage: string;
  price: number;
  discountPrice?: number | null;
  rating: number;
  totalReviews: number;
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

// Add to Cart Button
function AddToCartButton({ book }: { book: BookData }) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem({
      bookId: book.id,
      title: book.title,
      author: book.author,
      price: book.price,
      discountPrice: book.discountPrice ?? undefined,
      coverImage: book.coverImage,
    });
    setAdded(true);
    toast.success('Added to cart!', {
      description: `${book.title} has been added to your cart.`,
    });
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <Button
      onClick={handleAdd}
      size="lg"
      className={cn(
        'flex-1 gap-2 text-base font-semibold h-12 transition-all duration-300',
        added
          ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
          : 'bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
      )}
    >
      {added ? (
        <>
          <Check className="size-5" />
          Added!
        </>
      ) : (
        <>
          <ShoppingCart className="size-5" />
          Add to Cart
        </>
      )}
    </Button>
  );
}

// Add to Wishlist Button
function AddToWishlistButton({ book }: { book: BookData }) {
  const { addItem, removeItem, isInWishlist } = useWishlistStore();
  const inWishlist = isInWishlist(book.id);

  const handleToggle = () => {
    if (inWishlist) {
      removeItem(book.id);
      toast.success('Removed from wishlist', {
        description: `${book.title} has been removed from your wishlist.`,
      });
    } else {
      addItem({
        bookId: book.id,
        title: book.title,
        author: book.author,
        price: book.price,
        discountPrice: book.discountPrice ?? undefined,
        coverImage: book.coverImage,
        slug: book.slug,
      });
      toast.success('Added to wishlist!', {
        description: `${book.title} has been added to your wishlist.`,
      });
    }
  };

  return (
    <Button
      onClick={handleToggle}
      variant="outline"
      size="lg"
      className={cn(
        'gap-2 h-12 font-semibold transition-all duration-300',
        inWishlist
          ? 'border-red-300 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20'
          : 'hover:border-violet-300'
      )}
    >
      <Heart
        className={cn(
          'size-5 transition-all',
          inWishlist && 'fill-red-500 text-red-500'
        )}
      />
      {inWishlist ? 'In Wishlist' : 'Wishlist'}
    </Button>
  );
}

// Review Form Component
function ReviewForm({ bookId }: { bookId: string }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    if (!comment.trim()) {
      toast.error('Please write a comment');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId, rating, comment: comment.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          toast.error('Please sign in to write a review');
          return;
        }
        toast.error(data.error || 'Failed to submit review');
        return;
      }

      toast.success('Review submitted!', {
        description: 'Thank you for your feedback.',
      });
      setRating(0);
      setComment('');
      // Reload page to show new review
      setTimeout(() => window.location.reload(), 1000);
    } catch {
      toast.error('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label className="text-sm font-medium mb-2 block">Your Rating</Label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-0.5 transition-transform hover:scale-110"
            >
              <Star
                className={cn(
                  'size-7 transition-colors',
                  star <= (hoverRating || rating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'fill-muted text-muted'
                )}
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-2 text-sm text-muted-foreground">
              {rating} of 5
            </span>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="review-comment" className="text-sm font-medium mb-2 block">
          Your Review
        </Label>
        <Textarea
          id="review-comment"
          placeholder="Share your thoughts about this book..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          className="resize-none"
        />
      </div>

      <Button
        type="submit"
        disabled={submitting}
        className="gap-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white"
      >
        {submitting ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Send className="size-4" />
        )}
        {submitting ? 'Submitting...' : 'Submit Review'}
      </Button>
    </form>
  );
}

// Review List Item
function ReviewItem({ review }: { review: Review }) {
  const initials = review.user.name
    ? review.user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-4 p-4 rounded-xl border bg-card"
    >
      <div className="flex-shrink-0">
        <div className="size-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
          {initials}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm">
            {review.user.name || 'Anonymous'}
          </span>
          <span className="text-xs text-muted-foreground">
            {new Date(review.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>
        <div className="flex items-center gap-0.5 mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={cn(
                'size-3.5',
                star <= review.rating
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-muted text-muted'
              )}
            />
          ))}
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {review.comment}
        </p>
      </div>
    </motion.div>
  );
}

// Main BookDetailClient Component
export default function BookDetailClient({
  book,
  reviews,
  session,
}: {
  book: {
    id: string;
    title: string;
    slug: string;
    author: string;
    coverImage: string;
    price: number;
    discountPrice: number | null;
    rating: number;
    totalReviews: number;
    description: string;
    pages: number | null;
    language: string;
    format: string;
    tags: string | null;
    category: {
      id: string;
      name: string;
      slug: string;
    };
  };
  reviews: Review[];
  session: { user?: { id?: string; name?: string | null; email?: string | null } } | null;
}) {
  const bookData: BookData = {
    id: book.id,
    title: book.title,
    slug: book.slug,
    author: book.author,
    coverImage: book.coverImage,
    price: book.price,
    discountPrice: book.discountPrice,
    rating: book.rating,
    totalReviews: book.totalReviews,
    category: book.category,
  };

  const hasDiscount = book.discountPrice && book.discountPrice < book.price;
  const discountPercent = hasDiscount
    ? Math.round(((book.price - book.discountPrice!) / book.price) * 100)
    : 0;

  const tags = book.tags ? book.tags.split(',').map((t) => t.trim()) : [];

  return (
    <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
      {/* Book Cover */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="lg:col-span-2"
      >
        <div className="sticky top-28">
          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 flex items-center justify-center">
              <BookOpen className="size-24 text-white/50" />
            </div>
            {hasDiscount && (
              <Badge className="absolute top-4 left-4 bg-gradient-to-r from-rose-500 to-pink-600 text-white border-0 px-3 py-1 text-sm font-semibold">
                -{discountPercent}%
              </Badge>
            )}
          </div>
        </div>
      </motion.div>

      {/* Book Details */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="lg:col-span-3"
      >
        {/* Category Badge */}
        <Badge variant="secondary" className="mb-3">
          {book.category.name}
        </Badge>

        {/* Title & Author */}
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 leading-tight">
          {book.title}
        </h1>
        <p className="text-lg text-muted-foreground mb-4">
          by <span className="text-foreground font-medium">{book.author}</span>
        </p>

        {/* Rating */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={cn(
                  'size-5',
                  star <= Math.round(book.rating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'fill-muted text-muted'
                )}
              />
            ))}
          </div>
          <span className="font-semibold">{book.rating.toFixed(1)}</span>
          <span className="text-muted-foreground">
            ({book.totalReviews}{' '}
            {book.totalReviews === 1 ? 'review' : 'reviews'})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-3 mb-6">
          {hasDiscount ? (
            <>
              <span className="text-4xl font-bold text-violet-600 dark:text-violet-400">
                ${book.discountPrice!.toFixed(2)}
              </span>
              <span className="text-xl text-muted-foreground line-through">
                ${book.price.toFixed(2)}
              </span>
              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0">
                Save ${(book.price - book.discountPrice!).toFixed(2)}
              </Badge>
            </>
          ) : (
            <span className="text-4xl font-bold text-violet-600 dark:text-violet-400">
              ${book.price.toFixed(2)}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 mb-8">
          <AddToCartButton book={bookData} />
          <AddToWishlistButton book={bookData} />
        </div>

        {/* Description */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Description</h2>
          <p className="text-muted-foreground leading-relaxed">
            {book.description}
          </p>
        </div>

        {/* Book Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {book.pages && (
            <div className="p-3 rounded-lg border bg-muted/30 text-center">
              <p className="text-xs text-muted-foreground mb-1">Pages</p>
              <p className="font-semibold">{book.pages}</p>
            </div>
          )}
          <div className="p-3 rounded-lg border bg-muted/30 text-center">
            <p className="text-xs text-muted-foreground mb-1">Language</p>
            <p className="font-semibold">{book.language}</p>
          </div>
          <div className="p-3 rounded-lg border bg-muted/30 text-center">
            <p className="text-xs text-muted-foreground mb-1">Format</p>
            <p className="font-semibold">{book.format}</p>
          </div>
          <div className="p-3 rounded-lg border bg-muted/30 text-center">
            <p className="text-xs text-muted-foreground mb-1">Category</p>
            <p className="font-semibold">{book.category.name}</p>
          </div>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-3">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-xs hover:bg-accent transition-colors"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Reviews Section */}
        <div className="border-t pt-8">
          <h2 className="text-lg font-semibold mb-6">
            Reviews ({book.totalReviews})
          </h2>

          {/* Review Form */}
          {session?.user ? (
            <div className="mb-8 p-5 rounded-xl border bg-muted/20">
              <h3 className="font-medium mb-4">Write a Review</h3>
              <ReviewForm bookId={book.id} />
            </div>
          ) : (
            <div className="mb-8 p-5 rounded-xl border bg-muted/20 text-center">
              <p className="text-muted-foreground text-sm">
                Please{' '}
                <a
                  href="/auth/signin"
                  className="text-violet-600 hover:text-violet-700 dark:text-violet-400 font-medium underline underline-offset-2"
                >
                  sign in
                </a>{' '}
                to write a review.
              </p>
            </div>
          )}

          {/* Reviews List */}
          <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
            <AnimatePresence>
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <ReviewItem key={review.id} review={review} />
                ))
              ) : (
                <div className="text-center py-8">
                  <Star className="size-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    No reviews yet. Be the first to review this book!
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
