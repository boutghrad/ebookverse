import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Z AI API Configuration
const ZAI_CONFIG = {
  baseUrl: 'https://internal-api.z.ai/v1',
  apiKey: process.env.ZAI_API_KEY || 'Z.ai',
  token: process.env.ZAI_TOKEN || '',
  userId: process.env.ZAI_USER_ID || '',
};

const SYSTEM_PROMPT = `You are EbookBot, the friendly AI assistant for EbookVerse — an online eBook store. Your role is to help users discover books, navigate the website, answer questions about ebooks, and provide recommendations.

About EbookVerse:
- An online eBook store with thousands of premium eBooks across every genre
- Supports PDF, EPUB, and MOBI formats
- Features: AI-powered recommendations, instant downloads, secure PayPal payments, free books available
- Users can browse by category, search, read reviews, and add books to wishlist/cart
- Categories include: Fiction, Non-Fiction, Science, Technology, Business, Self-Help, History, Biography, Romance, Mystery, Fantasy, and more
- Payment methods: PayPal and free books (no credit card needed)
- Users can sign in with email/password or GitHub
- Website sections: Home, Books catalog, Cart, Checkout, Profile, Notifications

Guidelines:
- Be friendly, helpful, and concise
- When recommending books, mention title, author, and price
- If users ask about pricing, mention that some books are free and others have discount prices
- Help users navigate the site (e.g., "Go to /books to browse our catalog", "Check /cart for your items")
- If you don't know something specific, be honest and suggest where to find the info
- Keep responses under 200 words unless the user asks for detailed information
- Use emojis sparingly to keep things friendly
- Always respond in the same language the user is writing in (English, Arabic, French, etc.)`;

async function getBookContext(query: string): Promise<string> {
  const contextParts: string[] = [];

  try {
    const lowerQuery = query.toLowerCase();

    // Get categories if relevant
    if (
      lowerQuery.includes('categor') ||
      lowerQuery.includes('genre') ||
      lowerQuery.includes('type') ||
      lowerQuery.includes('kind') ||
      lowerQuery.includes('section')
    ) {
      const categories = await db.category.findMany({
        include: { _count: { select: { books: true } } },
        take: 10,
      });
      if (categories.length > 0) {
        contextParts.push(
          'Available categories: ' +
            categories.map((c) => `${c.name} (${c._count.books} books)`).join(', ')
        );
      }
    }

    // Get books if relevant
    if (
      lowerQuery.includes('book') ||
      lowerQuery.includes('recommend') ||
      lowerQuery.includes('suggest') ||
      lowerQuery.includes('find') ||
      lowerQuery.includes('search') ||
      lowerQuery.includes('author') ||
      lowerQuery.includes('trending') ||
      lowerQuery.includes('popular') ||
      lowerQuery.includes('best') ||
      lowerQuery.includes('free') ||
      lowerQuery.includes('discount') ||
      lowerQuery.includes('price')
    ) {
      const [trending, featured, freeBooks] = await Promise.all([
        db.book.findMany({
          where: { trending: true },
          select: { title: true, author: true, price: true, discountPrice: true, rating: true, category: { select: { name: true } } },
          take: 5,
          orderBy: { totalSales: 'desc' },
        }),
        db.book.findMany({
          where: { featured: true },
          select: { title: true, author: true, price: true, discountPrice: true, rating: true, category: { select: { name: true } } },
          take: 5,
          orderBy: { rating: 'desc' },
        }),
        db.book.findMany({
          where: { price: 0 },
          select: { title: true, author: true, rating: true, category: { select: { name: true } } },
          take: 5,
        }),
      ]);

      if (trending.length > 0) {
        contextParts.push(
          'Trending books: ' +
            trending
              .map((b) => `${b.title} by ${b.author} ($${b.discountPrice ?? b.price}, ${b.category.name}, ${b.rating} stars)`)
              .join('; ')
        );
      }
      if (featured.length > 0) {
        contextParts.push(
          'Featured books: ' +
            featured
              .map((b) => `${b.title} by ${b.author} ($${b.discountPrice ?? b.price}, ${b.category.name}, ${b.rating} stars)`)
              .join('; ')
        );
      }
      if (freeBooks.length > 0) {
        contextParts.push(
          'Free books: ' +
            freeBooks.map((b) => `${b.title} by ${b.author} (${b.category.name}, ${b.rating} stars)`).join('; ')
        );
      }
    }
  } catch (error) {
    console.error('Error fetching book context:', error);
  }

  return contextParts.length > 0
    ? `\n\nCurrent store data:\n${contextParts.join('\n')}`
    : '';
}

async function callZAI(messages: { role: string; content: string }[]): Promise<string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${ZAI_CONFIG.apiKey}`,
    'X-Z-AI-From': 'Z',
  };

  if (ZAI_CONFIG.token) {
    headers['X-Token'] = ZAI_CONFIG.token;
  }
  if (ZAI_CONFIG.userId) {
    headers['X-User-Id'] = ZAI_CONFIG.userId;
  }

  const response = await fetch(`${ZAI_CONFIG.baseUrl}/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      messages,
      temperature: 0.7,
      max_tokens: 500,
      thinking: { type: 'disabled' },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`ZAI API failed (${response.status}): ${errorBody.substring(0, 200)}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';
}

// Also support the BigModel/GLM API as fallback
async function callBigModel(messages: { role: string; content: string }[]): Promise<string> {
  const apiKey = process.env.BIGMODEL_API_KEY;
  if (!apiKey) return '';

  const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'glm-4-plus',
      messages,
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`BigModel API failed (${response.status}): ${errorBody.substring(0, 200)}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
    }

    // Get the last user message for context
    const lastUserMessage = messages.filter((m: { role: string }) => m.role === 'user').pop();
    const bookContext = lastUserMessage ? await getBookContext(lastUserMessage.content) : '';

    const allMessages = [
      { role: 'system', content: SYSTEM_PROMPT + bookContext },
      ...messages,
    ];

    let reply = '';

    // Try Z AI internal API first
    try {
      reply = await callZAI(allMessages);
    } catch (zaiError: any) {
      console.error('Z AI failed, trying BigModel fallback:', zaiError.message);

      // Try BigModel API as fallback
      try {
        reply = await callBigModel(allMessages);
      } catch (bmError: any) {
        console.error('BigModel also failed:', bmError.message);
        throw zaiError; // throw original error
      }
    }

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error('Chat API error:', error.message || error);
    return NextResponse.json(
      { error: 'Failed to generate response', reply: 'Sorry, I encountered an error. Please try again later.' },
      { status: 500 }
    );
  }
}
