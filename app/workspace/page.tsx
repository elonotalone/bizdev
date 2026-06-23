import { Suspense } from "react";
import type { Metadata } from "next";
import ConsoleClient from "@/components/console/ConsoleClient";

export const metadata: Metadata = {
  title: "外贸工作台 — LeoBizDev · 智能回复 · 公司调研 · 竞品分析 · 开发信 · 外贸翻译 | bizdev.oceanleo.com",
  description:
    "工作台：智能回复 / 公司调研 / 竞品分析 / 开发信 / 外贸翻译，顶部功能按键一键切换，每个功能区都有专属 agent。",
};

// 「工作台」（2026-06-19 宗旨 + doctrine v3/v4）。首页 `/` 是对话型 agent；
// 业务路由 /reply /research /competition /dev-letter /trade-talk 301 到
// /workspace?fn=<id>（见 next.config.ts）。
export default function WorkspacePage() {
  return (
    <Suspense>
      <ConsoleClient />
    </Suspense>
  );
}
