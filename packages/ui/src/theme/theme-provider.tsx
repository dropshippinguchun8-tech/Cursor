'use client';

import * as React from "react";
import { ThemeProvider as NextThemeProvider } from "next-themes";

export const ThemeProvider: React.FC<React.PropsWithChildren<{ attribute?: string }>> = ({
  children,
  attribute = "class"
}) => {
  return (
    <NextThemeProvider attribute={attribute} defaultTheme="system" enableSystem>
      {children}
    </NextThemeProvider>
  );
};
