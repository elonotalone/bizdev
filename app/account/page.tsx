"use client";

export const dynamic = "force-dynamic";

import { AccountCenter } from "@/components/AccountCenter";

// 统一账户中心 —— 主内容由全家桶共享组件 AccountCenter 渲染（与主站
// oceanleo.com/account 完全对齐）。本站侧栏 SiteShell 已在 layout 全局包裹，
// 此处不再重复包裹，避免出现双侧栏。
export default function AccountPage() {
  return <AccountCenter />;
}
