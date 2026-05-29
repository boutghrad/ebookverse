import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendOrderConfirmationNotification, sendFreeBookNotification } from "@/lib/notifications";

// GET /api/orders - Get user's orders
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as Record<string, unknown>).id as string;

    const orders = await db.order.findMany({
      where: { userId },
      include: {
        orderItems: {
          include: {
            book: {
              select: {
                id: true,
                title: true,
                slug: true,
                coverImage: true,
                author: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// POST /api/orders - Create a new order
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as Record<string, unknown>).id as string;
    const body = await request.json();
    const { items, paymentMethod, paypalOrderId } = body as {
      items: { bookId: string; quantity: number }[];
      paymentMethod?: string;
      paypalOrderId?: string;
    };

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Order must contain at least one item" },
        { status: 400 }
      );
    }

    // Fetch all books in the order
    const bookIds = items.map((item) => item.bookId);
    const books = await db.book.findMany({
      where: { id: { in: bookIds } },
    });

    if (books.length !== bookIds.length) {
      return NextResponse.json(
        { error: "One or more books not found" },
        { status: 404 }
      );
    }

    // Calculate total and build order items
    const bookMap = new Map(books.map((b) => [b.id, b]));
    let total = 0;
    const orderItemsData = items.map((item) => {
      const book = bookMap.get(item.bookId);
      if (!book) throw new Error(`Book ${item.bookId} not found`);
      const price = book.discountPrice ?? book.price;
      const quantity = item.quantity || 1;
      total += price * quantity;
      return {
        bookId: item.bookId,
        quantity,
        price,
      };
    });

    // Create order with order items
    const order = await db.order.create({
      data: {
        userId,
        total,
        paymentStatus: total === 0 ? "COMPLETED" : "PENDING",
        paymentMethod: paymentMethod || 'card',
        paypalOrderId: paypalOrderId || null,
        orderItems: {
          create: orderItemsData,
        },
      },
      include: {
        orderItems: {
          include: {
            book: {
              select: {
                id: true,
                title: true,
                slug: true,
                coverImage: true,
                author: true,
              },
            },
          },
        },
      },
    });

    // Update book totalSales
    for (const item of items) {
      await db.book.update({
        where: { id: item.bookId },
        data: { totalSales: { increment: item.quantity || 1 } },
      });
    }

    // Clear the user's cart after successful order
    await db.cartItem.deleteMany({ where: { userId } });

    // Send order confirmation notification
    await sendOrderConfirmationNotification(
      userId,
      order.id,
      total,
      orderItemsData.length
    );

    // Send free book download notification for free books
    for (const item of orderItemsData) {
      const book = bookMap.get(item.bookId);
      if (book && book.price === 0 && (book.discountPrice ?? 0) === 0) {
        await sendFreeBookNotification(userId, book.title, book.slug);
      }
    }

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
