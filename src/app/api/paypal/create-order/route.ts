import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// POST /api/paypal/create-order - Create a PayPal order
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { total, items } = body as {
      total: number;
      items: { bookId: string; title: string; quantity: number; price: number }[];
    };

    if (!total || total <= 0) {
      return NextResponse.json({ error: 'Invalid total amount' }, { status: 400 });
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
      const errText = await tokenResponse.text();
      console.error('PayPal token error:', errText);
      return NextResponse.json({ error: 'Failed to authenticate with PayPal' }, { status: 500 });
    }

    const { access_token } = await tokenResponse.json();

    // Create PayPal order
    const orderResponse = await fetch(
      `${process.env.PAYPAL_API_BASE || 'https://api-m.sandbox.paypal.com'}/v2/checkout/orders`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [
            {
              description: `EbookVerse Order - ${items.length} book${items.length > 1 ? 's' : ''}`,
              amount: {
                currency_code: 'USD',
                value: total.toFixed(2),
                breakdown: {
                  item_total: {
                    currency_code: 'USD',
                    value: total.toFixed(2),
                  },
                },
              },
              items: items.map((item) => ({
                name: item.title.substring(0, 127),
                unit_amount: {
                  currency_code: 'USD',
                  value: item.price.toFixed(2),
                },
                quantity: item.quantity.toString(),
                category: 'DIGITAL_GOODS',
              })),
            },
          ],
        }),
      }
    );

    if (!orderResponse.ok) {
      const errText = await orderResponse.text();
      console.error('PayPal create order error:', errText);
      return NextResponse.json({ error: 'Failed to create PayPal order' }, { status: 500 });
    }

    const paypalOrder = await orderResponse.json();

    return NextResponse.json({
      orderID: paypalOrder.id,
      status: paypalOrder.status,
    });
  } catch (error) {
    console.error('PayPal create order error:', error);
    return NextResponse.json(
      { error: 'Failed to create PayPal order' },
      { status: 500 }
    );
  }
}
