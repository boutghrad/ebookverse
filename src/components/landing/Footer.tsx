'use client';

import Link from 'next/link';
import { BookOpen, Twitter, Github, Linkedin, Mail } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const quickLinks = [
  { href: '#home', label: 'Home' },
  { href: '#books', label: 'Books' },
  { href: '#categories', label: 'Categories' },
  { href: '#about', label: 'About' },
];

const legalLinks = [
  { href: '#terms', label: 'Terms of Service' },
  { href: '#privacy', label: 'Privacy Policy' },
  { href: '#refund', label: 'Refund Policy' },
];

const supportLinks = [
  { href: '#help', label: 'Help Center' },
  { href: '#contact', label: 'Contact Us' },
  { href: '#faq', label: 'FAQ' },
];

const socialLinks = [
  { href: '#twitter', icon: Twitter, label: 'Twitter' },
  { href: '#github', icon: Github, label: 'GitHub' },
  { href: '#linkedin', icon: Linkedin, label: 'LinkedIn' },
  { href: 'mailto:hello@ebookverse.com', icon: Mail, label: 'Email' },
];

export default function Footer() {
  return (
    <footer className="bg-muted/40 border-t">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <div className="flex items-center justify-center size-9 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 shadow-md">
                <BookOpen className="size-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                EbookVerse
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              Your ultimate destination for premium eBooks. Discover, purchase, and read
              thousands of titles across every genre.
            </p>
            <div className="flex items-center gap-3 mt-6">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="inline-flex items-center justify-center size-9 rounded-lg border bg-card hover:bg-accent transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="size-4 text-muted-foreground" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-sm mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-sm mb-4">Legal</h3>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-sm mb-4">Support</h3>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} EbookVerse. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Made with love for book lovers everywhere.
          </p>
        </div>
      </div>
    </footer>
  );
}
