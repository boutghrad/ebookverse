'use client';

import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'How do I purchase an eBook?',
    answer:
      'Simply browse our library, find a book you like, and click "Add to Cart". Once you are ready, proceed to checkout where you can pay securely with your preferred payment method. After payment, you will receive an instant download link.',
  },
  {
    question: 'Can I read on multiple devices?',
    answer:
      'Yes! Your purchased eBooks are available on all your devices. Simply log in to your EbookVerse account on any device, and your entire library with reading progress will be synced automatically across all platforms.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major credit cards (Visa, Mastercard, American Express), debit cards, PayPal, Apple Pay, and Google Pay. All transactions are processed securely through Stripe.',
  },
  {
    question: 'Can I get a refund?',
    answer:
      'Yes, we offer a 30-day money-back guarantee on all eBook purchases. If you are not satisfied with your purchase, simply contact our support team and we will process a full refund, no questions asked.',
  },
  {
    question: 'How do AI recommendations work?',
    answer:
      'Our AI analyzes your reading history, preferences, and browsing patterns to suggest books you will love. The more you read and interact with the platform, the better our recommendations become. You can also fine-tune preferences in your profile settings.',
  },
  {
    question: 'Do you offer free eBooks?',
    answer:
      'Yes! We have a curated selection of free eBooks available in our library. You can find them by filtering for "Free" in the price section, or check out our "Free Reads" collection updated weekly with new titles.',
  },
];

export default function FAQ() {
  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="text-sm font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider">
            FAQ
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">
            Frequently Asked{' '}
            <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Questions
            </span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Find answers to common questions about EbookVerse. Can not find what you are looking for?
            Contact our support team.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-sm sm:text-base font-medium hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
