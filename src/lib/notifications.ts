import { db } from '@/lib/db';
import {
  sendWelcomeEmail,
  sendOrderConfirmationEmail,
  sendFreeBookEmail,
  sendReviewEmail,
  sendPromoEmail,
  sendNotificationEmail,
} from '@/lib/email';

export type NotificationType = 'info' | 'success' | 'warning' | 'order' | 'promo' | 'system';

interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
  link?: string;
  sendEmail?: boolean;
}

/**
 * Check if user has email notifications enabled
 */
async function shouldSendEmail(userId: string): Promise<{ enabled: boolean; email: string; name: string }> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true, emailNotifications: true },
  });
  return {
    enabled: user?.emailNotifications ?? false,
    email: user?.email ?? '',
    name: user?.name ?? 'Reader',
  };
}

/**
 * Create a notification for a user (in-app + optional email)
 */
export async function createNotification({
  userId,
  title,
  message,
  type = 'info',
  link,
  sendEmail: forceEmail = false,
}: CreateNotificationParams) {
  try {
    // Create in-app notification
    const notification = await db.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        link: link || null,
      },
    });

    // Send email if enabled or forced
    const { enabled, email, name } = await shouldSendEmail(userId);
    if (email && (enabled || forceEmail)) {
      // Don't await email to avoid blocking the response
      sendNotificationEmail(email, name, title, message, link || undefined, userId).catch((err) =>
        console.error('Background email send failed:', err)
      );
    }

    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error);
    return null;
  }
}

/**
 * Send welcome notification + email to a new user
 */
export async function sendWelcomeNotification(userId: string, userName?: string) {
  // Always send welcome email for new users
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  });

  if (user?.email) {
    sendWelcomeEmail(user.email, user.name || 'Reader', userId).catch((err) =>
      console.error('Welcome email failed:', err)
    );
  }

  return createNotification({
    userId,
    title: 'Welcome to EbookVerse!',
    message: `Hi ${userName || 'there'}! Welcome to EbookVerse. Start exploring our collection of amazing eBooks. Don't forget to check out our free books section!`,
    type: 'success',
    link: '/books',
  });
}

/**
 * Send order confirmation notification + email
 */
export async function sendOrderConfirmationNotification(
  userId: string,
  orderId: string,
  total: number,
  bookCount: number
) {
  // Fetch order details for email
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      orderItems: {
        include: {
          book: { select: { title: true, price: true, discountPrice: true } },
        },
      },
      user: { select: { email: true, name: true, emailNotifications: true } },
    },
  });

  if (order?.user?.email && order.user.emailNotifications) {
    const books = order.orderItems.map((item) => ({
      title: item.book.title,
      price: item.price,
      isFree: item.price === 0,
    }));

    sendOrderConfirmationEmail(
      order.user.email,
      order.user.name || 'Reader',
      orderId,
      total,
      books,
      userId
    ).catch((err) => console.error('Order email failed:', err));
  }

  return createNotification({
    userId,
    title: 'Order Confirmed!',
    message: `Your order of ${bookCount} book${bookCount > 1 ? 's' : ''} ($${total.toFixed(2)}) has been confirmed. You can now download your eBooks from your orders page.`,
    type: 'order',
    link: '/profile?tab=orders',
  });
}

/**
 * Send free book download notification + email
 */
export async function sendFreeBookNotification(
  userId: string,
  bookTitle: string,
  bookSlug: string
) {
  const { enabled, email, name } = await shouldSendEmail(userId);
  if (enabled && email) {
    sendFreeBookEmail(email, name, bookTitle, bookSlug, userId).catch((err) =>
      console.error('Free book email failed:', err)
    );
  }

  return createNotification({
    userId,
    title: 'Free Book Downloaded!',
    message: `"${bookTitle}" has been added to your library. Enjoy reading!`,
    type: 'success',
    link: `/books/${bookSlug}`,
  });
}

/**
 * Send promo/discount notification + email
 */
export async function sendPromoNotification(
  userId: string,
  title: string,
  message: string,
  link?: string
) {
  const { enabled, email, name } = await shouldSendEmail(userId);
  if (enabled && email) {
    sendPromoEmail(email, name, title, message, link, userId).catch((err) =>
      console.error('Promo email failed:', err)
    );
  }

  return createNotification({
    userId,
    title,
    message,
    type: 'promo',
    link,
  });
}

/**
 * Send review notification + email
 */
export async function sendReviewNotification(
  userId: string,
  bookTitle: string,
  bookSlug: string,
  rating?: number
) {
  const { enabled, email, name } = await shouldSendEmail(userId);
  if (enabled && email) {
    sendReviewEmail(email, name, bookTitle, bookSlug, rating || 5, userId).catch((err) =>
      console.error('Review email failed:', err)
    );
  }

  return createNotification({
    userId,
    title: 'Review Published!',
    message: `Your review for "${bookTitle}" has been published. Thanks for sharing your thoughts!`,
    type: 'success',
    link: `/books/${bookSlug}`,
  });
}

/**
 * Send system notification to all users (admin use) + email
 */
export async function sendSystemNotification(
  userIds: string[],
  title: string,
  message: string,
  link?: string
) {
  const results = [];
  for (const userId of userIds) {
    const result = await createNotification({
      userId,
      title,
      message,
      type: 'system',
      link,
      sendEmail: true, // Always email for system notifications from admin
    });
    results.push(result);
  }
  return results;
}
