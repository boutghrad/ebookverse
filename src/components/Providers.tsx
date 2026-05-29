'use client';

import { ThemeProvider } from 'next-themes';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from '@/components/ui/sonner';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';

export default function Providers({ children }: { children: React.ReactNode }) {
  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <PayPalScriptProvider
          options={{
            clientId: paypalClientId || 'sb',
            currency: 'USD',
            intent: 'capture',
          }}
        >
          {children}
        </PayPalScriptProvider>
        <Toaster richColors position="top-right" />
      </ThemeProvider>
    </SessionProvider>
  );
}
