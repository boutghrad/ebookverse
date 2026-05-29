import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET /api/download/[bookId] - Download a book PDF
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  try {
    const { bookId } = await params;

    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Please sign in to download books' },
        { status: 401 }
      );
    }

    const userId = (session.user as Record<string, unknown>).id as string;

    // Find the book
    const book = await db.book.findUnique({
      where: { id: bookId },
      select: {
        id: true,
        title: true,
        slug: true,
        pdfUrl: true,
        price: true,
        discountPrice: true,
      },
    });

    if (!book) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      );
    }

    if (!book.pdfUrl) {
      return NextResponse.json(
        { error: 'This book does not have a PDF available' },
        { status: 404 }
      );
    }

    const isFree = book.price === 0 || book.discountPrice === 0;

    // For paid books, check if user has a completed order
    if (!isFree) {
      const order = await db.order.findFirst({
        where: {
          userId,
          paymentStatus: { in: ['COMPLETED', 'DELIVERED'] },
          orderItems: {
            some: {
              bookId: book.id,
            },
          },
        },
      });

      if (!order) {
        return NextResponse.json(
          { error: 'You need to purchase this book before downloading it' },
          { status: 403 }
        );
      }
    }

    // Redirect to the PDF URL (stored in public or external)
    return NextResponse.redirect(new URL(book.pdfUrl, request.url));
  } catch (error) {
    console.error('Error downloading book:', error);
    return NextResponse.json(
      { error: 'Failed to download book' },
      { status: 500 }
    );
  }
}
