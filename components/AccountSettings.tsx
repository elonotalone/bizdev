"use client";

// ============================================================================
// OceanLeo 全家桶「设置」统一内容组件（不含侧栏 shell）
// ----------------------------------------------------------------------------
// 与主站 https://oceanleo.com/settings 对齐：个人资料 · 知识库 · 用量记录入口。
// 这份文件在所有 *.oceanleo.com 子站里逐字相同（纯拼接）。
//
// 2026-07-02：用量记录明细表迁到独立「Cost」页（/cost，柱状图 + 明细内滚），
// 本页只留入口；页头统一 PageHeader（标题居中 + 左返回键）。
//
// 零站点特有依赖：仅 react + lib/oceanleo-auth（全站都有）+ @oceanleo/ui/pages。
// ============================================================================

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { PageHeader } from "@oceanleo/ui/pages";
import { useUI } from "@oceanleo/ui/i18n";
import { browserClient, oceanleoConfigured } from "@/lib/oceanleo-auth";

export function AccountSettings() {
  const tt = useUI();
  const [user, setUser] = useState<User | null>(null);
  const [checked, setChecked] = useState(() => !oceanleoConfigured());

  useEffect(() => {
    const c = browserClient();
    if (!c) return;
    // SSO 修复（2026-07-01）：getSession() 读本地共享 cookie（自动续期），而非
    // getUser() 的网络校验——后者在跨子域场景下会误判为未登录。详见 AccountCenter。
    c.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setChecked(true);
    });
    const { data: sub } = c.auth.onAuthStateChange((_e, s) =>
      setUser(s?.user ?? null),
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!oceanleoConfigured()) {
    return (
      <div className="px-8 py-6">
        <PageHeader title={tt("设置")} />
        <div className="mx-auto mt-10 max-w-md rounded-xl border border-amber-200 bg-amber-50 p-6 text-center text-[13px] text-amber-800">
          {tt("登录服务尚未配置（缺少 Supabase 环境变量）。")}
        </div>
      </div>
    );
  }

  if (checked && !user) {
    return (
      <div className="px-8 py-6">
        <PageHeader title={tt("设置")} />
        <div className="v-fade-up mx-auto mt-10 max-w-xl rounded-2xl border border-neutral-200 bg-white p-8 text-center text-[14px] text-neutral-600">
          {tt("请先登录后再管理账户设置。")}
        </div>
      </div>
    );
  }

  return (
    <div className="px-8 py-6">
      <PageHeader title={tt("设置")} />

      <div className="mx-auto mt-8 max-w-xl space-y-8">
        <section className="v-fade-up">
          <h2 className="mb-3 text-[14px] font-semibold text-neutral-900">{tt("个人资料")}</h2>
          <div className="divide-y divide-neutral-100 rounded-xl border border-neutral-200">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-[13px] text-neutral-700">{tt("邮箱")}</span>
              <span className="text-[13px] text-neutral-900">{user?.email || "—"}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-[13px] text-neutral-700">{tt("语言")}</span>
              <span className="text-[13px] text-neutral-900">{tt("中文（简体）")}</span>
            </div>
          </div>
        </section>

        <section className="v-fade-up" style={{ animationDelay: "60ms" }}>
          <h2 className="mb-3 text-[14px] font-semibold text-neutral-900">{tt("知识库")}</h2>
          <div className="rounded-xl border border-neutral-200 p-5">
            <p className="text-[12px] leading-relaxed text-neutral-500">
              {tt("在 OceanLeo 主站可添加跨任务记忆的偏好与背景信息，所有 AI 应用共享。")}
            </p>
            <a
              href="https://oceanleo.com/settings"
              className="mt-3 inline-block rounded-lg border border-neutral-200 px-3 py-1.5 text-[13px] text-neutral-700 transition hover:bg-neutral-50"
            >
              {tt("前往主站管理知识库 →")}
            </a>
          </div>
        </section>

        {/* 用量记录 2026-07-02 起独立成「Cost」页（设置 / AI 模型均不再内嵌明细）。 */}
        <section className="v-fade-up" style={{ animationDelay: "120ms" }}>
          <h2 className="mb-1 text-[14px] font-semibold text-neutral-900">{tt("用量记录与计费")}</h2>
          <p className="mb-3 text-[12px] leading-relaxed text-neutral-500">
            {tt("用量柱状图与每次调用的真实计费记录（模型 / token / 费用，OceanLeo 不加价）在「Cost」页；token 余额与模型选择在「AI 模型」页。")}
          </p>
          <div className="flex gap-2">
            <a
              href="/cost"
              className="inline-flex items-center rounded-lg bg-neutral-900 px-4 py-2 text-[13px] font-medium text-white transition hover:bg-neutral-800"
            >
              {tt("前往 Cost 页 →")}
            </a>
            <a
              href="/api"
              className="inline-flex items-center rounded-lg border border-neutral-200 px-4 py-2 text-[13px] font-medium text-neutral-700 transition hover:bg-neutral-50"
            >
              {tt("前往 AI 模型页 →")}
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
