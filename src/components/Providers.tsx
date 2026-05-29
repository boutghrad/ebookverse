'use client';

import { ThemeProvider } from 'next-themes';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from '@/components/ui/sonner';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';

export default function Providers({ children }: { children: React.ReactNode }) {
  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  // Only render PayPal provider if we have a valid client ID
  const paypalOptions = {
    clientId: paypalClientId || 'sb',
    currency: 'USD',
    intent: 'capture' as const,
  };

  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <PayPalScriptProvider options={paypalOptions} deferLoading={!paypalClientId}>
          {children}
        </PayPalScriptProvider>
        <Toaster richColors position="top-right" />
      </ThemeProvider>
    </SessionProvider>
  );
}
