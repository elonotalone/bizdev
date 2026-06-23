"use client";

import { ReactNode, useEffect, useState } from "react";
import { AppShell, workspaceNav } from "@/components/AppShell";
import { useIsEmbed } from "@oceanleo/ui/lib";
import {
  ConsoleFnSubNav,
  LibrarySubNav,
  HistorySubNav,
  type ConsoleFnItem,
} from "@oceanleo/ui/shell";
import { useUser } from "@/lib/useUser";
import { getCredits, signOutEverywhere } from "@/lib/oceanleo-auth";
import {
  IconReply,
  IconResearch,
  IconCompetition,
  IconLetter,
  IconTranslate,
} from "@/components/console/icons";

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

// doctrine v4：工作台功能区（与 console/ConsoleClient.tsx 的 functions 1:1），列到侧栏子栏。
const WORKSPACE_FNS: ConsoleFnItem[] = [
  { id: "reply", label: "智能回复", icon: <IconReply />, agentId: "bizdev.reply" },
  { id: "research", label: "公司调研", icon: <IconResearch />, agentId: "bizdev.research" },
  { id: "competition", label: "竞品分析", icon: <IconCompetition />, agentId: "bizdev.competition" },
  { id: "dev-letter", label: "开发信", icon: <IconLetter />, agentId: "bizdev.dev-letter" },
  { id: "trade-talk", label: "外贸翻译", icon: <IconTranslate />, agentId: "bizdev.trade-talk" },
];

// 文件库四分区在侧栏，主区受控 FileLibrary（跨站分区与 library 页一致）。
const LIBRARY_SITES = [
  { id: "chat", label: "LeoChat" },
  { id: "search", label: "LeoSearch" },
  { id: "word", label: "LeoDoc" },
];

// 2026-06-19 宗旨 + doctrine v4：侧边栏 + 四页（首页 / 工作台 / 文件库 / 历史记录）。
const NAV = workspaceNav({
  subNav: {
    workspace: { title: "工作台", render: () => <ConsoleFnSubNav functions={WORKSPACE_FNS} accent={ACCENT} /> },
    library: { title: "文件库", render: () => <LibrarySubNav accent={ACCENT} /> },
    history: { title: "历史记录", render: () => <HistorySubNav siteId={SITE_ID} accent={ACCENT} /> },
  },
});

export function SiteShell({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const [credits, setCredits] = useState<number | null>(null);
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
      modelCategories={["text"]}
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
