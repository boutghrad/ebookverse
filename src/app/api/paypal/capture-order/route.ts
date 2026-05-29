import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { sendOrderConfirmationNotification, sendFreeBookNotification } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

// POST /api/paypal/capture-order - Capture a PayPal payment and create the order
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as Record<string, unknown>).id as string;
    const body = await request.json();
    const { paypalOrderID, items } = body as {
      paypalOrderID: string;
      items: { bookId: string; quantity: number }[];
    };

    if (!paypalOrderID) {
      return NextResponse.json({ error: 'PayPal order ID is required' }, { status: 400 });
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Order must contain at least one item' }, { status: 400 });
    }

    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json({ error: 'PayPal not configured' }, { status: 500 });
    }

    // Get PayPal access token
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const tokenResponse = await fetch(
      `${process.env.PAYPAL_API_BASE || 'https://api-m.sandbox.paypal.com'}/v1/oauth2/token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${auth}`,
        },
        body: 'grant_type=client_credentials',
      }
    );

    if (!tokenResponse.ok) {
      return NextResponse.json({ error: 'Failed to authenticate with PayPal' }, { status: 500 });
    }

    const { access_token } = await tokenResponse.json();

    // Capture the PayPal order
    const captureResponse = await fetch(
      `${process.env.PAYPAL_API_BASE || 'https://api-m.sandbox.paypal.com'}/v2/checkout/orders/${paypalOrderID}/capture`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    if (!captureResponse.ok) {
      const errText = await captureResponse.text();
      console.error('PayPal capture error:', errText);
      return NextResponse.json({ error: 'PayPal payment capture failed' }, { status: 500 });
    }

    const captureData = await captureResponse.json();

    // Check if capture was successful
    const captureStatus = captureData?.purchase_units?.[0]?.payments?.captures?.[0]?.status;
    if (captureStatus !== 'COMPLETED') {
      return NextResponse.json({
        error: 'PayPal payment was not completed',
        status: captureStatus,
      }, { status: 400 });
    }

    // Fetch all books in the order
    const bookIds = items.map((item) => item.bookId);
    const books = await db.book.findMany({
      where: { id: { in: bookIds } },
    });

    if (books.length !== bookIds.length) {
      return NextResponse.json({ error: 'One or more books not found' }, { status: 404 });
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
      return { bookId: item.bookId, quantity, price };
    });

    // Create order in database with PayPal info
    const order = await db.order.create({
      data: {
        userId,
        total,
        paymentStatus: 'COMPLETED',
        paymentMethod: 'paypal',
        paypalOrderId: paypalOrderID,
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

    return NextResponse.json({ order, paypalCapture: captureData }, { status: 201 });
  } catch (error) {
    console.error('PayPal capture order error:', error);
    return NextResponse.json(
      { error: 'Failed to process PayPal order' },
      { status: 500 }
    );
  }
}
