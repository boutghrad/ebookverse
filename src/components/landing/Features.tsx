'use client';

import { motion } from 'framer-motion';
import {
  Download,
  Smartphone,
  Shield,
  Library,
  Sparkles,
  Search,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const features = [
  {
    icon: Download,
    title: 'Instant Downloads',
    description: 'Get your eBooks instantly after purchase. No waiting, start reading right away.',
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    icon: Smartphone,
    title: 'Multi-device Reading',
    description: 'Read on any device, anywhere. Sync your progress across all your devices seamlessly.',
    gradient: 'from-rose-500 to-pink-600',
  },
  {
    icon: Shield,
    title: 'Secure Payments',
    description: 'Stripe-powered secure transactions. Your payment information is always protected.',
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    icon: Library,
    title: 'Huge Library',
    description: 'Over 10,000 titles across all genres. From fiction to technical, we have it all.',
    gradient: 'from-amber-500 to-orange-600',
  },
  {
    icon: Sparkles,
    title: 'AI Recommendations',
    description: 'Personalized book suggestions powered by AI. Discover books you will love.',
    gradient: 'from-fuchsia-500 to-purple-600',
  },
  {
    icon: Search,
    title: 'Fast Search',
    description: 'Find any book in seconds with our powerful search engine and smart filters.',
    gradient: 'from-cyan-500 to-blue-600',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Features() {
  return (
    <section id="about" className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider">
            Why EbookVerse
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">
            Everything You Need for{' '}
            <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Perfect Reading
            </span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto text-lg">
            We have built the best platform for book lovers with powerful features
            and an incredible reading experience.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ duration: 0.2 }}
              className="group"
            >
              <div className="relative h-full rounded-xl border bg-card/50 backdrop-blur-sm p-6 shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                {/* Gradient border effect on hover */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-violet-500/0 to-purple-500/0 group-hover:from-violet-500/5 group-hover:to-purple-500/5 transition-all duration-300" />

                <div className="relative z-10">
                  <div
                    className={cn(
                      'inline-flex items-center justify-center size-12 rounded-xl bg-gradient-to-br shadow-lg',
                      feature.gradient
                    )}
                  >
                    <feature.icon className="size-6 text-white" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
