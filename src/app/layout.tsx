import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "ОСКІ Неврологія",
    template: "%s · ОСКІ Неврологія"
  },
  description:
    "Тимчасовий навчальний сайт для підготовки до ОСКІ та КРОК з неврології: станції, знімки, чеклисти, відповіді й тренувальні тести.",
  applicationName: "ОСКІ Неврологія",
  keywords: ["ОСКІ", "КРОК", "неврологія", "інтернатура", "чеклисти", "МРТ", "КТ", "тести"],
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
  colorScheme: "light"
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="uk">
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
