"use client";

import { useState } from "react";
import { getSupabase, supabaseConfigured } from "@/lib/supabase";

// Login prompt shown when a visitor clicks an AI action while signed out
// (myselfie pattern: browse freely, sign in only when AI is needed).
export function AuthModal({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    setErr(null);
    setMsg(null);
    const supabase = getSupabase();
    if (!supabase) {
      setErr("登录服务未配置。");
      return;
    }
    if (!email.trim() || !password) {
      setErr("请输入邮箱和密码。");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email: email.trim(), password });
        if (error) setErr(error.message);
        else setMsg("注册成功，请查收验证邮件后再登录。");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) setErr(error.message);
        else onClose();
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-stone-900/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-3xl border border-stone-200 bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {!supabaseConfigured() ? (
          <div className="text-sm text-amber-700">
            登录服务尚未配置（缺少 Supabase 环境变量）。
          </div>
        ) : (
          <>
            <h2 className="text-lg font-semibold text-stone-900">
              {mode === "signin" ? "登录 OceanLeo" : "注册 OceanLeo"}
            </h2>
            <p className="mt-1 text-xs text-stone-500">
              一次登录，所有 OceanLeo 站点的 AI 功能通用。
            </p>
            <div className="mt-4 space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="邮箱"
                className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="密码"
                onKeyDown={(e) => e.key === "Enter" && void submit()}
                className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
              <button
                onClick={() => void submit()}
                disabled={busy}
                className="w-full rounded-xl px-3 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, var(--grad-from), var(--grad-to))" }}
              >
                {busy ? "处理中…" : mode === "signin" ? "登录" : "注册"}
              </button>
            </div>
            {msg && <p className="mt-3 text-xs text-emerald-600">{msg}</p>}
            {err && <p className="mt-3 text-xs text-rose-600">{err}</p>}
            <div className="mt-4 flex items-center justify-between">
              <button
                onClick={() => {
                  setMode(mode === "signin" ? "signup" : "signin");
                  setErr(null);
                  setMsg(null);
                }}
                className="text-xs text-stone-500 underline-offset-2 hover:underline"
              >
                {mode === "signin" ? "还没有账号？去注册" : "已有账号？去登录"}
              </button>
              <button onClick={onClose} className="text-xs text-stone-400 hover:text-stone-600">
                关闭
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
