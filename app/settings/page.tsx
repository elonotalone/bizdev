"use client";

export const dynamic = "force-dynamic";

import { AccountSettings } from "@/components/AccountSettings";

// 统一账户设置 —— 主内容由全家桶共享组件 AccountSettings 渲染（与主站
// oceanleo.com/settings 对齐）。本站侧栏 SiteShell 已在 layout 全局包裹，
// 此处不再重复包裹，避免出现双侧栏。
export default function SettingsPage() {
  return <AccountSettings />;
}
