import type { Metadata, Viewport } from "next";
import { siteUrl } from "@/lib/env";
import "@fontsource/be-vietnam-pro/400.css";
import "@fontsource/be-vietnam-pro/500.css";
import "@fontsource/be-vietnam-pro/600.css";
import "@fontsource/be-vietnam-pro/700.css";
import "@fontsource/be-vietnam-pro/800.css";
import "./globals.css";
import "./visual.css";
import "./courses.css";
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: "VocaFlow — Học ngôn ngữ, mở cơ hội", template: "%s | VocaFlow" },
  description:
    "Học tiếng Anh, tiếng Hàn và tiếng Trung cùng VocaFlow. Khám phá từ vựng và bài tập theo chủ đề TOPIK, IELTS và HSK.",
  icons: { icon: "/icon.svg" },
};
export const viewport: Viewport = { themeColor: "#5951dc", width: "device-width", initialScale: 1 };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" data-scroll-behavior="smooth">
      <body>
        <a
          className="sr-only focus:not-sr-only focus:fixed focus:z-50 focus:bg-white focus:p-3"
          href="#main"
        >
          Chuyển đến nội dung
        </a>
        {children}
      </body>
    </html>
  );
}
