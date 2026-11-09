"use client";

import { ThemeProvider as AppearanceProvider } from "next-themes";
import type { ReactNode } from "react";

export default function ThemeProvider({ children }: { children: ReactNode }) {
  return <AppearanceProvider attribute="data-theme" defaultTheme="system" enableSystem storageKey="hassan-portfolio-theme" disableTransitionOnChange>{children}</AppearanceProvider>;
}
