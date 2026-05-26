'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
        setErrorMessage(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setErrorMessage('Network error. Please try again.');
    }
  };

  return (
    <section className="py-20 lg:py-28 relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 -z-10" />
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
      </div>

      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-white/10 backdrop-blur-sm mb-6">
            <Mail className="size-7 text-white" />
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Stay Updated
          </h2>
          <p className="mt-4 text-violet-100 text-lg max-w-lg mx-auto">
            Get the latest book releases, exclusive deals, and reading recommendations
            delivered to your inbox weekly.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status === 'error') setStatus('idle');
              }}
              required
              className="flex-1 bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-violet-200 focus:border-white/40 focus:ring-white/20"
            />
            <Button
              type="submit"
              disabled={status === 'loading'}
              className="bg-white text-violet-700 hover:bg-violet-50 shadow-lg font-semibold"
            >
              {status === 'loading' ? (
                <div className="size-4 border-2 border-violet-700/30 border-t-violet-700 rounded-full animate-spin" />
              ) : (
                <>
                  Subscribe
                  <ArrowRight className="size-4 ml-1" />
                </>
              )}
            </Button>
          </form>

          {/* Status Messages */}
          {status === 'success' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-center justify-center gap-2 text-sm text-green-200"
            >
              <CheckCircle className="size-4" />
              Successfully subscribed! Check your inbox.
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-center justify-center gap-2 text-sm text-red-200"
            >
              <AlertCircle className="size-4" />
              {errorMessage}
            </motion.div>
          )}

          <p className="mt-4 text-xs text-violet-200/70">
            No spam, ever. Unsubscribe at any time. Read our{' '}
            <a href="#privacy" className="underline hover:text-white transition-colors">
              Privacy Policy
            </a>
            .
          </p>
        </motion.div>
      </div>
    </section>
  );
}
