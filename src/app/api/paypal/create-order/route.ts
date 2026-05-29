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
      console.error('PayPal credentials missing. PAYPAL_CLIENT_ID:', !!clientId, 'PAYPAL_CLIENT_SECRET:', !!clientSecret);
      return NextResponse.json({ error: 'PayPal not configured. Please use card payment.' }, { status: 503 });
    }

    // Determine PayPal API base URL (sandbox vs live)
    const paypalApiBase = process.env.PAYPAL_API_BASE || 'https://api-m.sandbox.paypal.com';

    console.log('PayPal: Getting access token from', paypalApiBase);

    // Get PayPal access token
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const tokenResponse = await fetch(
      `${paypalApiBase}/v1/oauth2/token`,
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
      console.error('PayPal token error:', tokenResponse.status, errText);
      return NextResponse.json({
        error: 'PayPal authentication failed. Please verify PayPal credentials or use card payment.',
      }, { status: 502 });
    }

    const tokenData = await tokenResponse.json();
    const access_token = tokenData.access_token;

    if (!access_token) {
      console.error('PayPal: No access token in response', tokenData);
      return NextResponse.json({ error: 'PayPal authentication failed' }, { status: 502 });
    }

    console.log('PayPal: Access token obtained, creating order for $', total.toFixed(2));

    // Create PayPal order
    const orderPayload = {
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
    };

    const orderResponse = await fetch(
      `${paypalApiBase}/v2/checkout/orders`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
          'PayPal-Request-Id': `ebookverse-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        },
        body: JSON.stringify(orderPayload),
      }
    );

    if (!orderResponse.ok) {
      const errText = await orderResponse.text();
      console.error('PayPal create order error:', orderResponse.status, errText);
      return NextResponse.json({ error: 'Failed to create PayPal order' }, { status: 502 });
    }

    const paypalOrder = await orderResponse.json();
    console.log('PayPal: Order created successfully, ID:', paypalOrder.id, 'Status:', paypalOrder.status);

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
