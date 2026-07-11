"use client";

export const dynamic = "force-dynamic";

import { AccountApi } from "@/components/AccountApi";

// 统一 API 页 —— 模型选择 + 供应商成本价（OceanLeo 不加价）+ token 余额，主内容由
// 全家桶共享组件 AccountApi 渲染（与主站 oceanleo.com/api 完全对齐）。
// 本站侧栏 SiteShell 已在 layout 全局包裹，此处不再重复包裹，避免出现双侧栏。
export default function ApiPage() {
  return <AccountApi />;
}
