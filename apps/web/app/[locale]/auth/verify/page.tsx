import { createTranslation } from "next-i18next/server";
import nextI18NextConfig from "../../../next-i18next.config.mjs";

export default async function VerifyEmailPage({ params }: { params: { locale: string } }) {
  const { t } = await createTranslation(params.locale, "translation", nextI18NextConfig);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-16">
      <div className="max-w-lg rounded-xl border border-slate-200 bg-white p-10 text-center shadow-lg">
        <h1 className="text-3xl font-semibold text-slate-900">{t("auth.registerTitle")}</h1>
        <p className="mt-4 text-sm text-slate-600">{t("auth.verifyMessage", { defaultValue: "Check your email to verify your account." })}</p>
      </div>
    </div>
  );
}
