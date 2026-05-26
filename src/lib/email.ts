import { Resend } from 'resend';
import { db } from '@/lib/db';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = 'EbookVerse <onboarding@resend.dev>';
const APP_URL = process.env.NEXTAUTH_URL || 'https://ebookverse-ochre.vercel.app';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  userId?: string;
  emailType?: string;
}

/**
 * Send an email using Resend and log it to the Neon database
 */
export async function sendEmail({ to, subject, html, userId, emailType = 'notification' }: SendEmailParams) {
  // Create a pending log entry in the database
  const emailLog = await db.emailLog.create({
    data: {
      userId: userId || null,
      to,
      subject,
      type: emailType,
      status: 'pending',
    },
  });

  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not set, skipping email send');
      await db.emailLog.update({
        where: { id: emailLog.id },
        data: { status: 'skipped', error: 'RESEND_API_KEY not configured' },
      });
      return { success: false, error: 'RESEND_API_KEY not configured' };
    }

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });

    if (error) {
      console.error('Email send error:', error);
      await db.emailLog.update({
        where: { id: emailLog.id },
        data: { status: 'failed', error: error.message },
      });
      return { success: false, error: error.message };
    }

    // Update log with success
    await db.emailLog.update({
      where: { id: emailLog.id },
      data: {
        status: 'sent',
        resendId: data?.id || null,
      },
    });

    return { success: true, id: data?.id };
  } catch (error) {
    console.error('Email send exception:', error);
    await db.emailLog.update({
      where: { id: emailLog.id },
      data: { status: 'failed', error: 'Failed to send email' },
    }).catch(() => {}); // Don't fail if log update fails
    return { success: false, error: 'Failed to send email' };
  }
}

/**
 * Base email template with EbookVerse branding
 */
