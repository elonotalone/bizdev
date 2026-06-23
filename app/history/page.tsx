"use client";

import { HistoryDetail } from "@oceanleo/ui/shell";
import { SITE_ACCENT, SITE_ID } from "@/components/SiteShell";

// resume.oceanleo.com —— 「历史记录」（doctrine v4 master-detail）。会话列表在侧栏，
// 主区回看选中会话。本站 SiteShell 在根 layout 已包裹。

export default function History() {
  return <HistoryDetail siteId={SITE_ID} accent={SITE_ACCENT} />;
}
