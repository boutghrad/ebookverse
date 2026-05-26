import { db } from '@/lib/db';

export type NotificationType = 'info' | 'success' | 'warning' | 'order' | 'promo' | 'system';

interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
  link?: string;
}

/**
 * Create a notification for a user
 */
export async function createNotification({
  userId,
  title,
  message,
  type = 'info',
  link,
}: CreateNotificationParams) {
  try {
    const notification = await db.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        link: link || null,
      },
    });
    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error);
    return null;
  }
}

/**
 * Send welcome notification to a new user
 */
export async function sendWelcomeNotification(userId: string, userName?: string) {
  return createNotification({
    userId,
    title: 'Welcome to EbookVerse! 🎉',
    message: `Hi ${userName || 'there'}! Welcome to EbookVerse. Start exploring our collection of amazing eBooks. Don't forget to check out our free books section!`,
    type: 'success',
    link: '/books',
  });
}

/**
 * Send order confirmation notification
 */
export async function sendOrderConfirmationNotification(
  userId: string,
  orderId: string,
  total: number,
  bookCount: number
) {
  return createNotification({
    userId,
    title: 'Order Confirmed! ✅',
    message: `Your order of ${bookCount} book${bookCount > 1 ? 's' : ''} ($${total.toFixed(2)}) has been confirmed. You can now download your eBooks from your orders page.`,
    type: 'order',
    link: '/profile?tab=orders',
  });
}

/**
 * Send free book download notification
 */
export async function sendFreeBookNotification(
  userId: string,
  bookTitle: string,
  bookSlug: string
) {
  return createNotification({
    userId,
    title: 'Free Book Downloaded! 📚',
    message: `"${bookTitle}" has been added to your library. Enjoy reading!`,
    type: 'success',
    link: `/books/${bookSlug}`,
  });
}

/**
 * Send promo/discount notification
 */
export async function sendPromoNotification(
  userId: string,
  title: string,
  message: string,
  link?: string
) {
  return createNotification({
    userId,
    title,
    message,
    type: 'promo',
    link,
  });
}

/**
 * Send review reply notification
 */
export async function sendReviewNotification(
  userId: string,
  bookTitle: string,
  bookSlug: string
) {
  return createNotification({
    userId,
    title: 'Review Published! ⭐',
    message: `Your review for "${bookTitle}" has been published. Thanks for sharing your thoughts!`,
    type: 'success',
    link: `/books/${bookSlug}`,
  });
}

/**
 * Send system notification to all users (admin use)
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
    });
    results.push(result);
  }
  return results;
}
