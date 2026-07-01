import type { Metadata, Viewport } from "next";
import "./globals.css";
import "@oceanleo/ui/theme/ui.css";
import { LeoAssistant, EmbedChrome } from "@oceanleo/ui/shell";
import { SiteShell } from "@/components/SiteShell";
import { I18nProvider } from "@oceanleo/ui/i18n";
import { getLocale, getMessages, normalizeLocale, htmlLang, localeDir } from "@oceanleo/ui/i18n/server";
import { ThemeScript, ThemeProvider } from "@oceanleo/ui/theme";
import { getThemeClass } from "@oceanleo/ui/theme/server";


export const dynamic = "force-dynamic";
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

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = normalizeLocale(await getLocale());
  const messages = await getMessages();
  const { htmlClass } = await getThemeClass();

  return (
    <html lang={htmlLang(locale)} dir={localeDir(locale)} className={htmlClass} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="antialiased">
        <ThemeProvider>
          <I18nProvider locale={locale} messages={messages}>
        <EmbedChrome />
        <SiteShell>{children}</SiteShell>
        <LeoAssistant siteId="bizdev" docType="doc" />
                </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
