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
  Download,
  Gift,
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

// Download PDF Button
function DownloadButton({ bookId, title, isFree }: { bookId: string; title: string; isFree: boolean }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch(`/api/download/${bookId}`);
      if (!res.ok) {
        const data = await res.json();
        if (res.status === 401) {
          toast.error('Please sign in', {
            description: 'You need to be signed in to download books.',
          });
          setTimeout(() => {
            window.location.href = '/auth/signin';
          }, 1500);
        } else if (res.status === 403) {
          toast.error('Purchase required', {
            description: 'You need to purchase this book before downloading it.',
          });
        } else {
          toast.error(data.error || 'Download failed');
        }
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/\s+/g, '-').toLowerCase()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Download started!', {
        description: `${title} is being downloaded.`,
      });
    } catch {
      toast.error('Download failed', {
        description: 'Something went wrong. Please try again.',
      });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Button
      onClick={handleDownload}
      disabled={downloading}
      size="lg"
      className={cn(
        'flex-1 gap-2 text-base font-semibold h-12 transition-all duration-300',
        isFree
          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl'
          : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl'
      )}
    >
      {downloading ? (
        <>
          <Loader2 className="size-5 animate-spin" />
          Downloading...
        </>
      ) : (
        <>
          <Download className="size-5" />
          {isFree ? 'Download Free PDF' : 'Download PDF'}
        </>
      )}
    </Button>
  );
}

// Add to Cart Button
function AddToCartButton({ book }: { book: BookData }) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

  const isFree = book.price === 0 || book.discountPrice === 0;

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
    if (isFree) {
      toast.success('Free book added!', {
        description: `${book.title} has been added to your cart. Proceed to checkout to get it for free!`,
      });
    } else {
      toast.success('Added to cart!', {
        description: `${book.title} has been added to your cart.`,
      });
    }
    setTimeout(() => setAdded(false), 2000);
  };

  if (isFree) {
    return (
      <Button
        onClick={handleAdd}
        size="lg"
        className={cn(
          'flex-1 gap-2 text-base font-semibold h-12 transition-all duration-300',
          added
            ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
            : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl'
        )}
      >
        {added ? (
          <>
            <Check className="size-5" />
            Added!
          </>
        ) : (
          <>
            <Gift className="size-5" />
            Get Free Book
          </>
        )}
      </Button>
    );
  }

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
    pdfUrl: string | null;
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

  const isFree = book.price === 0 || book.discountPrice === 0;
  const hasPdf = !!book.pdfUrl;
  const hasDiscount = !isFree && book.discountPrice && book.discountPrice < book.price;
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
            <div className={cn(
              'absolute inset-0 flex items-center justify-center',
              isFree
                ? 'bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500'
                : 'bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500'
            )}>
              <BookOpen className="size-24 text-white/50" />
            </div>
            {isFree ? (
              <Badge className="absolute top-4 left-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 px-4 py-1.5 text-base font-bold shadow-lg">
                <Gift className="size-4 mr-1" />
                FREE
              </Badge>
            ) : hasDiscount ? (
              <Badge className="absolute top-4 left-4 bg-gradient-to-r from-rose-500 to-pink-600 text-white border-0 px-3 py-1 text-sm font-semibold">
                -{discountPercent}%
              </Badge>
            ) : null}
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
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="secondary">
            {book.category.name}
          </Badge>
          {isFree && (
            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0">
              <Gift className="size-3 mr-1" />
              Free Download
            </Badge>
          )}
        </div>

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
          {isFree ? (
            <div className="flex items-center gap-2">
              <span className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">
                FREE
              </span>
              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0">
                <Download className="size-3 mr-1" />
                Instant Download
              </Badge>
            </div>
          ) : hasDiscount ? (
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

        {/* Free Book Notice */}
        {isFree && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20"
          >
            <div className="flex items-start gap-3">
              <Gift className="size-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-emerald-700 dark:text-emerald-300">
                  This book is available for free!
                </p>
                <p className="text-sm text-emerald-600/80 dark:text-emerald-400/80 mt-1">
                  Add it to your cart and proceed to checkout. No payment required - just sign in and download instantly.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 mb-8">
          <div className="flex items-center gap-3">
            <AddToCartButton book={bookData} />
            <AddToWishlistButton book={bookData} />
          </div>
          {/* Direct Download Button */}
          {hasPdf && (
            <DownloadButton bookId={book.id} title={book.title} isFree={isFree} />
          )}
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
                  className={cn(
                    'text-xs hover:bg-accent transition-colors',
                    tag.toLowerCase() === 'free' && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                  )}
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