function baseTemplate(content: string, title: string) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5; color: #18181b; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; margin-top: 20px; margin-bottom: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #7c3aed, #9333ea); padding: 30px 40px; text-align: center; }
    .header h1 { color: #ffffff; font-size: 24px; font-weight: 700; }
    .header p { color: #e9d5ff; font-size: 14px; margin-top: 4px; }
    .body { padding: 30px 40px; }
    .body h2 { color: #18181b; font-size: 20px; margin-bottom: 12px; }
    .body p { color: #52525b; font-size: 15px; margin-bottom: 16px; }
    .body ul { padding-left: 20px; margin-bottom: 16px; }
    .body li { color: #52525b; font-size: 15px; margin-bottom: 6px; }
    .btn { display: inline-block; background: linear-gradient(135deg, #7c3aed, #9333ea); color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-size: 15px; font-weight: 600; margin: 16px 0; }
    .footer { background-color: #f4f4f5; padding: 20px 40px; text-align: center; border-top: 1px solid #e4e4e7; }
    .footer p { color: #a1a1aa; font-size: 12px; }
    .footer a { color: #7c3aed; text-decoration: none; }
    .divider { border: none; border-top: 1px solid #e4e4e7; margin: 20px 0; }
    .highlight-box { background-color: #f4f4f5; border-radius: 8px; padding: 16px 20px; margin: 16px 0; border-left: 4px solid #7c3aed; }
    .highlight-box p { margin-bottom: 4px; }
    .book-item { display: flex; align-items: center; gap: 12px; padding: 12px; background: #f4f4f5; border-radius: 8px; margin-bottom: 8px; }
    .book-price { color: #7c3aed; font-weight: 700; font-size: 16px; }
    .book-free { color: #16a34a; font-weight: 700; font-size: 14px; background: #dcfce7; padding: 2px 8px; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>EbookVerse</h1>
      <p>Your Digital Library</p>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      <p>&copy; 2026 EbookVerse. All rights reserved.</p>
      <p style="margin-top: 8px;">
        <a href="${APP_URL}">Visit EbookVerse</a> &middot;
        <a href="${APP_URL}/profile">Account Settings</a>
      </p>
      <p style="margin-top: 8px;">You're receiving this because you have an account on EbookVerse.</p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Send welcome email
 */
export async function sendWelcomeEmail(to: string, name: string, userId?: string) {
  const html = baseTemplate(`
    <h2>Welcome to EbookVerse, ${name}!</h2>
    <p>We're thrilled to have you join our community of book lovers. Your digital library awaits!</p>
    
    <div class="highlight-box">
      <p><strong>Here's what you can do:</strong></p>
      <ul>
        <li>Browse our collection of premium eBooks</li>
        <li>Download free books instantly</li>
        <li>Leave reviews and share your thoughts</li>
        <li>Build your wishlist of must-reads</li>
      </ul>
    </div>
    
    <p>Start by checking out our free books section — no purchase required!</p>
    
    <div style="text-align: center;">
      <a href="${APP_URL}/books" class="btn">Explore Books</a>
    </div>
  `, 'Welcome to EbookVerse!');

  return sendEmail({ to, subject: 'Welcome to EbookVerse!', html, userId, emailType: 'welcome' });
}

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmationEmail(
  to: string,
  name: string,
  orderId: string,
  total: number,
  books: { title: string; price: number; isFree: boolean }[],
  userId?: string
) {
  const booksHtml = books.map(b => `
    <div class="book-item">
      <div style="flex:1;">
        <p style="font-weight:600; margin-bottom:2px;">${b.title}</p>
      </div>
      ${b.isFree ? '<span class="book-free">FREE</span>' : `<span class="book-price">$${b.price.toFixed(2)}</span>`}
    </div>
  `).join('');

  const html = baseTemplate(`
    <h2>Order Confirmed!</h2>
    <p>Hi ${name}, your order has been confirmed successfully.</p>
    
    <div class="highlight-box">
      <p><strong>Order ID:</strong> ${orderId.slice(0, 8)}...</p>
      <p><strong>Total:</strong> $${total.toFixed(2)}</p>
    </div>
    
    <h3 style="font-size: 16px; margin-bottom: 12px;">Books in this order:</h3>
    ${booksHtml}
    
    <hr class="divider">
    
    <p>You can download your eBooks anytime from your orders page.</p>
    
    <div style="text-align: center;">
      <a href="${APP_URL}/profile?tab=orders" class="btn">View My Orders</a>
    </div>
  `, 'Order Confirmed - EbookVerse');

  return sendEmail({ to, subject: 'Order Confirmed! - EbookVerse', html, userId, emailType: 'order' });
}

/**
 * Send free book download email
 */
export async function sendFreeBookEmail(
  to: string,
  name: string,
  bookTitle: string,
  bookSlug: string,
  userId?: string
) {
  const html = baseTemplate(`
    <h2>Your Free Book is Ready!</h2>
    <p>Hi ${name}, your free book is now available for download.</p>
    
    <div class="highlight-box">
      <p><strong>Book:</strong> ${bookTitle}</p>
      <p><strong>Price:</strong> <span class="book-free">FREE</span></p>
    </div>
    
    <p>Head over to the book page to start reading, or find it in your orders.</p>
    
    <div style="text-align: center;">
      <a href="${APP_URL}/books/${bookSlug}" class="btn">Read Now</a>
    </div>
  `, 'Free Book Download - EbookVerse');

  return sendEmail({ to, subject: `Your Free Book: ${bookTitle}`, html, userId, emailType: 'free_book' });
}

/**
 * Send review published email
 */
export async function sendReviewEmail(
  to: string,
  name: string,
  bookTitle: string,
  bookSlug: string,
  rating: number,
  userId?: string
) {
  const stars = '\u2B50'.repeat(rating);
  const html = baseTemplate(`
    <h2>Review Published! ${stars}</h2>
    <p>Hi ${name}, your review for <strong>"${bookTitle}"</strong> has been published.</p>
    
    <div class="highlight-box">
      <p><strong>Book:</strong> ${bookTitle}</p>
      <p><strong>Your Rating:</strong> ${stars}</p>
    </div>
    
    <p>Thanks for sharing your thoughts! Your review helps other readers discover great books.</p>
    
    <div style="text-align: center;">
      <a href="${APP_URL}/books/${bookSlug}" class="btn">View Book</a>
    </div>
  `, 'Review Published - EbookVerse');

  return sendEmail({ to, subject: `Review Published! - EbookVerse`, html, userId, emailType: 'review' });
}

/**
 * Send promo/discount email
 */
export async function sendPromoEmail(
  to: string,
  name: string,
  title: string,
  message: string,
  link?: string,
  userId?: string
) {
  const html = baseTemplate(`
    <h2>${title}</h2>
    <p>Hi ${name},</p>
    <p>${message}</p>
    
    ${link ? `<div style="text-align: center;"><a href="${APP_URL}${link}" class="btn">Shop Now</a></div>` : ''}
  `, title);

  return sendEmail({ to, subject: `${title} - EbookVerse`, html, userId, emailType: 'promo' });
}

/**
 * Send a notification email (generic)
 */
export async function sendNotificationEmail(
  to: string,
  name: string,
  notificationTitle: string,
  notificationMessage: string,
  notificationLink?: string,
  userId?: string
) {
  const html = baseTemplate(`
    <h2>${notificationTitle}</h2>
    <p>Hi ${name},</p>
    <p>${notificationMessage}</p>
    
    ${notificationLink ? `<div style="text-align: center;"><a href="${APP_URL}${notificationLink}" class="btn">View Details</a></div>` : ''}
  `, notificationTitle);

  return sendEmail({ to, subject: `${notificationTitle} - EbookVerse`, html, userId, emailType: 'notification' });
}
