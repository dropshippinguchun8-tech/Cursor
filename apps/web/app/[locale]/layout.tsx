import { ReactNode } from "react";
import { createTranslation } from "next-i18next/server";
import { ThemeProvider, ToastProvider } from "@cpamarket/ui";
import Link from "next/link";
import { LanguageSwitcher } from "../../src/components/LanguageSwitcher";
import { I18nProvider } from "../../src/components/I18nProvider";
import nextI18NextConfig from "../../next-i18next.config.mjs";
import "../globals.css";

type Props = {
  children: ReactNode;
  params: { locale: string };
};

const { locales, defaultLocale } = nextI18NextConfig.i18n;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const locale = params.locale ?? defaultLocale;
  const { i18n } = await createTranslation(locale, "translation", nextI18NextConfig);
  const localeResources = i18n.services.resourceStore.data[locale] ?? {
    translation: {}
  };
  const resources = { [locale]: localeResources };
  const direction = i18n.dir ? i18n.dir(locale) : "ltr";

  return (
    <html lang={locale} dir={direction} suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <ThemeProvider attribute="class">
          <I18nProvider locale={locale} resources={resources}>
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
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
