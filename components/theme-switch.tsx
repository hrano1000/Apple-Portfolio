"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

const modes = ["system", "light", "dark"] as const;
const labels = { system: "System", light: "Light", dark: "Dark" };
type Mode = typeof modes[number];
const isMode = (value: string | undefined): value is Mode => modes.some(mode => mode === value);

export default function ThemeSwitch() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { if (mounted && theme && !isMode(theme)) setTheme("system"); }, [mounted, theme, setTheme]);
  const mode = mounted && isMode(theme) ? theme : "system";
  const next = modes[(modes.indexOf(mode) + 1) % modes.length];
  const label = `${labels[mode]} mode. Switch to ${labels[next]} mode`;

  return <button className="theme-switch" type="button" disabled={!mounted} onClick={() => setTheme(next)} aria-label={label} title={label} data-mode={mode}>
    <svg key={mode} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {mode === "system" ? <><rect x="3" y="4" width="18" height="13" rx="2.5" /><path d="M8 21h8M12 17v4" /></> : mode === "light" ? <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></> : <path d="M20.8 13.2A9 9 0 0 1 10.8 3.2a9 9 0 1 0 10 10Z" />}
    </svg>
    <span className="theme-label">{labels[mode]}</span>
  </button>;
}
