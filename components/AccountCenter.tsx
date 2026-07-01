"use client";

// ============================================================================
// OceanLeo 全家桶「账户」统一内容组件（不含侧栏 shell）
// ----------------------------------------------------------------------------
// 与主站 https://oceanleo.com/account 完全对齐：标题「账户」→ 用户卡片 →
// 三格统计 → 「账户设置 / 插件与连接器」菜单 → 退出登录（在本页，不在侧栏）。
//
// 这份文件在所有 *.oceanleo.com 子站里逐字相同（纯拼接），各站 account/page.tsx
// 只负责 <SiteShell><AccountCenter /></SiteShell>。
//
// 零站点特有依赖：仅 next/link + react + lib/oceanleo-auth（全站都有）。
// 不依赖 lib/useUser（部分站缺失），直接走 browserClient() 取用户态。
//
// 子站三格：token 余额(¥) / 本月消耗(¥) / 近 30 天请求。
//   主站第三格是「任务数」(agent_tasks)，子站无任务体系，故用有真实数据的
//   「近 30 天请求」，前两格与主站同文案同位置，布局像素级一致。
//
// 2026-06-14：余额改为人民币 token 余额（不再是「积分」），消耗改为 ¥。
// 「密钥管理」入口去掉（BYOK 已移除），新增「API」入口（模型选择 + 标价）。
// ============================================================================

import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import {
  browserClient,
  oceanleoConfigured,
  getCredits,
  getCreditHistory,
  getUsageBySite,
  signOutEverywhere,
} from "@/lib/oceanleo-auth";

const MENU_ITEMS = [
  {
    label: "通用",
    href: "/general",
    desc: "语言与主题（浅色 / 深色 / 自动）等外观设置",
    external: false,
  },
  {
    label: "我的数据库",
    href: "/database",
    desc: "你在全 OceanLeo 系列产出的作品、上传的素材与知识库（跨站共享）",
    external: false,
  },
  {
    label: "API",
    href: "/api",
    desc: "选择模型、查看价格与 token 余额",
    external: false,
  },
  {
    label: "账户设置",
    href: "/settings",
    desc: "个人资料、用量与知识库",
    external: false,
  },
  {
    label: "插件与连接器",
    href: "/plugins",
    desc: "技能、连接器与 MCP 服务器",
    external: false,
  },
];

