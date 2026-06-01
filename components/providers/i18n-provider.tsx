'use client';

import { NextIntlClientProvider } from 'next-intl';
import { ReactNode } from 'react';

interface I18nProviderProps {
  messages: Record<string, any>;
  locale: string;
  children: ReactNode;
}

/**
 * Client-side wrapper for NextIntlClientProvider to provide translations to client components
 */
export function I18nProvider({ messages, locale, children }: I18nProviderProps) {
  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      {children}
    </NextIntlClientProvider>
  );
}
