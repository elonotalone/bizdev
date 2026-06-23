import type { Metadata, Viewport } from "next";
import "./globals.css";
import "@oceanleo/ui/theme/ui.css";
import { LeoAssistant, EmbedChrome } from "@oceanleo/ui/shell";
import { SiteShell } from "@/components/SiteShell";

export const metadata: Metadata = {
  title: "LeoBizDev — 外贸 · 出海 AI 工作台 | bizdev.oceanleo.com",
  description:
    "外贸/出海 AI 工作台：智能回复客户邮件、公司调研、竞品分析、外贸开发信撰写、外贸翻译与本地化，全部走 OceanLeo 统一网关，按量计费。",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#fafaf9",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        <EmbedChrome />
        <SiteShell>{children}</SiteShell>
        <LeoAssistant siteId="bizdev" docType="doc" />
      </body>
    </html>
  );
}
