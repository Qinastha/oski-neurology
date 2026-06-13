import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "ОСКИ Неврология",
    template: "%s · ОСКИ Неврология"
  },
  description:
    "Временный учебный сайт для подготовки к ОСКИ и КРОК по неврологии: станции, снимки, чеклисты, ответы и тренувальні тести.",
  applicationName: "ОСКИ Неврология",
  keywords: ["ОСКИ", "КРОК", "неврология", "интернатура", "чеклисты", "МРТ", "КТ", "тести"]
};

export const viewport: Viewport = {
  themeColor: "#f5c84b",
  colorScheme: "light"
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ru">
      <body className="bg-clinical-bg font-sans text-clinical-text antialiased">
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(135deg,rgba(255,244,191,0.72),transparent_34%),radial-gradient(circle_at_top_right,rgba(244,197,63,0.18),transparent_26%),#fffdf7]"
        />
        {children}
      </body>
    </html>
  );
}
