'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Briefcase,
  Brain,
  Cpu,
  Megaphone,
  Landmark,
  Code,
  Palette,
  Heart,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Category {
  id: string;
  name: string;
  slug: string;
  bookCount: number;
  icon: string;
}

const iconMap: Record<string, React.ElementType> = {
  Briefcase,
  Brain,
  Cpu,
  Megaphone,
  Landmark,
  Code,
  Palette,
  Heart,
};

const gradientMap: Record<string, string> = {
  business: 'from-violet-500 to-purple-600',
  'self-development': 'from-rose-500 to-pink-600',
  'ai-technology': 'from-cyan-500 to-teal-600',
  marketing: 'from-amber-500 to-orange-600',
  finance: 'from-emerald-500 to-green-600',
  programming: 'from-blue-500 to-indigo-600',
  design: 'from-fuchsia-500 to-purple-600',
  psychology: 'from-red-500 to-rose-600',
};

const fallbackCategories: Category[] = [
  { id: '1', name: 'Business', slug: 'business', bookCount: 1240, icon: 'Briefcase' },
  { id: '2', name: 'Self Development', slug: 'self-development', bookCount: 980, icon: 'Brain' },
  { id: '3', name: 'AI & Technology', slug: 'ai-technology', bookCount: 1560, icon: 'Cpu' },
  { id: '4', name: 'Marketing', slug: 'marketing', bookCount: 870, icon: 'Megaphone' },
  { id: '5', name: 'Finance', slug: 'finance', bookCount: 750, icon: 'Landmark' },
  { id: '6', name: 'Programming', slug: 'programming', bookCount: 1890, icon: 'Code' },
  { id: '7', name: 'Design', slug: 'design', bookCount: 640, icon: 'Palette' },
  { id: '8', name: 'Psychology', slug: 'psychology', bookCount: 560, icon: 'Heart' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>(fallbackCategories);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const data = await res.json();
          if (data.categories && data.categories.length > 0) {
            setCategories(data.categories);
          }
        }
      } catch {
        // Use fallback data
      }
    }
    fetchCategories();
  }, []);

  return (
    <section id="categories" className="py-20 lg:py-28 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider">
            Browse by Genre
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">
            Explore Our{' '}
            <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Categories
            </span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto text-lg">
            Find your favorite genre from our extensive collection of eBook categories.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6"
        >
          {categories.map((category) => {
            const Icon = iconMap[category.icon] || Briefcase;
            const gradient = gradientMap[category.slug] || 'from-violet-500 to-purple-600';

            return (
              <motion.div key={category.id} variants={itemVariants}>
                <Link
                  href={`/books?category=${category.slug}`}
                  className="group block"
                >
                  <div className="relative rounded-xl border bg-card/50 backdrop-blur-sm p-6 text-center shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
                    {/* Gradient border on hover */}
                    <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-[1px] bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500">
                      <div className="h-full w-full rounded-xl bg-card" />
                    </div>

                    <div className="relative z-10">
                      <div
                        className={cn(
                          'inline-flex items-center justify-center size-14 rounded-2xl bg-gradient-to-br shadow-lg mx-auto mb-4',
                          gradient
                        )}
                      >
                        <Icon className="size-7 text-white" />
                      </div>
                      <h3 className="font-semibold text-sm sm:text-base">{category.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {category.bookCount.toLocaleString()} books
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
