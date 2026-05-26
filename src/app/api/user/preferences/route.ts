import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// PUT /api/user/preferences - Update user preferences (email notifications)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { emailNotifications } = body;

    if (typeof emailNotifications !== 'boolean') {
      return NextResponse.json(
        { error: 'emailNotifications must be a boolean' },
        { status: 400 }
      );
    }

    const user = await db.user.update({
      where: { email: session.user.email },
      data: { emailNotifications },
      select: {
        id: true,
        email: true,
        emailNotifications: true,
      },
    });

    return NextResponse.json({
      success: true,
      emailNotifications: user.emailNotifications,
    });
  } catch (error) {
    console.error('Error updating preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}

// GET /api/user/preferences - Get user preferences
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: {
        emailNotifications: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}
