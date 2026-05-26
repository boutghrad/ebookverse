import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import fs from 'fs';
import path from 'path';

// GET /api/download/[bookId] - Download a book PDF
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  try {
    const { bookId } = await params;

    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Please sign in to download books' },
        { status: 401 }
      );
    }

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

    // For free books, allow download directly
    if (!isFree) {
      // For paid books, check if user has purchased it
      const order = await db.order.findFirst({
        where: {
          userId: session.user.id,
          status: { in: ['COMPLETED', 'DELIVERED'] },
          items: {
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

    // Read the PDF file
    const pdfPath = path.join(process.cwd(), 'public', book.pdfUrl);

    if (!fs.existsSync(pdfPath)) {
      return NextResponse.json(
        { error: 'PDF file not found on server' },
        { status: 404 }
      );
    }

    const fileBuffer = fs.readFileSync(pdfPath);
    const filename = `${book.slug || book.title.replace(/\s+/g, '-').toLowerCase()}.pdf`;

    // Return the PDF file with download headers
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Error downloading book:', error);
    return NextResponse.json(
      { error: 'Failed to download book' },
      { status: 500 }
    );
  }
}
