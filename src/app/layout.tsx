import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import ChatbotWidget from "@/components/chatbot/ChatbotWidget";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EbookVerse - Discover Your Next Great Read",
  description:
    "Access thousands of premium eBooks across every genre. From bestsellers to hidden gems, find the perfect book for your next adventure. AI-powered recommendations, instant downloads, and secure payments.",
  keywords: [
    "eBooks",
    "digital books",
    "online bookstore",
    "ebook store",
    "buy ebooks",
    "download books",
    "reading",
    "ebookverse",
  ],
  authors: [{ name: "EbookVerse" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "EbookVerse - Discover Your Next Great Read",
    description:
      "Access thousands of premium eBooks across every genre. AI-powered recommendations, instant downloads, and secure payments.",
    siteName: "EbookVerse",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "EbookVerse - Discover Your Next Great Read",
    description:
      "Access thousands of premium eBooks across every genre. AI-powered recommendations, instant downloads, and secure payments.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
          <ChatbotWidget />
        </Providers>
      </body>
    </html>
  );
}
