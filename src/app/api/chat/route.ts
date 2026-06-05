import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

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
- Help users navigate the site
- Keep responses under 200 words unless the user asks for detailed information
- Always respond in the same language the user is writing in`;

interface BookInfo {
  title: string;
  author: string;
  price: number;
  discountPrice: number | null;
  rating: number;
  category: { name: string };
}

async function getStoreData(query: string): Promise<{
  books: BookInfo[];
  categories: { name: string; count: number }[];
}> {
  const lowerQuery = query.toLowerCase();
  const books: BookInfo[] = [];
  const categories: { name: string; count: number }[] = [];

  try {
    // Get categories
    const cats = await db.category.findMany({
      include: { _count: { select: { books: true } } },
      take: 15,
    });
    for (const c of cats) {
      categories.push({ name: c.name, count: c._count.books });
    }

    // Get trending books
    if (lowerQuery.includes('trending') || lowerQuery.includes('popular') || lowerQuery.includes('best')) {
      const trending = await db.book.findMany({
        where: { trending: true },
        select: { title: true, author: true, price: true, discountPrice: true, rating: true, category: { select: { name: true } } },
        take: 5, orderBy: { totalSales: 'desc' },
      });
      books.push(...trending);
    }

    // Get featured books
    if (lowerQuery.includes('featured') || lowerQuery.includes('recommend') || lowerQuery.includes('suggest')) {
      const featured = await db.book.findMany({
        where: { featured: true },
        select: { title: true, author: true, price: true, discountPrice: true, rating: true, category: { select: { name: true } } },
        take: 5, orderBy: { rating: 'desc' },
      });
      books.push(...featured);
    }

    // Get free books
    if (lowerQuery.includes('free') || lowerQuery.includes('gratis')) {
      const free = await db.book.findMany({
        where: { price: 0 },
        select: { title: true, author: true, price: true, discountPrice: true, rating: true, category: { select: { name: true } } },
        take: 5,
      });
      books.push(...free);
    }

    // General book query - get top rated
    if (lowerQuery.includes('book') || lowerQuery.includes('read') || books.length === 0) {
      const top = await db.book.findMany({
        select: { title: true, author: true, price: true, discountPrice: true, rating: true, category: { select: { name: true } } },
        take: 5, orderBy: { rating: 'desc' },
      });
      books.push(...top);
    }
  } catch (error) {
    console.error('Error fetching store data:', error);
  }

  return { books: books.slice(0, 8), categories };
}

function formatBookList(books: BookInfo[]): string {
  return books.map((b) => {
    const price = b.discountPrice != null && b.discountPrice < b.price
      ? `~~$${b.price}~~ $${b.discountPrice}`
      : b.price === 0 ? 'FREE' : `$${b.price}`;
    return `- **${b.title}** by ${b.author} (${price}, ${b.category.name}, ${b.rating} stars)`;
  }).join('\n');
}

function generateSmartReply(query: string, books: BookInfo[], categories: { name: string; count: number }[]): string {
  const lowerQuery = query.toLowerCase();

  // Arabic responses
  if (/[\u0600-\u06FF]/.test(query)) {
    if (lowerQuery.includes('كتاب') || lowerQuery.includes('كتب')) {
      return `📚 إليك بعض الكتب المتاحة لدينا:\n\n${formatBookList(books)}\n\nتصفح المزيد على: /books`;
    }
    if (lowerQuery.includes('مجاني') || lowerQuery.includes('ح gratuit')) {
      const freeBooks = books.filter(b => b.price === 0);
      return freeBooks.length > 0 ? `📚 كتب مجانية متاحة:\n\n${formatBookList(freeBooks)}` : 'لا توجد كتب مجانية حالياً. تابعنا للمزيد!';
    }
    return `مرحباً بك في EbookVerse! 📚\n\nيمكنني مساعدتك في العثور على الكتب، الاستشهادات، والمزيد.\n\nالتصنيفات المتاحة: ${categories.map(c => c.name).join(', ')}\n\nكيف يمكنني مساعدتك؟`;
  }

  // French responses
  if (/\b(bonjour|salut|merci|livre|gratuit|catégorie)\b/i.test(query)) {
    if (lowerQuery.includes('gratuit')) {
      const freeBooks = books.filter(b => b.price === 0);
      return freeBooks.length > 0 ? `📚 Livres gratuits disponibles:\n\n${formatBookList(freeBooks)}` : 'Pas de livres gratuits pour le moment.';
    }
    return `Bonjour! Bienvenue sur EbookVerse! 📚\n\nCatégories disponibles: ${categories.map(c => `${c.name} (${c.count})`).join(', ')}\n\n${books.length > 0 ? `Voici quelques livres populaires:\n\n${formatBookList(books.slice(0, 4))}` : ''}`;
  }

  // English responses
  if (lowerQuery.includes('trending') || lowerQuery.includes('popular') || lowerQuery.includes('best')) {
    return `📚 Here are our trending books right now:\n\n${formatBookList(books)}\n\nBrowse more at /books`;
  }
  if (lowerQuery.includes('free')) {
    const freeBooks = books.filter(b => b.price === 0);
    return freeBooks.length > 0
      ? `🎁 We have ${freeBooks.length} free books available:\n\n${formatBookList(freeBooks)}\n\nGrab them at /books?free=true`
      : 'We currently have a rotating selection of free books. Check back at /books for the latest deals!';
  }
  if (lowerQuery.includes('categor') || lowerQuery.includes('genre')) {
    return `📂 Our book categories:\n\n${categories.map(c => `- **${c.name}** (${c.count} books)`).join('\n')}\n\nBrowse by category at /books`;
  }
  if (lowerQuery.includes('pay') || lowerQuery.includes('price') || lowerQuery.includes('cost')) {
    return `💰 Payment information:\n\n- **PayPal** — Secure payment with PayPal\n- **Free books** — No payment needed!\n- Many books have **discount prices** available\n\nPrices range from FREE to premium. Check /books for details!`;
  }
  if (lowerQuery.includes('recommend') || lowerQuery.includes('suggest')) {
    return `📚 Here are my top recommendations:\n\n${formatBookList(books.slice(0, 5))}\n\nWant more? Browse our full catalog at /books`;
  }
  if (lowerQuery.includes('hello') || lowerQuery.includes('hi') || lowerQuery.includes('hey')) {
    return `Hello! Welcome to EbookVerse! 📚\n\nI'm EbookBot, your AI assistant. I can help you:\n- Find trending & featured books\n- Discover free books\n- Browse categories\n- Answer questions about payments & navigation\n\nWhat would you like to know?`;
  }
  if (lowerQuery.includes('book') || lowerQuery.includes('read') || lowerQuery.includes('find')) {
    return `📚 Here are some great books from our collection:\n\n${formatBookList(books.slice(0, 5))}\n\nBrowse our full catalog at /books`;
  }
  if (lowerQuery.includes('thank')) {
    return `You're welcome! 😊 If you need anything else, I'm here to help. Happy reading! 📚`;
  }
  if (lowerQuery.includes('how') && (lowerQuery.includes('sign') || lowerQuery.includes('account') || lowerQuery.includes('register'))) {
    return `📝 To create an account on EbookVerse:\n\n1. Go to /auth/signup\n2. Enter your name, email, and password\n3. Or sign up with **GitHub** for quick access\n\nOnce registered, you can add books to your cart, wishlist, and make purchases!`;
  }

  // Default response
  return `Hello! I'm EbookBot 🤖\n\nHere's what I can help with:\n- 📚 **Books** — Trending, featured, free, recommendations\n- 📂 **Categories** — Browse by genre\n- 💰 **Payments** — PayPal & free books\n- 🧭 **Navigation** — Find pages on the site\n\n${books.length > 0 ? `Popular books right now:\n\n${formatBookList(books.slice(0, 3))}` : ''}\n\nWhat would you like to know?`;
}

async function callBigModel(messages: { role: string; content: string }[]): Promise<string | null> {
  const bigModelKey = process.env.BIGMODEL_API_KEY;
  if (!bigModelKey) return null;

  try {
    const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${bigModelKey}` },
      body: JSON.stringify({ model: 'glm-4-plus', messages, temperature: 0.7, max_tokens: 500 }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.choices?.[0]?.message?.content || null;
    }
  } catch {}
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
    }

    const lastUserMessage = messages.filter((m: { role: string }) => m.role === 'user').pop();
    const query = lastUserMessage?.content || '';

    // Get store data from database
    const { books, categories } = await getStoreData(query);

    // Try AI providers first
    const allMessages = [
      { role: 'system', content: SYSTEM_PROMPT + (books.length > 0 ? `\n\nCurrent store data:\n${formatBookList(books)}` : '') },
      ...messages,
    ];

    const aiReply = await callBigModel(allMessages);
    if (aiReply) return NextResponse.json({ reply: aiReply });

    // Fallback: smart rule-based response with real database data
    const reply = generateSmartReply(query, books, categories);
    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error('Chat API error:', error.message || error);
    return NextResponse.json({ reply: 'Sorry, I encountered an error. Please try again later.' });
  }
}
