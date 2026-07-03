"use client";

import { useState } from "react";
import { StudioSection, ResultCanvas, CanvasEmpty, type CanvasTab } from "@oceanleo/ui/shell";
import type { OpsPatch, OpsSchema } from "@oceanleo/ui/lib";
import { useUI } from "@oceanleo/ui/i18n";
import { aiChat, AiError } from "@/lib/ai";
import { useUser } from "@/lib/useUser";

const ACCENT = "#0e7490";

const inputCls =
  "w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100";

const LANGS = ["中文", "英语", "西班牙语", "法语", "德语", "俄语", "阿拉伯语", "葡萄牙语", "日语"];
const TONES = ["商务正式", "友好亲切", "简洁直接"];

// 外贸翻译功能区（新增 A 类）：外贸语境多语种互译 + 本地化（保留术语/商务礼仪/单位）。
export function useTradeTalkFn(onNeedAuth: () => void): {
  ops: React.ReactNode;
  canvas: React.ReactNode;
  schema: OpsSchema;
  getState: () => Record<string, unknown>;
  applyPatch: (patch: OpsPatch) => void;
} {
  const tt = useUI();
  const { user } = useUser();
  const [open, setOpen] = useState<"text" | "opts" | null>("text");
  const toggle = (s: "text" | "opts") => setOpen((cur) => (cur === s ? null : s));

  const [source, setSource] = useState("");
  const [target, setTarget] = useState("英语");
  const [tone, setTone] = useState("商务正式");
  const [terms, setTerms] = useState("");
  const [result, setResult] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const translate = async () => {
    setError(null);
    if (!source.trim()) {
      setError("请输入要翻译的文本。");
      return;
    }
    if (!user) return onNeedAuth();
    setBusy(true);
    try {
      const text = await aiChat({
        max_tokens: 2500,
        temperature: 0.3,
        system: `你是专业外贸本地化译员。把用户文本翻译成${target}，做到：①外贸/商务语境准确；②${tone}的语气；③保留并统一行业术语；④按目标语言地区习惯本地化（计量单位、货币、日期、礼貌用语）；⑤保留原文段落与列表格式。只输出译文，不要解释。`,
        messages: [
          {
            role: "user",
            content: `${terms.trim() ? `需保持一致的术语对照：\n${terms.trim()}\n\n` : ""}待翻译文本（翻成${target}）：\n${source.trim()}`,
          },
        ],
      });
      setResult(text.trim());
    } catch (e) {
      if (e instanceof AiError && e.status === 401) onNeedAuth();
      else setError(e instanceof Error ? e.message : "翻译失败，请重试。");
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
        title={tt("原文")}
        accent={ACCENT}
        open={open === "text"}
        onToggle={() => toggle("text")}
        summary={source ? "已填写" : "粘贴待翻译文本"}
      >
        <textarea
          className={`${inputCls} min-h-40 resize-y`}
          placeholder={tt("粘贴要翻译的外贸文本（邮件/产品描述/合同条款/话术…）")}
          value={source}
          onChange={(e) => setSource(e.target.value)}
        />
      </StudioSection>

      <StudioSection
        index={2}
        title={tt("目标语言与选项")}
        accent={ACCENT}
        open={open === "opts"}
        onToggle={() => toggle("opts")}
        summary={`${target} · ${tone}`}
      >
        <div className="space-y-3">
          <div>
            <div className="mb-1.5 text-xs font-medium text-stone-500">{tt("目标语言")}</div>
            <div className="flex flex-wrap gap-2">
              {LANGS.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setTarget(l)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    target === l
                      ? "bg-cyan-700 text-white"
                      : "border border-stone-300 text-stone-600 hover:bg-stone-50"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-1.5 text-xs font-medium text-stone-500">{tt("语气")}</div>
            <div className="flex flex-wrap gap-2">
              {TONES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTone(t)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    tone === t
                      ? "bg-cyan-700 text-white"
                      : "border border-stone-300 text-stone-600 hover:bg-stone-50"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <textarea
            className={`${inputCls} min-h-16 resize-y`}
            placeholder={tt("术语对照（可选，每行一条，如：储能=energy storage）")}
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
          />
        </div>
      </StudioSection>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
          {error}
        </div>
      )}
      <button
        type="button"
        onClick={() => void translate()}
        disabled={busy}
        className="w-full rounded-2xl px-4 py-3 text-sm font-bold text-white shadow-md transition hover:opacity-90 disabled:opacity-50"
        style={{ background: "linear-gradient(135deg, var(--grad-from), var(--grad-to))" }}
      >
        {busy ? "AI 翻译中…" : `翻译成${target} ✦`}
      </button>
    </div>
  );

  const tabs: CanvasTab[] = [
    {
      id: "result",
      label: "译文",
      content: (
        <div className="flex h-full flex-col">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-stone-800">{tt("译文（可编辑）")}</h2>
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
                <p className="mt-3 text-xs text-stone-400">正在翻译成 {target}…</p>
              </div>
            </div>
          ) : result ? (
            <textarea
              className="min-h-[22rem] flex-1 resize-y rounded-xl border border-stone-200 bg-stone-50/50 p-4 text-sm leading-relaxed outline-none focus:border-cyan-400"
              value={result}
              onChange={(e) => setResult(e.target.value)}
            />
          ) : (
            <CanvasEmpty
              title={tt("译文会显示在这里")}
              hint={tt("粘贴原文、选好目标语言与语气，点「翻译」后即可在此编辑、复制。")}
            />
          )}
        </div>
      ),
    },
  ];

  const canvas = <ResultCanvas tabs={tabs} active="result" onChange={() => {}} />;

  const schema: OpsSchema = {
    agentId: "bizdev.trade-talk",
    title: "外贸翻译",
    fields: [
      { key: "source", label: "原文", type: "longtext" },
      {
        key: "target", label: "目标语言", type: "enum",
        enumValues: LANGS.map((l) => ({ value: l, label: l })),
      },
      {
        key: "tone", label: "语气", type: "enum",
        enumValues: TONES.map((t) => ({ value: t, label: t })),
      },
      { key: "terms", label: "术语对照", type: "longtext" },
      { key: "result", label: "译文", type: "longtext" },
    ],
    actions: [],
  };

  const getState = (): Record<string, unknown> => ({ source, target, tone, terms });

  const applyPatch = (patch: OpsPatch) => {
    const s = patch.set || {};
    if (typeof s.source === "string") setSource(s.source);
    if (typeof s.target === "string") setTarget(s.target);
    if (typeof s.tone === "string") setTone(s.tone);
    if (typeof s.terms === "string") setTerms(s.terms);
    if (typeof s.result === "string") setResult(s.result);
  };

  return { ops, canvas, schema, getState, applyPatch };
}
