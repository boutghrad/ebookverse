import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

// GET /api/books - List books with filtering, sorting, pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const sort = searchParams.get('sort') || 'newest';
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');
    const trending = searchParams.get('trending');
    const free = searchParams.get('free');

    // Build where clause
    const where: Prisma.BookWhereInput = {};

    if (category) {
      where.category = { slug: category };
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { author: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (featured === 'true') {
      where.featured = true;
    }

    if (trending === 'true') {
      where.trending = true;
    }

    if (free === 'true') {
      where.OR = [
        { price: 0 },
        { discountPrice: 0 },
      ];
    }

    // Build order by
    let orderBy: Prisma.BookOrderByWithRelationInput = { createdAt: 'desc' };
    if (sort === 'popular') {
      orderBy = { totalReviews: 'desc' };
    } else if (sort === 'rating') {
      orderBy = { rating: 'desc' };
    } else if (sort === 'price-low') {
      orderBy = { price: 'asc' };
    } else if (sort === 'price-high') {
      orderBy = { price: 'desc' };
    } else if (sort === 'newest') {
      orderBy = { createdAt: 'desc' };
    }

    const skip = (page - 1) * limit;

    const [books, total] = await Promise.all([
      db.book.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
        },
      }),
      db.book.count({ where }),
    ]);

    // Transform books for client consumption
    const transformedBooks = books.map((book) => ({
      id: book.id,
      title: book.title,
      slug: book.slug,
      author: book.author,
      coverImage: book.coverImage,
      price: book.price,
      discountPrice: book.discountPrice,
      rating: book.rating,
      totalReviews: book.totalReviews,
      totalSales: book.totalSales,
      featured: book.featured,
      trending: book.trending,
      pages: book.pages,
      language: book.language,
      format: book.format,
      tags: book.tags,
      category: book.category.name,
      categorySlug: book.category.slug,
    }));

    return NextResponse.json({
      books: transformedBooks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching books:', error);
    return NextResponse.json(
      { error: 'Failed to fetch books' },
      { status: 500 }
    );
  }
}

// POST /api/books - Create a new book (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      slug,
      description,
      author,
      coverImage,
      pdfUrl,
      categoryId,
      tags,
      price,
      discountPrice,
      pages,
      language,
      format,
      featured,
      trending,
    } = body;

    // Validate required fields
    if (!title || !slug || !description || !author || !coverImage || !categoryId || price === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: title, slug, description, author, coverImage, categoryId, price' },
        { status: 400 }
      );
    }

    // Check slug uniqueness
    const existing = await db.book.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: 'A book with this slug already exists' },
        { status: 409 }
      );
    }

    // Verify category exists
    const category = await db.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    const book = await db.book.create({
      data: {
        title,
        slug,
        description,
        author,
        coverImage,
        pdfUrl,
        categoryId,
        tags,
        price: parseFloat(String(price)),
        discountPrice: discountPrice ? parseFloat(String(discountPrice)) : null,
        pages: pages ? parseInt(String(pages), 10) : null,
        language: language || 'English',
        format: format || 'PDF',
        featured: featured || false,
        trending: trending || false,
      },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    return NextResponse.json({ book }, { status: 201 });
  } catch (error) {
    console.error('Error creating book:', error);
    return NextResponse.json(
      { error: 'Failed to create book' },
      { status: 500 }
    );
  }
}
