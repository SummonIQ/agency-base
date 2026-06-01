import './globals.css';

import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import { Suspense } from 'react';

import { DevBar } from '@/components/dev/dev-bar';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { OnboardingProvider } from '@/components/onboarding/onboarding-context';
import { OnboardingModal } from '@/components/onboarding/onboarding-modal';
import { Toaster } from 'sonner';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      className={`${GeistSans.variable} ${GeistMono.variable} size-full`}
      lang="en"
      suppressHydrationWarning
    >
      <head>
        {/* <script async src="https://unpkg.com/react-scan/dist/auto.global.js" /> */}
      </head>
      <body
        className="xs:bg-background h-full flex-col antialiased md:bg-sidebar"
      >
        <Suspense fallback={children}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <OnboardingProvider>
              <div className="flex h-full flex-col">{children}</div>
              <OnboardingModal />
              {process.env.NODE_ENV === 'development' ? <DevBar /> : null}
              <Toaster richColors position="top-right" />
            </OnboardingProvider>
          </ThemeProvider>
        </Suspense>

        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
