"use client";

export const dynamic = "force-dynamic";

import { GeneralPage } from "@oceanleo/ui/pages";

// 统一通用（外观：语言 + 主题）页 —— 内容来自 @oceanleo/ui 的 GeneralPage。
// oceanleo.com/account 完全对齐）。本站侧栏 SiteShell 已在 layout 全局包裹，
// 此处不再重复包裹，避免出现双侧栏。
export default function GeneralPageRoute() {
  return <GeneralPage />;
}
