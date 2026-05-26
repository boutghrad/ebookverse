'use client';

import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Users, Star, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

const stats = [
  { icon: BookOpen, value: '10K+', label: 'eBooks' },
  { icon: Users, value: '50K+', label: 'Readers' },
  { icon: Star, value: '4.9', label: 'Rating' },
];

const floatingBooks = [
  { title: 'AI Revolution', gradient: 'from-violet-500 to-purple-600', rotation: -12, x: -20 },
  { title: 'Design Thinking', gradient: 'from-rose-500 to-pink-500', rotation: 8, x: 0 },
  { title: 'Future of Tech', gradient: 'from-amber-500 to-orange-500', rotation: -5, x: 20 },
];

const trustedAvatars = [
  { initials: 'AK', color: 'bg-violet-500' },
  { initials: 'SM', color: 'bg-rose-500' },
  { initials: 'JD', color: 'bg-amber-500' },
  { initials: 'LR', color: 'bg-emerald-500' },
  { initials: 'TW', color: 'bg-cyan-500' },
];

export default function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center overflow-hidden pt-16"
    >
      {/* Animated Gradient Mesh Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(139,92,246,0.15),transparent)]" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-200/30 dark:bg-violet-900/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-200/30 dark:bg-purple-900/20 rounded-full blur-3xl animate-pulse [animation-delay:1s]" />
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-fuchsia-200/20 dark:bg-fuchsia-900/10 rounded-full blur-3xl animate-pulse [animation-delay:2s]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-100 dark:bg-violet-950/50 border border-violet-200 dark:border-violet-800 mb-6">
                <Shield className="size-3.5 text-violet-600 dark:text-violet-400" />
                <span className="text-xs font-medium text-violet-700 dark:text-violet-300">
                  Trusted by 50,000+ readers worldwide
                </span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight"
            >
              Discover Your Next{' '}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                  Great Read
                </span>
                <motion.span
                  className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                  style={{ originX: 0 }}
                />
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-muted-foreground max-w-lg leading-relaxed"
            >
              Access thousands of premium eBooks across every genre. From bestsellers
              to hidden gems, find the perfect book for your next adventure.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-4"
            >
              <Button
                size="lg"
                className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg shadow-violet-500/25 group"
                asChild
              >
                <a href="#books">
                  Explore Library
                  <ArrowRight className="size-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                </a>
              </Button>
              <Button size="lg" variant="outline" className="group" asChild>
                <a href="#categories">
                  Browse Categories
                  <ArrowRight className="size-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                </a>
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex items-center gap-8 pt-4"
            >
              {stats.map((stat) => (
                <div key={stat.label} className="flex items-center gap-3">
                  <div className="flex items-center justify-center size-10 rounded-lg bg-violet-100 dark:bg-violet-950/50">
                    <stat.icon className="size-5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <div className="font-bold text-lg">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Trusted By */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex items-center gap-3 pt-2"
            >
              <div className="flex -space-x-2">
                {trustedAvatars.map((avatar) => (
                  <div
                    key={avatar.initials}
                    className={`size-8 rounded-full ${avatar.color} flex items-center justify-center text-white text-[10px] font-bold border-2 border-background`}
                  >
                    {avatar.initials}
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Join <span className="font-semibold text-foreground">50,000+</span> happy readers
              </p>
            </motion.div>
          </div>

          {/* Right - Floating Book Cards */}
          <div className="relative hidden lg:block h-[500px]">
            {floatingBooks.map((book, index) => (
              <motion.div
                key={book.title}
                initial={{ opacity: 0, y: 40, rotate: book.rotation }}
                animate={{ opacity: 1, y: 0, rotate: book.rotation }}
                transition={{
                  duration: 0.8,
                  delay: 0.4 + index * 0.15,
                  ease: 'easeOut',
                }}
                className="absolute"
                style={{
                  top: `${20 + index * 28}%`,
                  left: `${10 + index * 25}%`,
                  zIndex: 3 - index,
                }}
              >
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                  }}
                  transition={{
                    duration: 3 + index * 0.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <div
                    className={`w-48 h-64 rounded-2xl bg-gradient-to-br ${book.gradient} shadow-2xl flex flex-col items-center justify-center gap-3 p-6`}
                  >
                    <BookOpen className="size-12 text-white/60" />
                    <p className="text-white font-semibold text-center text-sm">
                      {book.title}
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            ))}

            {/* Decorative circles */}
            <div className="absolute top-10 right-10 w-32 h-32 rounded-full border-2 border-violet-200/50 dark:border-violet-800/30" />
            <div className="absolute bottom-20 left-10 w-20 h-20 rounded-full border-2 border-purple-200/50 dark:border-purple-800/30" />
          </div>
        </div>
      </div>
    </section>
  );
}
