import Link from "next/link";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@cpamarket/ui";
import { createTranslation } from "next-i18next/server";
import nextI18NextConfig from "../../next-i18next.config.mjs";

export const revalidate = 3600;

const featureCount = 3;
const faqCount = 2;

export default async function LandingPage({ params }: { params: { locale: string } }) {
  const { t } = await createTranslation(params.locale, "translation", nextI18NextConfig);
  const locales = nextI18NextConfig.i18n.locales;

  const features = Array.from({ length: featureCount }, (_, index) => ({
    title: t(`landing.features.items.${index}.title`),
    description: t(`landing.features.items.${index}.description`)
  }));

  const faqs = Array.from({ length: faqCount }, (_, index) => ({
    question: t(`landing.faq.items.${index}.question`),
    answer: t(`landing.faq.items.${index}.answer`)
  }));

  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-b from-slate-50 to-white">
      <header className="border-b bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
          <div className="text-xl font-bold text-slate-900">{t("common.brand")}</div>
          <nav className="flex items-center gap-4">
            <Link href={`/${params.locale}/auth/login`} className="text-sm text-slate-600 hover:text-slate-900">
              {t("common.login")}
            </Link>
            <Link href={`/${params.locale}/auth/register`}>
              <Button size="sm">{t("common.register")}</Button>
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto flex max-w-6xl flex-1 flex-col gap-16 px-4 py-16">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
              CPA • RBAC • i18n
            </span>
            <h1 className="text-4xl font-bold text-slate-900 sm:text-5xl">{t("landing.title")}</h1>
            <p className="text-lg text-slate-600">{t("landing.subtitle")}</p>
            <div className="flex flex-wrap gap-3">
              <Link href={`/${params.locale}/auth/register`}>
                <Button size="lg">{t("landing.ctaPrimary")}</Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline">
                  {t("landing.ctaSecondary")}
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-2 rounded-3xl bg-blue-200 blur-3xl opacity-50" />
            <div className="relative rounded-3xl border border-blue-100 bg-white p-8 shadow-xl">
              <h3 className="text-lg font-semibold text-slate-900">{t("common.dashboard")}</h3>
              <p className="mt-2 text-sm text-slate-500">{t("landing.features.items.0.description")}</p>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <Card className="border-dashed border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-sm text-blue-700">Admin KPIs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-500">Offers, anomaly alerts, audit log timeline</p>
                  </CardContent>
                </Card>
                <Card className="border-dashed border-indigo-200">
                  <CardHeader>
                    <CardTitle className="text-sm text-indigo-700">Affiliate Stats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-500">Clicks, approvals, EPC trends, tickets</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        <section id="features" className="space-y-6">
          <h2 className="text-2xl font-semibold text-slate-900">{t("landing.features.title")}</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="border border-slate-200">
                <CardHeader>
                  <CardTitle className="text-base font-semibold text-slate-900">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-slate-900">{t("landing.faq.title")}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {faqs.map((faq) => (
              <Card key={faq.question} className="border border-slate-200">
                <CardHeader>
                  <CardTitle className="text-base font-semibold text-slate-900">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </section>

      <footer className="border-t bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {new Date().getFullYear()} {t("common.brand")}. All rights reserved.
          </span>
          <div className="flex gap-3">
            {locales.map((locale) => (
              <Link key={locale} href={`/${locale}`} className="hover:text-slate-900">
                {locale.toUpperCase()}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </main>
  );
}
