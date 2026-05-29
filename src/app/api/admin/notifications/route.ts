import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// POST /api/admin/notifications - Send notification to all users (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if ((session.user as Record<string, unknown>).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { title, message, type, link, userIds } = body;

    if (!title || !message) {
      return NextResponse.json(
        { error: 'title and message are required' },
        { status: 400 }
      );
    }

    // If specific userIds provided, send to those users only
    // Otherwise, send to all users
    const targetUsers = userIds && userIds.length > 0
      ? userIds
      : (await db.user.findMany({ select: { id: true } })).map((u) => u.id);

    const notifications = await Promise.all(
      targetUsers.map((userId: string) =>
        db.notification.create({
          data: {
            userId,
            title,
            message,
            type: type || 'system',
            link: link || null,
          },
        })
      )
    );

    return NextResponse.json({
      success: true,
      sentCount: notifications.length,
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}
