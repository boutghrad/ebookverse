'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  SlidersHorizontal,
  BookOpen,
  TrendingUp,
  Star,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import BookCard, { BookProps } from '@/components/shared/BookCard';
import { cn } from '@/lib/utils';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  bookCount: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Popular' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
];

function BookGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="rounded-xl border bg-card overflow-hidden">
          <Skeleton className="aspect-[3/4] w-full" />
          <div className="p-4 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-5 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

function BooksContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [books, setBooks] = useState<BookProps[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(
    searchParams.get('search') || ''
  );
  const [showFilters, setShowFilters] = useState(false);

  const currentCategory = searchParams.get('category') || '';
  const currentSort = searchParams.get('sort') || 'newest';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const currentSearch = searchParams.get('search') || '';
  const currentFeatured = searchParams.get('featured') || '';
  const currentTrending = searchParams.get('trending') || '';

  // Fetch categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const data = await res.json();
          setCategories(data.categories);
        }
      } catch {
        // Silently handle
      }
    }
    fetchCategories();
  }, []);

  // Fetch books
  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (currentCategory) params.set('category', currentCategory);
      if (currentSearch) params.set('search', currentSearch);
      if (currentSort) params.set('sort', currentSort);
      if (currentPage) params.set('page', String(currentPage));
      if (currentFeatured) params.set('featured', currentFeatured);
      if (currentTrending) params.set('trending', currentTrending);
      params.set('limit', '12');

      const res = await fetch(`/api/books?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setBooks(data.books);
        setPagination(data.pagination);
      }
    } catch {
      // Silently handle
    } finally {
      setLoading(false);
    }
  }, [currentCategory, currentSearch, currentSort, currentPage, currentFeatured, currentTrending]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  // Update URL search params
  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });
      // Reset to page 1 when filters change (unless we're changing the page)
      if (!('page' in updates)) {
        params.set('page', '1');
      }
      router.push(`/books?${params.toString()}`, { scroll: false });
    },
    [searchParams, router]
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ search: searchInput });
  };

  const handleCategoryFilter = (slug: string) => {
    updateParams({
      category: currentCategory === slug ? '' : slug,
    });
  };

  const handleSortChange = (value: string) => {
    updateParams({ sort: value });
  };

  const handlePageChange = (page: number) => {
    updateParams({ page: String(page) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleFeatured = () => {
    updateParams({
      featured: currentFeatured === 'true' ? '' : 'true',
    });
  };

  const toggleTrending = () => {
    updateParams({
      trending: currentTrending === 'true' ? '' : 'true',
    });
  };

  const clearFilters = () => {
    setSearchInput('');
    router.push('/books');
  };

  const hasActiveFilters =
    currentCategory || currentSearch || currentFeatured || currentTrending;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h1 className="text-4xl sm:text-5xl font-bold mb-3">
              Explore Our{' '}
              <span className="relative">
                <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                  Library
                </span>
                <span className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full" />
              </span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Discover thousands of eBooks across every genre. Find your next
              favorite read today.
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="max-w-2xl mx-auto mb-8"
          >
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by title, author, or description..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-12 pr-24 h-12 text-base rounded-xl border-2 focus:border-violet-500 transition-colors"
              />
              <Button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9 px-4 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white rounded-lg"
              >
                Search
              </Button>
            </form>
          </motion.div>

          {/* Category Filter Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="mb-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <SlidersHorizontal className="size-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                Filter by Category
              </span>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="ml-auto text-xs text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3 mr-1" />
                  Clear all
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleCategoryFilter('')}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
                  !currentCategory
                    ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-md'
                    : 'bg-secondary text-secondary-foreground hover:bg-accent'
                )}
              >
                All Books
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryFilter(cat.slug)}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
                    currentCategory === cat.slug
                      ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-md'
                      : 'bg-secondary text-secondary-foreground hover:bg-accent'
                  )}
                >
                  {cat.name}
                  <span className="ml-1.5 text-xs opacity-70">
                    ({cat.bookCount})
                  </span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Sort & Filter Bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
          >
            <div className="flex items-center gap-2 flex-wrap">
              {/* Featured Toggle */}
              <Button
                variant={currentFeatured === 'true' ? 'default' : 'outline'}
                size="sm"
                onClick={toggleFeatured}
                className={cn(
                  'gap-1.5',
                  currentFeatured === 'true' &&
                    'bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0'
                )}
              >
                <Star className="size-3.5" />
                Featured
              </Button>

              {/* Trending Toggle */}
              <Button
                variant={currentTrending === 'true' ? 'default' : 'outline'}
                size="sm"
                onClick={toggleTrending}
                className={cn(
                  'gap-1.5',
                  currentTrending === 'true' &&
                    'bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0'
                )}
              >
                <TrendingUp className="size-3.5" />
                Trending
              </Button>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Results Count */}
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                {pagination.total} {pagination.total === 1 ? 'book' : 'books'}
              </span>

              {/* Sort Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <SlidersHorizontal className="size-3.5" />
                    <span className="hidden sm:inline">
                      {sortOptions.find((o) => o.value === currentSort)
                        ?.label || 'Sort'}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {sortOptions.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => handleSortChange(option.value)}
                      className={cn(
                        currentSort === option.value && 'text-violet-600'
                      )}
                    >
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </motion.div>

          {/* Active Filters Display */}
          <AnimatePresence>
            {hasActiveFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-wrap gap-2 mb-6"
              >
                {currentSearch && (
                  <Badge
                    variant="secondary"
                    className="gap-1 px-3 py-1"
                  >
                    Search: &quot;{currentSearch}&quot;
                    <button
                      onClick={() => {
                        setSearchInput('');
                        updateParams({ search: '' });
                      }}
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                )}
                {currentCategory && (
                  <Badge
                    variant="secondary"
                    className="gap-1 px-3 py-1"
                  >
                    Category:{' '}
                    {categories.find((c) => c.slug === currentCategory)?.name ||
                      currentCategory}
                    <button
                      onClick={() => updateParams({ category: '' })}
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                )}
                {currentFeatured === 'true' && (
                  <Badge
                    variant="secondary"
                    className="gap-1 px-3 py-1"
                  >
                    Featured
                    <button onClick={toggleFeatured}>
                      <X className="size-3" />
                    </button>
                  </Badge>
                )}
                {currentTrending === 'true' && (
                  <Badge
                    variant="secondary"
                    className="gap-1 px-3 py-1"
                  >
                    Trending
                    <button onClick={toggleTrending}>
                      <X className="size-3" />
                    </button>
                  </Badge>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Books Grid */}
          {loading ? (
            <BookGridSkeleton />
          ) : books.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <BookOpen className="size-16 text-muted-foreground/40 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No books found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search or filters to find what you&apos;re looking for.
              </p>
              <Button
                onClick={clearFilters}
                variant="outline"
                className="gap-2"
              >
                <X className="size-4" />
                Clear all filters
              </Button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {books.map((book, index) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <BookCard book={book} />
                </motion.div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && pagination.totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-center gap-2 mt-12"
            >
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="h-10 w-10"
              >
                <ChevronLeft className="size-4" />
              </Button>

              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  // Show first page, last page, current page, and neighbors
                  if (page === 1 || page === pagination.totalPages) return true;
                  if (Math.abs(page - currentPage) <= 1) return true;
                  return false;
                })
                .reduce<(number | 'ellipsis')[]>((acc, page, idx, arr) => {
                  if (idx > 0) {
                    const prev = arr[idx - 1];
                    if (page - prev > 1) {
                      acc.push('ellipsis');
                    }
                  }
                  acc.push(page);
                  return acc;
                }, [])
                .map((item, idx) =>
                  item === 'ellipsis' ? (
                    <span
                      key={`ellipsis-${idx}`}
                      className="px-2 text-muted-foreground"
                    >
                      ...
                    </span>
                  ) : (
                    <Button
                      key={item}
                      variant={currentPage === item ? 'default' : 'outline'}
                      size="icon"
                      onClick={() => handlePageChange(item)}
                      className={cn(
                        'h-10 w-10',
                        currentPage === item &&
                          'bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0'
                      )}
                    >
                      {item}
                    </Button>
                  )
                )}

              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= pagination.totalPages}
                className="h-10 w-10"
              >
                <ChevronRight className="size-4" />
              </Button>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function BooksPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col">
          <div className="flex-1 pt-24 pb-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-10">
                <Skeleton className="h-12 w-80 mx-auto mb-3" />
                <Skeleton className="h-6 w-96 mx-auto" />
              </div>
              <BookGridSkeleton />
            </div>
          </div>
        </div>
      }
    >
      <BooksContent />
    </Suspense>
  );
}
