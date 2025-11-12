 "use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import nextI18NextConfig from "../../next-i18next.config.mjs";

const locales = nextI18NextConfig.i18n.locales;

const localeLabels: Record<string, string> = {
  uz: "🇺🇿",
  ru: "🇷🇺",
  en: "🇬🇧"
};

export function LanguageSwitcher({ locale }: { locale: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [selectedLocale, setSelectedLocale] = useState(locale);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem("cpamarket-lang") : null;
    if (stored && locales.includes(stored)) {
      setSelectedLocale(stored);
    } else {
      setSelectedLocale(locale);
    }
  }, [locale]);

  const handleChange = (nextLocale: string) => {
    if (nextLocale === locale) {
      return;
    }

    startTransition(() => {
      const segments = pathname.split("/").filter(Boolean);
      segments[0] = nextLocale;
      const nextPath = `/${segments.join("/")}`;
      window.localStorage.setItem("cpamarket-lang", nextLocale);
      router.push(nextPath);
    });

    setSelectedLocale(nextLocale);
  };

  return (
    <select
      className="rounded-md border border-slate-200 bg-white px-2 py-1 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
      value={selectedLocale}
      onChange={(event) => handleChange(event.target.value)}
      disabled={isPending}
    >
      {locales.map((lng) => (
        <option key={lng} value={lng}>
          {localeLabels[lng] ?? lng.toUpperCase()}
        </option>
      ))}
    </select>
  );
}
