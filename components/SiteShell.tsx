"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import { AppShell, workspaceNav } from "@/components/AppShell";
import { useIsEmbed } from "@oceanleo/ui/lib";
import {
  LibrarySubNav,
  HistorySubNav,
  useWorkspaceNavLabels,
} from "@oceanleo/ui/shell";
import { useT } from "@oceanleo/ui/i18n";
import { useUser } from "@/lib/useUser";
import { getCredits, signOutEverywhere } from "@/lib/oceanleo-auth";

// LeoBizDev（外贸出海 AI 工作台）品牌色：青蓝 #0e7490（来自 globals.css --accent）。
const ACCENT = "#0e7490";
const SITE_ID = "bizdev";

function BrandLogo() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <circle cx="12" cy="12" r="9" strokeLinejoin="round" />
      <path d="M3 12h18M12 3c2.5 2.5 3.8 5.6 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.6-3.8-9S9.5 5.5 12 3z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// 文件库四分区在侧栏，主区受控 FileLibrary（跨站分区与 library 页一致）。
const LIBRARY_SITES = [
  { id: "chat", label: "LeoChat" },
  { id: "search", label: "LeoSearch" },
  { id: "word", label: "LeoDoc" },
];

// 2026-06-19 宗旨 + doctrine v7：侧边栏 + 四页（首页 / 工作台 / 文件库 / 历史记录）。
// 工作台**不再**在侧栏列功能区（具体 app）——功能选择搬到主区目录页（OperatorConsole
// directory 模式），打开后右上角「返回」回目录。文件库 / 历史记录仍保留覆盖式左栏子栏。
export function SiteShell({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const [credits, setCredits] = useState<number | null>(null);
  const navLabels = useWorkspaceNavLabels();
  const tNav = useT("nav");
  const NAV = useMemo(
    () =>
      workspaceNav({
        labels: navLabels,
        subNav: {
          library: { title: tNav("library"), render: () => <LibrarySubNav accent={ACCENT} /> },
          history: { title: tNav("history"), render: () => <HistorySubNav siteId={SITE_ID} accent={ACCENT} /> },
        },
      }),
    [navLabels, tNav],
  );
  // ?embed=1 时（主站工作台 iframe 内嵌）隐藏本站外壳，只渲染内容。
  const embed = useIsEmbed();

  useEffect(() => {
    getCredits().then((r) => {
      if (r.ok && r.data) setCredits(r.data.balance_yuan);
    });
  }, []);

  if (embed) {
    return <div className="min-h-dvh bg-stone-50">{children}</div>;
  }

  return (
    <AppShell
      brand={{ name: "LeoBizDev", accent: ACCENT, logo: <BrandLogo /> }}
      collapseKey="bizdev_sidebar_collapsed"
      modelCategories={["text", "image", "video", "threed", "audio"]}
      siteId={SITE_ID}
      nav={NAV}
      userEmail={user?.email}
      credits={credits}
      onSignOut={() => signOutEverywhere()}
    >
      {children}
    </AppShell>
  );
}

export { LIBRARY_SITES, ACCENT as SITE_ACCENT, SITE_ID };
