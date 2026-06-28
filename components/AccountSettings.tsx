"use client";

// ============================================================================
// OceanLeo 全家桶「设置」统一内容组件（不含侧栏 shell）
// ----------------------------------------------------------------------------
// 与主站 https://oceanleo.com/settings 对齐：个人资料 · 知识库 · 用量记录。
// 这份文件在所有 *.oceanleo.com 子站里逐字相同（纯拼接）。
//
// 2026-06-14：移除「BYOK 自带密钥」板块——OceanLeo 不再让用户上传自己的
// API key（海量用户密钥托管是不必要的安全风险）。所有请求统一走 OceanLeo
// 的阿里云百炼平台 key，用户充值 token 余额（人民币）按量消费。模型选择 +
// 标价改到「账户 → API」页（AccountApi.tsx）。用量以 token 量 + 对应费用(¥)
// 展示，不再有「积分」概念。
//
// 零站点特有依赖：仅 react + lib/oceanleo-auth（全站都有）。
// ============================================================================

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import {
  browserClient,
  oceanleoConfigured,
  getCreditHistory,
  type CreditEvent,
} from "@/lib/oceanleo-auth";

function metaNum(ev: CreditEvent, key: string): number {
  const m = ev?.meta as Record<string, unknown> | undefined;
  return Number((m?.[key] as number | undefined) ?? 0);
}

function eventModel(ev: CreditEvent): string {
  const m = ev?.meta as { model?: string } | undefined;
  return String(m?.model || "");
}

