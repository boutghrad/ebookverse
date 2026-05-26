'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BookCard, { type BookProps } from '@/components/shared/BookCard';

const fallbackBooks: BookProps[] = [
  {
    id: '1', title: 'The AI Revolution: Transforming Business', slug: 'ai-revolution',
    author: 'Sarah Chen', price: 29.99, discountPrice: 19.99, rating: 4.8,
    totalReviews: 342, category: 'AI & Technology',
  },
  {
    id: '2', title: 'Mindful Leadership in Digital Age', slug: 'mindful-leadership',
    author: 'James Miller', price: 24.99, rating: 4.6, totalReviews: 218,
    category: 'Business',
  },
  {
    id: '3', title: 'React Patterns & Best Practices', slug: 'react-patterns',
    author: 'Alex Rivera', price: 34.99, discountPrice: 24.99, rating: 4.9,
    totalReviews: 567, category: 'Programming',
  },
  {
    id: '4', title: 'The Psychology of Money', slug: 'psychology-of-money',
    author: 'Morgan Housel', price: 19.99, rating: 4.7, totalReviews: 891,
    category: 'Finance',
  },
  {
    id: '5', title: 'Creative Design Thinking', slug: 'creative-design',
    author: 'Emily Park', price: 27.99, discountPrice: 22.99, rating: 4.5,
    totalReviews: 156, category: 'Design',
  },
  {
    id: '6', title: 'Growth Marketing Playbook', slug: 'growth-marketing',
    author: 'David Kim', price: 32.99, rating: 4.4, totalReviews: 203,
    category: 'Marketing',
  },
  {
    id: '7', title: 'Atomic Habits for Developers', slug: 'atomic-habits-dev',
    author: 'Lisa Zhang', price: 22.99, discountPrice: 17.99, rating: 4.8,
    totalReviews: 445, category: 'Self Development',
  },
  {
    id: '8', title: 'Deep Learning Foundations', slug: 'deep-learning',
    author: 'Robert Lee', price: 39.99, rating: 4.6, totalReviews: 312,
    category: 'AI & Technology',
  },
];

export default function BestSellers() {
  const [books, setBooks] = useState<BookProps[]>(fallbackBooks);

  useEffect(() => {
    async function fetchBooks() {
      try {
        const res = await fetch('/api/books?sort=popular&limit=8');
        if (res.ok) {
          const data = await res.json();
          if (data.books && data.books.length > 0) {
            setBooks(data.books);
          }
        }
      } catch {
        // Use fallback data
      }
    }
    fetchBooks();
  }, []);

  return (
    <section id="books" className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12"
        >
          <div>
            <span className="text-sm font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider">
              Popular Picks
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">
              Best{' '}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                  Sellers
                </span>
                <span className="absolute -bottom-1 left-0 right-0 h-[3px] bg-gradient-to-r from-violet-500 to-purple-500 rounded-full" />
              </span>
            </h2>
          </div>
          <Button variant="outline" className="group w-fit" asChild>
            <Link href="/books">
              View All
              <ArrowRight className="size-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </Button>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {books.map((book, index) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <BookCard book={book} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
