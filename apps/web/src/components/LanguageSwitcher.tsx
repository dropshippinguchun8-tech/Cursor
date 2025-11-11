 "use client";

import { useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { locales } from "../i18n/locales";

export function LanguageSwitcher({ locale }: { locale: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleChange = (nextLocale: string) => {
    if (nextLocale === locale) {
      return;
    }

    startTransition(() => {
      const segments = pathname.split("/").filter(Boolean);
      segments[0] = nextLocale;
      const nextPath = `/${segments.join("/")}`;
      document.cookie = `lang=${nextLocale}; path=/; max-age=${60 * 60 * 24 * 365}`;
      router.push(nextPath);
    });
  };

  return (
    <select
      className="rounded-md border border-slate-200 bg-white px-2 py-1 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
      value={locale}
      onChange={(event) => handleChange(event.target.value)}
      disabled={isPending}
    >
      {locales.map((lng) => (
        <option key={lng} value={lng}>
          {lng.toUpperCase()}
        </option>
      ))}
    </select>
  );
}