export function AccountSettings() {
  const [user, setUser] = useState<User | null>(null);
  const [checked, setChecked] = useState(false);
  const [history, setHistory] = useState<CreditEvent[]>([]);

  useEffect(() => {
    const c = browserClient();
    if (!c) {
      setChecked(true);
      return;
    }
    c.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      setChecked(true);
    });
    const { data: sub } = c.auth.onAuthStateChange((_e, s) =>
      setUser(s?.user ?? null),
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    getCreditHistory(50).then((r) => {
      setHistory(r.ok && r.data && Array.isArray(r.data.events) ? r.data.events : []);
    });
  }, [user]);

  if (!oceanleoConfigured()) {
    return (
      <div className="px-8 py-6">
        <h1 className="text-[22px] font-semibold tracking-tight text-neutral-900">
          设置
        </h1>
        <div className="mx-auto mt-10 max-w-md rounded-xl border border-amber-200 bg-amber-50 p-6 text-center text-[13px] text-amber-800">
          登录服务尚未配置（缺少 Supabase 环境变量）。
        </div>
      </div>
    );
  }

  if (checked && !user) {
    return (
      <div className="px-8 py-6">
        <h1 className="text-[22px] font-semibold tracking-tight text-neutral-900">
          设置
        </h1>
        <div className="v-fade-up mx-auto mt-10 max-w-xl rounded-2xl border border-neutral-200 bg-white p-8 text-center text-[14px] text-neutral-600">
          请先登录后再管理账户设置。
        </div>
      </div>
    );
  }

  return (
    <div className="px-8 py-6">
      <h1 className="text-[22px] font-semibold tracking-tight text-neutral-900">
        设置
      </h1>

      <div className="mx-auto mt-8 max-w-xl space-y-8">
        <section className="v-fade-up">
          <h2 className="mb-3 text-[14px] font-semibold text-neutral-900">个人资料</h2>
          <div className="divide-y divide-neutral-100 rounded-xl border border-neutral-200">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-[13px] text-neutral-700">邮箱</span>
              <span className="text-[13px] text-neutral-900">{user?.email || "—"}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-[13px] text-neutral-700">语言</span>
              <span className="text-[13px] text-neutral-900">中文（简体）</span>
            </div>
          </div>
        </section>

        <section className="v-fade-up" style={{ animationDelay: "60ms" }}>
          <h2 className="mb-3 text-[14px] font-semibold text-neutral-900">知识库</h2>
          <div className="rounded-xl border border-neutral-200 p-5">
            <p className="text-[12px] leading-relaxed text-neutral-500">
              在 OceanLeo 主站可添加跨任务记忆的偏好与背景信息，所有 AI 应用共享。
            </p>
            <a
              href="https://oceanleo.com/settings"
              className="mt-3 inline-block rounded-lg border border-neutral-200 px-3 py-1.5 text-[13px] text-neutral-700 transition hover:bg-neutral-50"
            >
              前往主站管理知识库 →
            </a>
          </div>
        </section>

        <section className="v-fade-up" style={{ animationDelay: "120ms" }}>
          <h2 className="mb-1 text-[14px] font-semibold text-neutral-900">用量记录</h2>
          <p className="mb-3 text-[12px] text-neutral-500">
            每一次调用的真实计费：输入 token / 输出 token / 模型 / 本次成本价（人民币，OceanLeo 不加价，按实际用量精确到 ¥0.00001）。
          </p>
          {history.length === 0 ? (
            <div className="rounded-xl border border-dashed border-neutral-300 p-6 text-center">
              <p className="text-[13px] text-neutral-500">暂无用量记录</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-neutral-200">
              <table className="w-full min-w-[560px] text-left text-[12px]">
                <thead className="bg-neutral-50 text-neutral-500">
                  <tr>
                    <th className="px-3 py-2 font-medium">时间</th>
                    <th className="px-3 py-2 font-medium">说明</th>
                    <th className="px-3 py-2 font-medium">模型</th>
                    <th className="px-3 py-2 text-right font-medium">输入 token</th>
                    <th className="px-3 py-2 text-right font-medium">输出 token</th>
                    <th className="px-3 py-2 text-right font-medium">费用(¥)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {history.slice(0, 30).map((ev, i) => {
                    const promptTokens = metaNum(ev, "prompt_tokens");
                    const completionTokens = metaNum(ev, "completion_tokens");
                    const totalTokens = metaNum(ev, "tokens");
                    const model = eventModel(ev);
                    const yuan = Number(ev?.amount_yuan ?? 0);
                    // 这一次调用的真实成本价（人民币，OceanLeo 不加价）。usage 事件按
                    // millifen 精确计费，meta.price_cny 是本次调用的真实花费；
                    // amount_yuan 只是钱包按整分滚动扣减的那一部分，可能为 0。
                    const isUsage = ev?.kind === "usage";
                    const realCny = metaNum(ev, "price_cny");
                    const label =
                      ev?.kind === "topup"
                        ? "充值"
                        : ev?.kind === "signup_grant"
                          ? "新用户体验金"
                          : ev?.kind === "monthly_grant"
                            ? "每月赠金"
                            : ev?.kind === "admin_reset"
                              ? "余额调整"
                              : ev?.endpoint || ev?.kind || ev?.site_id || "—";
                    return (
                      <tr key={i} className="text-neutral-700 transition hover:bg-neutral-50">
                        <td className="whitespace-nowrap px-3 py-2">
                          {ev?.created_at
                            ? new Date(ev.created_at).toLocaleString("zh-CN")
                            : "—"}
                        </td>
                        <td className="px-3 py-2">{label}</td>
                        <td className="px-3 py-2 text-neutral-500">{model || "—"}</td>
                        <td className="px-3 py-2 text-right tabular-nums">
                          {promptTokens > 0 ? promptTokens.toLocaleString() : "—"}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums">
                          {completionTokens > 0
                            ? completionTokens.toLocaleString()
                            : totalTokens > 0 && promptTokens === 0
                              ? totalTokens.toLocaleString()
                              : "—"}
                        </td>
                        <td
                          className={[
                            "px-3 py-2 text-right tabular-nums",
                            isUsage || yuan < 0 ? "text-neutral-700" : "text-emerald-600",
                          ].join(" ")}
                        >
                          {isUsage
                            ? realCny > 0
                              ? `-${realCny.toFixed(realCny < 0.0001 ? 6 : 4)}`
                              : yuan.toFixed(4)
                            : yuan > 0
                              ? `+${yuan.toFixed(4)}`
                              : yuan.toFixed(4)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
