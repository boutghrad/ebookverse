'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, ChevronLeft, ChevronRight, BookOpen, Sparkles, ShoppingCart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

const scenes = [
  {
    id: 1,
    title: 'Discover 10,000+ eBooks',
    subtitle: 'From Bestsellers to Hidden Gems',
    description: 'Explore our vast library spanning every genre imaginable. Fiction, technology, business, and more — your next great read is waiting.',
    gradient: 'from-violet-600 via-purple-600 to-fuchsia-600',
    icon: BookOpen,
    stat: '10,000+',
    statLabel: 'Digital Books',
  },
  {
    id: 2,
    title: 'Instant Downloads',
    subtitle: 'Start Reading in Seconds',
    description: 'No waiting, no shipping. Purchase and download your eBooks instantly. Begin your reading journey the moment you click buy.',
    gradient: 'from-rose-600 via-pink-600 to-red-600',
    icon: ShoppingCart,
    stat: '< 3s',
    statLabel: 'Download Time',
  },
  {
    id: 3,
    title: 'AI-Powered Recommendations',
    subtitle: 'Books You Will Love',
    description: 'Our smart AI learns your preferences and suggests books tailored just for you. Discover titles you never knew you needed.',
    gradient: 'from-amber-500 via-orange-500 to-red-500',
    icon: Sparkles,
    stat: '98%',
    statLabel: 'Match Accuracy',
  },
  {
    id: 4,
    title: 'Join 50,000+ Happy Readers',
    subtitle: 'Rated 4.9 Stars',
    description: 'Join a thriving community of book enthusiasts. Share reviews, get recommendations, and enjoy exclusive member benefits.',
    gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
    icon: Star,
    stat: '4.9',
    statLabel: 'User Rating',
  },
];

export default function PromoVideo() {
  const [currentScene, setCurrentScene] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  const scene = scenes[currentScene];

  const nextScene = useCallback(() => {
    setCurrentScene((prev) => (prev + 1) % scenes.length);
    setProgress(0);
  }, []);

  const prevScene = useCallback(() => {
    setCurrentScene((prev) => (prev - 1 + scenes.length) % scenes.length);
    setProgress(0);
  }, []);

  // Auto-advance scenes
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          nextScene();
          return 0;
        }
        return prev + 0.5;
      });
    }, 25);

    return () => clearInterval(interval);
  }, [isPlaying, nextScene]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const Icon = scene.icon;

  return (
    <section className="py-20 lg:py-28 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(139,92,246,0.08),transparent)]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="text-sm font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider">
            See It In Action
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">
            Watch Our{' '}
            <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Story
            </span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto text-lg">
            Discover why thousands of readers choose EbookVerse as their go-to digital bookstore.
          </p>
        </motion.div>

        {/* Video Player Container */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative mx-auto max-w-5xl"
        >
          {/* Video Frame */}
          <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-violet-500/10 border border-violet-200/20 dark:border-violet-800/30">
            {/* Browser-like top bar */}
            <div className="bg-muted/80 backdrop-blur-sm px-4 py-3 flex items-center gap-2 border-b">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="flex-1 mx-4">
                <div className="bg-background/60 rounded-md px-3 py-1 text-xs text-muted-foreground text-center max-w-md mx-auto">
                  ebookverse.com
                </div>
              </div>
              <div className="w-16" />
            </div>

            {/* Video Content Area */}
            <div className="relative aspect-video bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
              {/* Background Thumbnail */}
              <div className="absolute inset-0 opacity-30">
                <Image
                  src="/promo-video-thumbnail.png"
                  alt="EbookVerse Promo"
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              {/* Animated gradient overlay */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={scene.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.7 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className={`absolute inset-0 bg-gradient-to-br ${scene.gradient}`}
                />
              </AnimatePresence>

              {/* Floating particles */}
              <div className="absolute inset-0 overflow-hidden">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-white/30 rounded-full"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                      y: [0, -30, 0],
                      opacity: [0.2, 0.8, 0.2],
                    }}
                    transition={{
                      duration: 3 + Math.random() * 2,
                      repeat: Infinity,
                      delay: Math.random() * 2,
                    }}
                  />
                ))}
              </div>

              {/* Content overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={scene.id}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="text-center text-white px-8 max-w-2xl"
                  >
                    {/* Animated icon */}
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ duration: 0.6, delay: 0.2, type: 'spring' }}
                      className="inline-flex items-center justify-center size-20 rounded-2xl bg-white/20 backdrop-blur-sm mb-6 shadow-lg"
                    >
                      <Icon className="size-10 text-white" />
                    </motion.div>

                    {/* Stat */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="mb-4"
                    >
                      <span className="text-5xl sm:text-6xl font-bold tracking-tight">
                        {scene.stat}
                      </span>
                      <span className="block text-white/70 text-sm mt-1">
                        {scene.statLabel}
                      </span>
                    </motion.div>

                    {/* Title */}
                    <motion.h3
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-2xl sm:text-3xl font-bold mb-2"
                    >
                      {scene.title}
                    </motion.h3>

                    {/* Subtitle */}
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="text-white/80 font-medium mb-4"
                    >
                      {scene.subtitle}
                    </motion.p>

                    {/* Description */}
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="text-white/60 text-sm sm:text-base max-w-lg mx-auto leading-relaxed"
                    >
                      {scene.description}
                    </motion.p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Play/Pause overlay button (center) */}
              <motion.button
                className="absolute inset-0 flex items-center justify-center z-10 group"
                onClick={togglePlay}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  animate={{ scale: isPlaying ? 0 : 1, opacity: isPlaying ? 0 : 1 }}
                  transition={{ duration: 0.2 }}
                  className="size-20 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center shadow-xl hover:bg-white/40 transition-colors"
                >
                  <Play className="size-8 text-white ml-1" />
                </motion.div>
              </motion.button>

              {/* Bottom controls bar */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-12">
                {/* Progress bar */}
                <div className="w-full h-1 bg-white/20 rounded-full mb-3 cursor-pointer group/progress"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const percent = (x / rect.width) * 100;
                    setProgress(percent);
                  }}
                >
                  <motion.div
                    className="h-full bg-white rounded-full relative"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity shadow-lg" />
                  </motion.div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={prevScene}
                      className="text-white/70 hover:text-white transition-colors"
                    >
                      <ChevronLeft className="size-5" />
                    </button>
                    <button
                      onClick={togglePlay}
                      className="text-white hover:text-white/80 transition-colors"
                    >
                      {isPlaying ? (
                        <Pause className="size-5" />
                      ) : (
                        <Play className="size-5" />
                      )}
                    </button>
                    <button
                      onClick={nextScene}
                      className="text-white/70 hover:text-white transition-colors"
                    >
                      <ChevronRight className="size-5" />
                    </button>
                  </div>

                  {/* Scene indicators */}
                  <div className="flex items-center gap-2">
                    {scenes.map((s, i) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          setCurrentScene(i);
                          setProgress(0);
                        }}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          i === currentScene
                            ? 'bg-white w-6'
                            : 'bg-white/40 hover:bg-white/60'
                        }`}
                      />
                    ))}
                  </div>

                  <div className="text-white/60 text-xs">
                    {currentScene + 1} / {scenes.length}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Below Video */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-center mt-8"
          >
            <Button
              size="lg"
              className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg shadow-violet-500/25"
              asChild
            >
              <a href="#books">
                <BookOpen className="size-4 mr-2" />
                Start Reading Now
              </a>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
