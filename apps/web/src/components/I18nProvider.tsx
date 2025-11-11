 "use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import i18next, { i18n as I18nInstance, Resource } from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";

type Props = {
  locale: string;
  resources: Resource;
  children: ReactNode;
};

export function I18nProvider({ locale, resources, children }: Props) {
  const [instance] = useState<I18nInstance>(() => i18next.createInstance());

  const memoizedResources = useMemo(() => resources, [resources]);

  useEffect(() => {
    instance.use(initReactI18next).init({
      lng: locale,
      fallbackLng: "uz",
      resources: memoizedResources,
      interpolation: { escapeValue: false },
      defaultNS: "translation"
    });
  }, [instance, locale, memoizedResources]);

  return <I18nextProvider i18n={instance}>{children}</I18nextProvider>;
}
