import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import fs from 'fs';
import path from 'path';
import os from 'os';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

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

// Ensure ZAI config file exists at runtime for the SDK
let configInitialized = false;
function ensureZAIConfig() {
  if (configInitialized) return;
  try {
    const configPaths = [
      path.join(process.cwd(), '.z-ai-config'),
      path.join(os.homedir(), '.z-ai-config'),
      '/tmp/.z-ai-config',
    ];

    const token = process.env.ZAI_TOKEN || '';
    const userId = process.env.ZAI_USER_ID || '';
    const apiKey = process.env.ZAI_API_KEY || 'Z.ai';

    if (token) {
      const config = JSON.stringify({
        baseUrl: 'https://internal-api.z.ai/v1',
        apiKey,
        chatId: 'chat-5c9e4fa7-fcde-422c-bcee-8c4ffb6a8412',
        token,
        userId,
      });

      for (const configPath of configPaths) {
        try {
          fs.writeFileSync(configPath, config);
        } catch {}
      }
    }
    configInitialized = true;
  } catch {}
}

async function getBookContext(query: string): Promise<string> {
  const contextParts: string[] = [];
  try {
    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes('categor') || lowerQuery.includes('genre') || lowerQuery.includes('type') || lowerQuery.includes('kind')) {
      const categories = await db.category.findMany({ include: { _count: { select: { books: true } } }, take: 10 });
      if (categories.length > 0) contextParts.push('Available categories: ' + categories.map((c) => `${c.name} (${c._count.books} books)`).join(', '));
    }
    if (lowerQuery.includes('book') || lowerQuery.includes('recommend') || lowerQuery.includes('suggest') ||
        lowerQuery.includes('find') || lowerQuery.includes('search') || lowerQuery.includes('author') ||
        lowerQuery.includes('trending') || lowerQuery.includes('popular') || lowerQuery.includes('best') ||
        lowerQuery.includes('free') || lowerQuery.includes('discount') || lowerQuery.includes('price')) {
      const [trending, featured, freeBooks] = await Promise.all([
        db.book.findMany({ where: { trending: true }, select: { title: true, author: true, price: true, discountPrice: true, rating: true, category: { select: { name: true } } }, take: 5, orderBy: { totalSales: 'desc' } }),
        db.book.findMany({ where: { featured: true }, select: { title: true, author: true, price: true, discountPrice: true, rating: true, category: { select: { name: true } } }, take: 5, orderBy: { rating: 'desc' } }),
        db.book.findMany({ where: { price: 0 }, select: { title: true, author: true, rating: true, category: { select: { name: true } } }, take: 5 }),
      ]);
      if (trending.length > 0) contextParts.push('Trending: ' + trending.map((b) => `${b.title} by ${b.author} ($${b.discountPrice ?? b.price})`).join('; '));
      if (featured.length > 0) contextParts.push('Featured: ' + featured.map((b) => `${b.title} by ${b.author} ($${b.discountPrice ?? b.price})`).join('; '));
      if (freeBooks.length > 0) contextParts.push('Free: ' + freeBooks.map((b) => `${b.title} by ${b.author}`).join('; '));
    }
  } catch (error) { console.error('Error fetching book context:', error); }
  return contextParts.length > 0 ? `\n\nCurrent store data:\n${contextParts.join('\n')}` : '';
}

async function callZAI(messages: { role: string; content: string }[]): Promise<string> {
  ensureZAIConfig();

  // Use dynamic import to ensure the SDK picks up the config file
  const ZAI = (await import('z-ai-web-dev-sdk')).default;
  const zai = await ZAI.create();
  const completion = await zai.chat.completions.create({
    messages,
    temperature: 0.7,
    max_tokens: 500,
  });
  return completion.choices?.[0]?.message?.content || '';
}

async function callBigModel(messages: { role: string; content: string }[]): Promise<string> {
  const bigModelKey = process.env.BIGMODEL_API_KEY;
  if (!bigModelKey) return '';

  const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${bigModelKey}` },
    body: JSON.stringify({ model: 'glm-4-plus', messages, temperature: 0.7, max_tokens: 500 }),
  });

  if (response.ok) {
    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }
  return '';
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
    }

    const lastUserMessage = messages.filter((m: { role: string }) => m.role === 'user').pop();
    const bookContext = lastUserMessage ? await getBookContext(lastUserMessage.content) : '';
    const allMessages = [
      { role: 'system', content: SYSTEM_PROMPT + bookContext },
      ...messages,
    ];

    // Try ZAI SDK first
    try {
      const reply = await callZAI(allMessages);
      if (reply) return NextResponse.json({ reply });
    } catch (e: any) {
      console.error('ZAI SDK failed:', e.message?.substring(0, 100));
    }

    // Fallback to BigModel
    try {
      const reply = await callBigModel(allMessages);
      if (reply) return NextResponse.json({ reply });
    } catch (e: any) {
      console.error('BigModel failed:', e.message?.substring(0, 100));
    }

    return NextResponse.json({ reply: 'Sorry, all AI services are currently busy. Please try again in a moment.' });
  } catch (error: any) {
    console.error('Chat API error:', error.message || error);
    return NextResponse.json({ reply: 'Sorry, I encountered an error. Please try again later.' });
  }
}
