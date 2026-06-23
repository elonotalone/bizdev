"use client";

export const dynamic = "force-dynamic";

import { SiteShell } from "@/components/SiteShell";
import { AccountApi } from "@/components/AccountApi";

// 统一 API 页 —— 模型选择 + 标价（含 30% 服务费）+ token 余额，主内容由
// 全家桶共享组件 AccountApi 渲染（与主站 oceanleo.com/api 完全对齐）。
export default function ApiPage() {
  return (
    <SiteShell>
      <AccountApi />
    </SiteShell>
  );
}
