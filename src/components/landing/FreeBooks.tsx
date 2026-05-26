'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Gift, ArrowRight, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BookCard, { type BookProps } from '@/components/shared/BookCard';

export default function FreeBooks() {
  const [books, setBooks] = useState<BookProps[]>([]);

  useEffect(() => {
    async function fetchFreeBooks() {
      try {
        const res = await fetch('/api/books?free=true&limit=4');
        if (res.ok) {
          const data = await res.json();
          if (data.books && data.books.length > 0) {
            setBooks(data.books);
          }
        }
      } catch {
        // Silently handle
      }
    }
    fetchFreeBooks();
  }, []);

  if (books.length === 0) return null;

  return (
    <section className="py-20 lg:py-28 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12"
        >
          <div>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              <Gift className="size-4" />
              On the House
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">
              Free{' '}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                  eBooks
                </span>
                <span className="absolute -bottom-1 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" />
              </span>
            </h2>
            <p className="mt-3 text-muted-foreground text-lg max-w-xl">
              Enjoy these handpicked eBooks completely free. No payment required — just click and download!
            </p>
          </div>
          <Button
            variant="outline"
            className="group w-fit border-emerald-500/50 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
            asChild
          >
            <Link href="/books?free=true">
              <Gift className="size-4 mr-1" />
              Browse All Free Books
              <ArrowRight className="size-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </Button>
        </motion.div>

        {/* Free Books Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {books.map((book, index) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
            >
              <BookCard book={book} />
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-10 text-center"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
            <Download className="size-5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
              {books.length} free eBooks available — no credit card needed
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
