import type { Metadata } from "next";
import ThemeProvider from "@/components/theme-provider";
import ScrollBoundary from "@/components/scroll-boundary";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hassan Ibrahim Rano — Software Engineer",
  description: "The personal portfolio of Hassan Ibrahim Rano, Software Engineer. Get in touch about your next project.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased"><ThemeProvider><ScrollBoundary />{children}</ThemeProvider></body>
    </html>
  );
}
