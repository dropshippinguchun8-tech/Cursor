import { getTranslations } from "next-intl/server";

export default async function VerifyEmailPage({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: "auth" });

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-16">
      <div className="max-w-lg rounded-xl border border-slate-200 bg-white p-10 text-center shadow-lg">
        <h1 className="text-3xl font-semibold text-slate-900">{t("registerTitle")}</h1>
        <p className="mt-4 text-sm text-slate-600">{t("verifyMessage")}</p>
      </div>
    </div>
  );
}
