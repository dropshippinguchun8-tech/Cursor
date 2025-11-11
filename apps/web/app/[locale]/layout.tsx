import { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { ThemeProvider, ToastProvider } from "@cpamarket/ui";
import { getMessages } from "../../src/i18n/getMessages";
import { Locale, locales, defaultLocale } from "../../src/i18n/locales";
import "../globals.css";

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
            <ToastProvider>{children}</ToastProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
