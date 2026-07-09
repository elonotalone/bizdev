"use client";

import { useState } from "react";
import { StudioSection, CanvasEmpty, Markdown, LeoComposer, OptionRow, type CanvasTab } from "@oceanleo/ui/shell";
import { LibraryCanvas } from "./LibraryCanvas";
import type { OpsPatch, OpsSchema } from "@oceanleo/ui/lib";
import { useUI } from "@oceanleo/ui/i18n";
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
const DEFAULT_SCENE = "cold";
const DEFAULT_LANG = "英语";

// 开发信功能区（新增 A 类）：按目标客户/产品/卖点 → AI 写多版本外贸开发信。
export function useDevLetterFn(onNeedAuth: () => void): {
  ops: React.ReactNode;
  sticky: React.ReactNode;
  canvas: React.ReactNode;
  schema: OpsSchema;
  getState: () => Record<string, unknown>;
  applyPatch: (patch: OpsPatch) => void;
  reset: () => void;
} {
  const tt = useUI();
  const { user } = useUser();
  const [open, setOpen] = useState<"target" | "selling" | "style" | null>("selling");
  const toggle = (s: "target" | "selling" | "style") =>
    setOpen((cur) => (cur === s ? null : s));

  const [customer, setCustomer] = useState("");
  const [product, setProduct] = useState("");
  const [selling, setSelling] = useState("");
  // 宗旨 v15/v19：主输入字段「核心卖点」走模板实填（点导航卡灌 highlightTemplate）。
  const [sellingTemplate, setSellingTemplate] = useState<string | null>(null);
  const [scene, setScene] = useState("cold");
  const [lang, setLang] = useState("英语");
  const [result, setResult] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // 宗旨 v18：scene/lang 可为空（点已选=取消）→ 展示与生成均回落默认档。
  const sceneLabel = SCENES.find((s) => s.id === (scene || DEFAULT_SCENE))?.label || "开发信";

  const generate = async () => {
    setError(null);
    if (!product.trim()) {
      setError(tt("请至少填写要推广的产品。"));
      return;
    }
    if (!user) return onNeedAuth();
    setBusy(true);
    const langV = lang || DEFAULT_LANG;
    try {
      const text = await aiChat({
        max_tokens: 2500,
        system: `你是外贸开发信专家，擅长写简洁、个性化、有回复率的 B2B 开发信。用${langV}撰写正文，再附一句中文小结说明邮件思路。给出 2 个不同切入角度的版本（含主题行 Subject）。避免群发感与夸张词。`,
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
      else setError(e instanceof Error ? e.message : tt("生成失败，请重试。"));
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
      setError(tt("复制失败，请手动选择文本复制。"));
    }
  };

  const ops = (
    <div className="space-y-3">
      {/* 宗旨 v19：操作台最上面 = 自由输入框（核心卖点主字段），点右侧导航卡片灌模板实填。 */}
      <StudioSection
        index={1}
        title={tt("核心卖点")}
        accent={ACCENT}
        open={open === "selling"}
        onToggle={() => toggle("selling")}
        summary={selling ? tt("已填写") : tt("卖点/认证/交期")}
      >
        <LeoComposer
          value={selling}
          onChange={setSelling}
          leoSuggest
          highlightTemplate={sellingTemplate}
          accentColor={ACCENT}
          placeholder={tt("质量优势、价格、认证（CE/UL…）、交期、MOQ、工厂实力、成功案例等，每行一条")}
        />
      </StudioSection>

      <StudioSection
        index={2}
        title={tt("目标客户与产品")}
        accent={ACCENT}
        open={open === "target"}
        onToggle={() => toggle("target")}
        summary={product || tt("必填产品")}
      >
        <div className="space-y-3">
          <input
            className={inputCls}
            placeholder={tt("目标客户/公司（可选）")}
            value={customer}
            onChange={(e) => setCustomer(e.target.value)}
          />
          <input
            className={inputCls}
            placeholder={tt("要推广的产品 *")}
            value={product}
            onChange={(e) => setProduct(e.target.value)}
          />
        </div>
      </StudioSection>

      <StudioSection
        index={3}
        title={tt("场景与语言")}
        accent={ACCENT}
        open={open === "style"}
        onToggle={() => toggle("style")}
        summary={`${tt(sceneLabel)} · ${lang || DEFAULT_LANG}`}
      >
        <div className="space-y-3">
          <OptionRow
            accent={ACCENT}
            options={SCENES.map((s) => ({ value: s.id, label: s.label }))}
            value={scene}
            onChange={(v) => setScene(v ?? "")}
          />
          <OptionRow
            accent={ACCENT}
            options={LANGS.map((l) => ({ value: l, label: l }))}
            value={lang}
            onChange={(v) => setLang(v ?? "")}
          />
        </div>
      </StudioSection>
    </div>
  );

  // 宗旨 v18：主按钮「生成开发信」+ 错误提示恒定在操作台底部（FunctionAgentChat stickyAction）。
  const sticky = (
    <div className="space-y-2">
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
        {busy ? tt("AI 撰写中…") : tt("生成开发信 ✦")}
      </button>
    </div>
  );

  const tabs: CanvasTab[] = [
    {
      id: "result",
      label: tt("开发信"),
      content: (
        <div className="flex h-full flex-col">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-stone-800">{tt("开发信（可编辑）")}</h2>
            <button
              type="button"
              onClick={() => void copy()}
              disabled={!result}
              className="rounded-full border border-stone-300 px-3.5 py-1 text-xs font-medium text-stone-600 transition hover:bg-stone-50 disabled:opacity-40"
            >
              {copied ? tt("已复制 ✓") : tt("复制全文")}
            </button>
          </div>
          {busy && !result ? (
            <div className="grid flex-1 place-items-center py-16">
              <div className="text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-[3px] border-cyan-200 border-t-cyan-600" />
                <p className="mt-3 text-xs text-stone-400">{tt("正在撰写 {lang} 开发信…", { lang: lang || DEFAULT_LANG })}</p>
              </div>
            </div>
          ) : result ? (
            <div className="prose prose-sm max-w-none flex-1 overflow-y-auto rounded-xl border border-stone-200 bg-stone-50/50 p-4">
              <Markdown>{result}</Markdown>
            </div>
          ) : (
            <CanvasEmpty
              title={tt("开发信会显示在这里")}
              hint={tt("填写产品与卖点、选好场景与语言，点「生成开发信」后即可在此查看、复制。")}
            />
          )}
        </div>
      ),
    },
  ];

  const canvas = <LibraryCanvas resultTabs={tabs} />;

  const schema: OpsSchema = {
    agentId: "bizdev.dev-letter",
    title: tt("开发信"),
    fields: [
      { key: "customer", label: tt("目标客户"), type: "text" },
      { key: "product", label: tt("推广产品"), type: "text" },
      { key: "selling", label: tt("核心卖点"), type: "longtext" },
      {
        key: "scene", label: tt("场景"), type: "enum",
        enumValues: SCENES.map((s) => ({ value: s.id, label: tt(s.label) })),
      },
      {
        key: "lang", label: tt("语言"), type: "enum",
        enumValues: LANGS.map((l) => ({ value: l, label: tt(l) })),
      },
      { key: "result", label: tt("开发信正文"), type: "longtext" },
    ],
    actions: [],
  };

  const getState = (): Record<string, unknown> => ({ customer, product, selling, scene, lang });

  const applyPatch = (patch: OpsPatch) => {
    const s = patch.set || {};
    if (typeof s.customer === "string") setCustomer(s.customer);
    if (typeof s.product === "string") setProduct(s.product);
    // 主输入走模板实填：清空值 + 设模板 → LeoComposer 依 highlightTemplate 重新 seed。
    if (typeof s.selling === "string") {
      setSelling("");
      setSellingTemplate(s.selling);
    }
    if (typeof s.scene === "string") setScene(s.scene);
    if (typeof s.lang === "string") setLang(s.lang);
    if (typeof s.result === "string") setResult(s.result);
  };

  // alignment §3-5：进/换成品 app 时重置本功能操作台（临时输入，安全清空）。
  const reset = () => {
    setOpen("selling");
    setCustomer("");
    setProduct("");
    setSelling("");
    setSellingTemplate(null);
    setScene("cold");
    setLang("英语");
    setResult("");
    setError(null);
    setCopied(false);
  };

  return { ops, sticky, canvas, schema, getState, applyPatch, reset };
}