function IconChevronRight({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`h-4 w-4 ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function AccountCenter() {
  const [user, setUser] = useState<User | null>(null);
  const [checked, setChecked] = useState(false);
  const [balanceYuan, setBalanceYuan] = useState<number | null>(null);
  const [monthSpendYuan, setMonthSpendYuan] = useState<number | null>(null);
  const [requests, setRequests] = useState<number | null>(null);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    const c = browserClient();
    if (!c) {
      setChecked(true);
      return;
    }
    // SSO 修复（2026-07-01）：用 getSession() 读本地共享 cookie 里的会话，而不是
    // getUser()。getUser() 会向 Supabase Auth 服务器发网络请求校验 access_token，
    // 在跨子域 SSO 场景下（token 刚打开页面尚未刷新 / access_token 已过期而 refresh
    // 尚未完成）会返回 null → 明明登录了却显示「尚未登录」。getSession() 会先本地
    // 用 refresh_token 续期再返回，只要共享 cookie 在就稳定拿到会话（与主站一致）。
    c.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setChecked(true);
    });
    const { data: sub } = c.auth.onAuthStateChange((_e, s) =>
      setUser(s?.user ?? null),
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    getCredits().then((r) => {
      if (r.ok && r.data) setBalanceYuan(r.data.balance_yuan);
    });
    getCreditHistory(200).then((r) => {
      const events =
        r.ok && r.data && Array.isArray(r.data.events) ? r.data.events : [];
      const now = new Date();
      let spend = 0; // in CNY (yuan)
      for (const ev of events) {
        const yuan = Number(ev?.amount_yuan ?? 0);
        const d = ev?.created_at ? new Date(ev.created_at) : null;
        const inMonth =
          d &&
          d.getUTCFullYear() === now.getUTCFullYear() &&
          d.getUTCMonth() === now.getUTCMonth();
        if (inMonth && yuan < 0) spend += Math.abs(yuan);
      }
      setMonthSpendYuan(spend);
    });
    getUsageBySite(30).then((r) => {
      if (r.ok && r.data) setRequests(r.data.total?.requests ?? 0);
    });
  }, [user]);

  async function handleLogout() {
    setSigningOut(true);
    await signOutEverywhere();
    window.location.href = "/";
  }

  if (!oceanleoConfigured()) {
    return (
      <div className="px-8 py-6">
        <h1 className="text-[22px] font-semibold tracking-tight text-neutral-900">
          账户
        </h1>
        <div className="mx-auto mt-10 max-w-md rounded-xl border border-amber-200 bg-amber-50 p-6 text-center text-[13px] text-amber-800">
          登录服务尚未配置（缺少 Supabase 环境变量）。
        </div>
      </div>
    );
  }

  // logged-out
  if (checked && !user) {
    return (
      <div className="px-8 py-6">
        <h1 className="text-[22px] font-semibold tracking-tight text-neutral-900">
          账户
        </h1>
        <div className="v-fade-up mx-auto mt-16 max-w-sm text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 text-2xl">
            👤
          </div>
          <h2 className="mt-5 text-[17px] font-semibold text-neutral-900">
            尚未登录
          </h2>
          <p className="mt-2 text-[13px] leading-relaxed text-neutral-500">
            登录后即可查看 token 余额与用量。
            <br />
            一次登录，全家桶所有 AI 应用通用。
          </p>
          <Link
            href="/"
            className="mt-6 inline-block w-full rounded-xl bg-neutral-900 py-2.5 text-[14px] font-medium text-white transition hover:bg-neutral-800 active:scale-[0.99]"
          >
            返回首页登录
          </Link>
        </div>
      </div>
    );
  }

  const email = user?.email || null;

  return (
    <div className="px-8 py-6">
      {confirmLogout && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4">
          <div className="v-scale-in w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-[16px] font-semibold text-neutral-900">退出登录</h3>
            <p className="mt-2 text-[13px] leading-relaxed text-neutral-500">
              退出后需要重新登录才能使用。这将退出全部 OceanLeo 站点。
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmLogout(false)}
                className="rounded-lg border border-neutral-200 px-4 py-2 text-[13px] text-neutral-700 transition hover:bg-neutral-50"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleLogout}
                disabled={signingOut}
                className="rounded-lg bg-red-600 px-4 py-2 text-[13px] font-medium text-white transition hover:bg-red-500 disabled:opacity-50"
              >
                {signingOut ? "退出中…" : "退出登录"}
              </button>
            </div>
          </div>
        </div>
      )}

      <h1 className="text-[22px] font-semibold tracking-tight text-neutral-900">
        账户
      </h1>

      <div className="v-fade-up mx-auto mt-8 max-w-lg">
        <div className="flex items-center gap-4 rounded-2xl border border-neutral-200 p-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-800 text-lg font-medium text-white">
            {email ? email[0].toUpperCase() : "?"}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[16px] font-semibold text-neutral-900">
              {email ? email.split("@")[0] : "未登录"}
            </p>
            <p className="truncate text-[13px] text-neutral-500">{email || "—"}</p>
            <p className="mt-1 text-[12px] text-neutral-400">免费计划</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-neutral-200 p-3 text-center">
            <p className="text-[18px] font-semibold tabular-nums text-neutral-900">
              {balanceYuan !== null ? `¥${balanceYuan.toFixed(2)}` : "..."}
            </p>
            <p className="text-[11px] text-neutral-500">token 余额</p>
          </div>
          <div className="rounded-xl border border-neutral-200 p-3 text-center">
            <p className="text-[18px] font-semibold tabular-nums text-neutral-900">
              {monthSpendYuan !== null ? `¥${monthSpendYuan.toFixed(2)}` : "—"}
            </p>
            <p className="text-[11px] text-neutral-500">本月消耗</p>
          </div>
          <div className="rounded-xl border border-neutral-200 p-3 text-center">
            <p className="text-[18px] font-semibold tabular-nums text-neutral-900">
              {requests !== null ? requests.toLocaleString() : "—"}
            </p>
            <p className="text-[11px] text-neutral-500">近 30 天请求</p>
          </div>
        </div>

        <div className="mt-6 divide-y divide-neutral-100 rounded-xl border border-neutral-200">
          {MENU_ITEMS.map((item) =>
            item.external ? (
              <a
                key={item.label}
                href={item.href}
                className="group flex items-center justify-between px-4 py-3.5 transition hover:bg-neutral-50"
              >
                <div>
                  <p className="text-[13px] font-medium text-neutral-900">
                    {item.label}
                  </p>
                  <p className="text-[12px] text-neutral-500">{item.desc}</p>
                </div>
                <IconChevronRight className="shrink-0 text-neutral-400 transition-transform group-hover:translate-x-0.5" />
              </a>
            ) : (
              <Link
                key={item.label}
                href={item.href}
                className="group flex items-center justify-between px-4 py-3.5 transition hover:bg-neutral-50"
              >
                <div>
                  <p className="text-[13px] font-medium text-neutral-900">
                    {item.label}
                  </p>
                  <p className="text-[12px] text-neutral-500">{item.desc}</p>
                </div>
                <IconChevronRight className="shrink-0 text-neutral-400 transition-transform group-hover:translate-x-0.5" />
              </Link>
            ),
          )}
        </div>

        <button
          type="button"
          onClick={() => setConfirmLogout(true)}
          className="mt-6 w-full rounded-xl border border-neutral-200 py-2.5 text-[13px] text-red-600 transition hover:border-red-200 hover:bg-red-50 active:scale-[0.99]"
        >
          退出登录
        </button>
      </div>
    </div>
  );
}
