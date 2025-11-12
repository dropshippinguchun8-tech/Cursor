import { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { ThemeProvider, ToastProvider } from "@cpamarket/ui";
import { getMessages } from "../../src/i18n/getMessages";
import { Locale, locales, defaultLocale } from "../../src/i18n/locales";
import "../globals.css";
import Link from "next/link";
import { LanguageSwitcher } from "../../src/components/LanguageSwitcher";

type Props = {
  children: ReactNode;
  params: { locale: Locale };
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const locale = params.locale ?? defaultLocale;
  const messages = await getMessages(locale);

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <ThemeProvider attribute="class">
          <NextIntlClientProvider locale={locale} messages={messages}>
            <ToastProvider>
              <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
                  <Link href={`/${locale}`} className="text-lg font-semibold text-blue-600">
                    CPAMaRKeT.Uz
                  </Link>
                  <div className="flex items-center gap-4">
                    <Link href={`/${locale}/dashboard`} className="text-sm text-slate-600 hover:text-slate-900">
                      Dashboard
                    </Link>
                    <Link href={`/${locale}/auth/login`} className="text-sm text-slate-600 hover:text-slate-900">
                      Login
                    </Link>
                    <LanguageSwitcher locale={locale} />
                  </div>
                </div>
              </header>
              <main className="min-h-[calc(100vh-64px)] bg-slate-50">{children}</main>
            </ToastProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
