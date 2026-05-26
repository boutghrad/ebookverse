import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import BookDetailClient from '@/components/shared/BookDetailClient';
import BookCard, { BookProps } from '@/components/shared/BookCard';
import { ChevronRight, Home } from 'lucide-react';

interface BookPageProps {
  params: Promise<{ slug: string }>;
}

// Generate metadata dynamically for SEO
export async function generateMetadata({
  params,
}: BookPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const book = await db.book.findUnique({
      where: { slug },
      include: {
        category: { select: { name: true } },
      },
    });

    if (!book) {
      return {
        title: 'Book Not Found - EbookVerse',
      };
    }

    return {
      title: `${book.title} by ${book.author} - EbookVerse`,
      description: book.description.slice(0, 160),
      keywords: [
        book.title,
        book.author,
        book.category.name,
        'eBook',
        'ebookverse',
        ...book.tags.split(',').map((t) => t.trim()),
      ],
      openGraph: {
        title: `${book.title} by ${book.author}`,
        description: book.description.slice(0, 160),
        type: 'article',
        siteName: 'EbookVerse',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${book.title} by ${book.author}`,
        description: book.description.slice(0, 160),
      },
    };
  } catch {
    return {
      title: 'Book - EbookVerse',
    };
  }
}

export default async function BookDetailPage({ params }: BookPageProps) {
  const { slug } = await params;

  // Fetch book with reviews
  const book = await db.book.findUnique({
    where: { slug },
    include: {
      category: {
        select: { id: true, name: true, slug: true },
      },
      reviews: {
        include: {
          user: {
            select: { id: true, name: true, image: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!book) {
    notFound();
  }

  // Get session for review form
  const session = await getServerSession(authOptions);

  // Fetch related books (same category, different book)
  const relatedBooksRaw = await db.book.findMany({
    where: {
      categoryId: book.categoryId,
      id: { not: book.id },
    },
    take: 4,
    orderBy: { totalSales: 'desc' },
    include: {
      category: {
        select: { name: true },
      },
    },
  });

  const relatedBooks: BookProps[] = relatedBooksRaw.map((b) => ({
    id: b.id,
    title: b.title,
    slug: b.slug,
    author: b.author,
    coverImage: b.coverImage,
    price: b.price,
    discountPrice: b.discountPrice ?? undefined,
    rating: b.rating,
    totalReviews: b.totalReviews,
    category: b.category.name,
  }));

  // Transform reviews for client
  const reviews = book.reviews.map((review) => ({
    id: review.id,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt.toISOString(),
    user: {
      id: review.user.id,
      name: review.user.name,
      image: review.user.image,
    },
  }));

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-8">
            <Link
              href="/"
              className="hover:text-foreground transition-colors flex items-center gap-1"
            >
              <Home className="size-3.5" />
              Home
            </Link>
            <ChevronRight className="size-3.5" />
            <Link
              href="/books"
              className="hover:text-foreground transition-colors"
            >
              Books
            </Link>
            <ChevronRight className="size-3.5" />
            <Link
              href={`/books?category=${book.category.slug}`}
              className="hover:text-foreground transition-colors"
            >
              {book.category.name}
            </Link>
            <ChevronRight className="size-3.5" />
            <span className="text-foreground font-medium truncate max-w-[200px]">
              {book.title}
            </span>
          </nav>

          {/* Book Detail Client Component */}
          <BookDetailClient
            book={{
              id: book.id,
              title: book.title,
              slug: book.slug,
              author: book.author,
              coverImage: book.coverImage,
              price: book.price,
              discountPrice: book.discountPrice,
              rating: book.rating,
              totalReviews: book.totalReviews,
              description: book.description,
              pages: book.pages,
              language: book.language,
              format: book.format,
              tags: book.tags,
              pdfUrl: book.pdfUrl,
              category: {
                id: book.category.id,
                name: book.category.name,
                slug: book.category.slug,
              },
            }}
            reviews={reviews}
            session={session ? { user: session.user } : null}
          />

          {/* Related Books */}
          {relatedBooks.length > 0 && (
            <section className="mt-16 pt-8 border-t">
              <h2 className="text-2xl font-bold mb-6">
                More in{' '}
                <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                  {book.category.name}
                </span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {relatedBooks.map((relBook) => (
                  <BookCard key={relBook.id} book={relBook} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
