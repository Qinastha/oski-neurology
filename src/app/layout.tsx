import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "ОСКИ Неврология",
    template: "%s · ОСКИ Неврология"
  },
  description:
    "Временный учебный сайт для подготовки к практическим станциям ОСКИ по неврологии: задачи, снимки, чеклисты и ответы.",
  applicationName: "ОСКИ Неврология",
  keywords: ["ОСКИ", "неврология", "интернатура", "чеклисты", "МРТ", "КТ"]
};

export const viewport: Viewport = {
  themeColor: "#f5c84b",
  colorScheme: "light"
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
