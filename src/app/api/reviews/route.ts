import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// POST /api/reviews - Create a review (auth required)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as Record<string, unknown>).id as string;
    const body = await request.json();
    const { bookId, rating, comment } = body;

    // Validate required fields
    if (!bookId || !rating || !comment) {
      return NextResponse.json(
        { error: "Missing required fields: bookId, rating, comment" },
        { status: 400 }
      );
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Check if book exists
    const book = await db.book.findUnique({ where: { id: bookId } });
    if (!book) {
      return NextResponse.json(
        { error: "Book not found" },
        { status: 404 }
      );
    }

    // Check if user already reviewed this book
    const existingReview = await db.review.findUnique({
      where: { userId_bookId: { userId, bookId } },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "You have already reviewed this book" },
        { status: 409 }
      );
    }

    // Create review
    const review = await db.review.create({
      data: {
        userId,
        bookId,
        rating: parseInt(String(rating), 10),
        comment,
      },
      include: {
        user: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    // Update book rating and totalReviews
    const bookReviews = await db.review.findMany({
      where: { bookId },
      select: { rating: true },
    });

    const totalReviews = bookReviews.length;
    const avgRating = bookReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;

    await db.book.update({
      where: { id: bookId },
      data: {
        rating: Math.round(avgRating * 10) / 10,
        totalReviews,
      },
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}
