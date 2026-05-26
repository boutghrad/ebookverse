'use client';

import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  quote: string;
  rating: number;
  initials: string;
  color: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'Product Manager',
    quote: 'EbookVerse has completely transformed my reading habits. The AI recommendations are spot on, and I discover new books every week that I would have never found otherwise.',
    rating: 5,
    initials: 'SJ',
    color: 'bg-violet-500',
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Software Engineer',
    quote: 'The multi-device sync is seamless. I start reading on my laptop and pick up right where I left off on my phone. Plus, the instant downloads are a game changer.',
    rating: 5,
    initials: 'MC',
    color: 'bg-rose-500',
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    role: 'Marketing Director',
    quote: 'As someone who reads across multiple genres, the category system and search are incredible. I can find exactly what I am looking for in seconds.',
    rating: 4,
    initials: 'ER',
    color: 'bg-amber-500',
  },
  {
    id: 4,
    name: 'David Park',
    role: 'Startup Founder',
    quote: 'The library is massive and the prices are competitive. I have saved so much compared to buying individual books. The subscription is totally worth it.',
    rating: 5,
    initials: 'DP',
    color: 'bg-emerald-500',
  },
  {
    id: 5,
    name: 'Lisa Wang',
    role: 'UX Designer',
    quote: 'Beautiful interface, smooth reading experience, and excellent curation. EbookVerse feels like it was designed by people who actually love reading.',
    rating: 5,
    initials: 'LW',
    color: 'bg-cyan-500',
  },
];

export default function Testimonials() {
  return (
    <section className="py-20 lg:py-28 relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-violet-50 via-purple-50/50 to-background dark:from-violet-950/30 dark:via-purple-950/20 dark:to-background -z-10" />
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-0 w-72 h-72 bg-violet-200/30 dark:bg-violet-900/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-72 h-72 bg-purple-200/30 dark:bg-purple-900/20 rounded-full blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider">
            Testimonials
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">
            Loved by{' '}
            <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Thousands
            </span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto text-lg">
            See what our readers have to say about their EbookVerse experience.
          </p>
        </motion.div>

        {/* Auto-scrolling testimonial cards */}
        <div className="relative">
          <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="flex-shrink-0 w-[320px] sm:w-[360px] snap-center"
              >
                <div className="h-full rounded-xl border bg-card/80 backdrop-blur-sm p-6 shadow-sm hover:shadow-md transition-shadow">
                  <Quote className="size-8 text-violet-300 dark:text-violet-700 mb-4" />

                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>

                  <div className="flex items-center gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={cn(
                          'size-4',
                          star <= testimonial.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'fill-muted text-muted'
                        )}
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'size-10 rounded-full flex items-center justify-center text-white text-sm font-bold',
                        testimonial.color
                      )}
                    >
                      {testimonial.initials}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{testimonial.name}</div>
                      <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Fade edges */}
          <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-background to-transparent pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-background to-transparent pointer-events-none" />
        </div>
      </div>
    </section>
  );
}
