import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { ThemeProvider } from '@/presentation/components/layout/theme-provider';
import { LocaleProvider } from '@/presentation/components/layout/locale-provider';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Claude Token Dashboard',
    template: '%s · Claude Token Dashboard',
  },
  description:
    'Local-only analytics for Claude Code session token usage and cost. No data ever leaves your browser.',
  applicationName: 'Claude Token Dashboard',
  authors: [{ name: 'Strateji Bilişim' }],
  robots: { index: false, follow: false },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextIntlClientProvider locale={locale} messages={messages} timeZone="UTC">
            <LocaleProvider serverLocale={locale}>{children}</LocaleProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
