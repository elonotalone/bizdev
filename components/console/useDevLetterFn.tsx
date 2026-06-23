"use client";

import { useState } from "react";
import { StudioSection, ResultCanvas, CanvasEmpty, Markdown, type CanvasTab } from "@oceanleo/ui/shell";
import type { OpsPatch, OpsSchema } from "@oceanleo/ui/lib";
import { aiChat, AiError } from "@/lib/ai";
import { useUser } from "@/lib/useUser";

const ACCENT = "#0e7490";

const inputCls =
  "w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100";

const SCENES = [
  { id: "cold", label: "冷启动开发信" },
  { id: "follow", label: "跟进信" },
  { id: "quote", label: "报价/跟单" },
  { id: "reactivate", label: "唤醒沉睡客户" },
];
const LANGS = ["英语", "西班牙语", "法语", "德语", "阿拉伯语", "葡萄牙语"];

// 开发信功能区（新增 A 类）：按目标客户/产品/卖点 → AI 写多版本外贸开发信。
export function useDevLetterFn(onNeedAuth: () => void): {
  ops: React.ReactNode;
  canvas: React.ReactNode;
  schema: OpsSchema;
  getState: () => Record<string, unknown>;
  applyPatch: (patch: OpsPatch) => void;
} {
  const { user } = useUser();
  const [open, setOpen] = useState<"target" | "selling" | "style" | null>("target");
  const toggle = (s: "target" | "selling" | "style") =>
    setOpen((cur) => (cur === s ? null : s));

  const [customer, setCustomer] = useState("");
  const [product, setProduct] = useState("");
  const [selling, setSelling] = useState("");
  const [scene, setScene] = useState("cold");
  const [lang, setLang] = useState("英语");
  const [result, setResult] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const sceneLabel = SCENES.find((s) => s.id === scene)?.label || "开发信";

  const generate = async () => {
    setError(null);
    if (!product.trim()) {
      setError("请至少填写要推广的产品。");
      return;
    }
    if (!user) return onNeedAuth();
    setBusy(true);
    try {
      const text = await aiChat({
        max_tokens: 2500,
        system: `你是外贸开发信专家，擅长写简洁、个性化、有回复率的 B2B 开发信。用${lang}撰写正文，再附一句中文小结说明邮件思路。给出 2 个不同切入角度的版本（含主题行 Subject）。避免群发感与夸张词。`,
        messages: [
          {
            role: "user",
            content: `场景：${sceneLabel}
${customer.trim() ? `目标客户/公司：${customer.trim()}` : "目标客户：通用潜在买家"}
推广产品：${product.trim()}
核心卖点/亮点：${selling.trim() || "（未提供，请基于产品合理组织：质量/价格/认证/交期/MOQ 等）"}`,
          },
        ],
      });
      setResult(text.trim());
    } catch (e) {
      if (e instanceof AiError && e.status === 401) onNeedAuth();
      else setError(e instanceof Error ? e.message : "生成失败，请重试。");
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setError("复制失败，请手动选择文本复制。");
    }
  };

  const ops = (
    <div className="space-y-3">
      <StudioSection
        index={1}
        title="目标客户与产品"
        accent={ACCENT}
        open={open === "target"}
        onToggle={() => toggle("target")}
        summary={product || "必填产品"}
      >
        <div className="space-y-3">
          <input
            className={inputCls}
            placeholder="目标客户/公司（可选）"
            value={customer}
            onChange={(e) => setCustomer(e.target.value)}
          />
          <input
            className={inputCls}
            placeholder="要推广的产品 *"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
          />
        </div>
      </StudioSection>

      <StudioSection
        index={2}
        title="核心卖点"
        accent={ACCENT}
        open={open === "selling"}
        onToggle={() => toggle("selling")}
        summary={selling ? "已填写" : "卖点/认证/交期"}
      >
        <textarea
          className={`${inputCls} min-h-28 resize-y`}
          placeholder="质量优势、价格、认证（CE/UL…）、交期、MOQ、工厂实力、成功案例等，每行一条"
          value={selling}
          onChange={(e) => setSelling(e.target.value)}
        />
      </StudioSection>

      <StudioSection
        index={3}
        title="场景与语言"
        accent={ACCENT}
        open={open === "style"}
        onToggle={() => toggle("style")}
        summary={`${sceneLabel} · ${lang}`}
      >
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {SCENES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setScene(s.id)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  scene === s.id
                    ? "bg-cyan-700 text-white"
                    : "border border-stone-300 text-stone-600 hover:bg-stone-50"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {LANGS.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  lang === l
                    ? "bg-cyan-700 text-white"
                    : "border border-stone-300 text-stone-600 hover:bg-stone-50"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </StudioSection>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
          {error}
        </div>
      )}
      <button
        type="button"
        onClick={() => void generate()}
        disabled={busy}
        className="w-full rounded-2xl px-4 py-3 text-sm font-bold text-white shadow-md transition hover:opacity-90 disabled:opacity-50"
        style={{ background: "linear-gradient(135deg, var(--grad-from), var(--grad-to))" }}
      >
        {busy ? "AI 撰写中…" : "生成开发信 ✦"}
      </button>
    </div>
  );

  const tabs: CanvasTab[] = [
    {
      id: "result",
      label: "开发信",
      content: (
        <div className="flex h-full flex-col">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-stone-800">开发信（可编辑）</h2>
            <button
              type="button"
              onClick={() => void copy()}
              disabled={!result}
              className="rounded-full border border-stone-300 px-3.5 py-1 text-xs font-medium text-stone-600 transition hover:bg-stone-50 disabled:opacity-40"
            >
              {copied ? "已复制 ✓" : "复制全文"}
            </button>
          </div>
          {busy && !result ? (
            <div className="grid flex-1 place-items-center py-16">
              <div className="text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-[3px] border-cyan-200 border-t-cyan-600" />
                <p className="mt-3 text-xs text-stone-400">正在撰写 {lang} 开发信…</p>
              </div>
            </div>
          ) : result ? (
            <div className="prose prose-sm max-w-none flex-1 overflow-y-auto rounded-xl border border-stone-200 bg-stone-50/50 p-4">
              <Markdown>{result}</Markdown>
            </div>
          ) : (
            <CanvasEmpty
              title="开发信会显示在这里"
              hint="填写产品与卖点、选好场景与语言，点「生成开发信」后即可在此查看、复制。"
            />
          )}
        </div>
      ),
    },
  ];

  const canvas = <ResultCanvas tabs={tabs} active="result" onChange={() => {}} />;

  const schema: OpsSchema = {
    agentId: "bizdev.dev-letter",
    title: "开发信",
    fields: [
      { key: "customer", label: "目标客户", type: "text" },
      { key: "product", label: "推广产品", type: "text" },
      { key: "selling", label: "核心卖点", type: "longtext" },
      {
        key: "scene", label: "场景", type: "enum",
        enumValues: SCENES.map((s) => ({ value: s.id, label: s.label })),
      },
      {
        key: "lang", label: "语言", type: "enum",
        enumValues: LANGS.map((l) => ({ value: l, label: l })),
      },
      { key: "result", label: "开发信正文", type: "longtext" },
    ],
    actions: [],
  };

  const getState = (): Record<string, unknown> => ({ customer, product, selling, scene, lang });

  const applyPatch = (patch: OpsPatch) => {
    const s = patch.set || {};
    if (typeof s.customer === "string") setCustomer(s.customer);
    if (typeof s.product === "string") setProduct(s.product);
    if (typeof s.selling === "string") setSelling(s.selling);
    if (typeof s.scene === "string") setScene(s.scene);
    if (typeof s.lang === "string") setLang(s.lang);
    if (typeof s.result === "string") setResult(s.result);
  };

  return { ops, canvas, schema, getState, applyPatch };
}
