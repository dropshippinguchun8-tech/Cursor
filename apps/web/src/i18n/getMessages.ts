import { notFound } from "next/navigation";
import { Locale, locales } from "./locales";

export async function getMessages(locale: Locale) {
  if (!locales.includes(locale)) {
    notFound();
  }

  const messages = await import(`./messages/${locale}.json`);
  return messages.default;
}
