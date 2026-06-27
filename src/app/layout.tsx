import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import Script from "next/script";

import { ThemeToggle } from "@/components/ThemeToggle";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "ОСКІ Неврологія",
    template: "%s · ОСКІ Неврологія"
  },
  description:
    "Тимчасовий навчальний сайт для підготовки до ОСКІ, КРОК і держіспиту з неврології: станції, знімки, чеклисти, конспект, тести та білети.",
  applicationName: "ОСКІ Неврологія",
  keywords: [
    "ОСКІ",
    "КРОК",
    "неврологія",
    "інтернатура",
    "чеклисти",
    "конспект",
    "білети",
    "держіспит",
    "МРТ",
    "КТ",
    "тести"
  ],
  icons: {
    icon: [
      { url: "/metadata/favicon.ico", sizes: "32x32 48x48", type: "image/x-icon" },
      { url: "/metadata/icon1.png", sizes: "96x96", type: "image/png" }
    ],
    apple: [{ url: "/metadata/apple-icon.png", sizes: "180x180", type: "image/png" }],
    other: [
      {
        rel: "icon",
        url: "/metadata/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png"
      },
      {
        rel: "icon",
        url: "/metadata/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png"
      }
    ]
  }
};

export const viewport: Viewport = {
  themeColor: "#f5c84b",
  colorScheme: "light dark"
};

const themeBootScript = `
(() => {
  try {
    const storedTheme = window.localStorage.getItem("osceThemeV1");
    document.documentElement.dataset.theme = storedTheme === "dark" ? "dark" : "light";
  } catch {
    document.documentElement.dataset.theme = "light";
  }
})();
`;

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html data-theme="light" lang="uk" suppressHydrationWarning>
      <body className="bg-clinical-bg font-sans text-clinical-text antialiased">
        <Script id="theme-boot" strategy="beforeInteractive">
          {themeBootScript}
        </Script>
        <div
          aria-hidden="true"
          className="site-page-background pointer-events-none fixed inset-0 -z-10"
        />
        {children}
        <ThemeToggle />
      </body>
    </html>
  );
}
