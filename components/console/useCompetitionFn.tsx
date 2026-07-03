"use client";

import { useState } from "react";
import { StudioSection, ResultCanvas, CanvasEmpty, Markdown, type CanvasTab } from "@oceanleo/ui/shell";
import type { OpsPatch, OpsSchema } from "@oceanleo/ui/lib";
import { useUI } from "@oceanleo/ui/i18n";
import { aiChat, AiError } from "@/lib/ai";
import { useUser } from "@/lib/useUser";

const ACCENT = "#0e7490";

const inputCls =
  "w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100";

const DIM_TAGS = ["价格策略", "产品功能对比", "卖点与差异化", "目标客户", "营销渠道", "用户评价/槽点"];

// 竞品分析功能区（旧 ProductCompetition/MarketCompetition 的 A 类核心）：用户粘贴自家 +
// 竞品信息 → AI 出对比报告与差异化打法。旧版「全网扫描竞品」依赖 trade-engine，deferred。
export function useCompetitionFn(onNeedAuth: () => void): {
  ops: React.ReactNode;
  canvas: React.ReactNode;
  schema: OpsSchema;
  getState: () => Record<string, unknown>;
  applyPatch: (patch: OpsPatch) => void;
} {
  const tt = useUI();
  const { user } = useUser();
  const [open, setOpen] = useState<"mine" | "rivals" | "dim" | null>("mine");
  const toggle = (s: "mine" | "rivals" | "dim") =>
    setOpen((cur) => (cur === s ? null : s));

  const [product, setProduct] = useState("");
  const [market, setMarket] = useState("");
  const [mine, setMine] = useState("");
  const [rivals, setRivals] = useState("");
  const [dimension, setDimension] = useState("");
  const [report, setReport] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    setError(null);
    if (!rivals.trim() && !product.trim()) {
      setError("请至少填写产品名称或粘贴竞品信息。");
      return;
    }
    if (!user) return onNeedAuth();
    setBusy(true);
    try {
      const text = await aiChat({
        max_tokens: 3000,
        system:
          "你是资深外贸市场分析师。基于用户提供的自家产品与竞品信息做竞品对比分析（Markdown）。只依据所给素材推理，不编造未提供的具体参数/价格；信息不足处标「需补充」。输出：① 对比表（维度 × 各方，含自家）；② 各竞品优劣势小结；③ 自家差异化卖点与定位建议；④ 在目标市场的打法与话术建议。",
        messages: [
          {
            role: "user",
            content: `产品/品类：${product.trim() || "（见素材）"}
${market.trim() ? `目标市场：${market.trim()}` : ""}
${dimension.trim() ? `重点对比维度：${dimension.trim()}` : ""}

自家产品信息：
${mine.trim() || "（未提供，请在对比中以「自家：需补充」占位）"}

竞品信息（可多个，用分隔线或编号区分）：
${rivals.trim() || "（未提供具体竞品，请基于品类给出常见竞争格局框架并标注需补充）"}`,
          },
        ],
      });
      setReport(text.trim());
    } catch (e) {
      if (e instanceof AiError && e.status === 401) onNeedAuth();
      else setError(e instanceof Error ? e.message : "生成失败，请重试。");
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(report);
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
        title={tt("自家产品")}
        accent={ACCENT}
        open={open === "mine"}
        onToggle={() => toggle("mine")}
        summary={product || "产品/品类 + 信息"}
      >
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input
              className={inputCls}
              placeholder={tt("产品 / 品类")}
              value={product}
              onChange={(e) => setProduct(e.target.value)}
            />
            <input
              className={inputCls}
              placeholder={tt("目标市场（可选）")}
              value={market}
              onChange={(e) => setMarket(e.target.value)}
            />
          </div>
          <textarea
            className={`${inputCls} min-h-28 resize-y`}
            placeholder={tt("自家产品的卖点、参数、价格、认证、交期等")}
            value={mine}
            onChange={(e) => setMine(e.target.value)}
          />
        </div>
      </StudioSection>

      <StudioSection
        index={2}
        title={tt("竞品信息（粘贴素材）")}
        accent={ACCENT}
        open={open === "rivals"}
        onToggle={() => toggle("rivals")}
        summary={rivals ? "已粘贴" : "竞品资料/listing/报价"}
      >
        <textarea
          className={`${inputCls} min-h-40 resize-y`}
          placeholder={tt("粘贴一个或多个竞品的信息：产品页文案、Amazon/阿里 listing、参数、报价、用户评价等。多个竞品用「---」或编号区分。")}
          value={rivals}
          onChange={(e) => setRivals(e.target.value)}
        />
        <p className="mt-2 text-xs text-stone-400">
          提示：本功能基于你提供的素材分析；「全网自动扫描竞品」待后端部署后开放。
        </p>
      </StudioSection>

      <StudioSection
        index={3}
        title={tt("对比维度（可选）")}
        accent={ACCENT}
        open={open === "dim"}
        onToggle={() => toggle("dim")}
        summary={dimension || "默认全维度"}
      >
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {DIM_TAGS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setDimension((cur) => (cur.includes(t) ? cur : `${cur ? cur + "、" : ""}${t}`))}
                className="rounded-full border border-stone-300 px-3 py-1 text-xs font-medium text-stone-600 transition hover:bg-stone-50"
              >
                {t}
              </button>
            ))}
          </div>
          <input
            className={inputCls}
            placeholder={tt("自定义对比维度（可选）")}
            value={dimension}
            onChange={(e) => setDimension(e.target.value)}
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
        onClick={() => void generate()}
        disabled={busy}
        className="w-full rounded-2xl px-4 py-3 text-sm font-bold text-white shadow-md transition hover:opacity-90 disabled:opacity-50"
        style={{ background: "linear-gradient(135deg, var(--grad-from), var(--grad-to))" }}
      >
        {busy ? "AI 分析中…" : "生成竞品分析 ✦"}
      </button>
    </div>
  );

  const tabs: CanvasTab[] = [
    {
      id: "report",
      label: "竞品分析",
      content: (
        <div className="flex h-full flex-col">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-stone-800">{tt("竞品分析报告")}</h2>
            <button
              type="button"
              onClick={() => void copy()}
              disabled={!report}
              className="rounded-full border border-stone-300 px-3.5 py-1 text-xs font-medium text-stone-600 transition hover:bg-stone-50 disabled:opacity-40"
            >
              {copied ? "已复制 ✓" : "复制全文"}
            </button>
          </div>
          {busy && !report ? (
            <div className="grid flex-1 place-items-center py-16">
              <div className="text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-[3px] border-cyan-200 border-t-cyan-600" />
                <p className="mt-3 text-xs text-stone-400">{tt("正在对比分析…")}</p>
              </div>
            </div>
          ) : report ? (
            <div className="prose prose-sm max-w-none flex-1 overflow-y-auto rounded-xl border border-stone-200 bg-stone-50/50 p-4">
              <Markdown>{report}</Markdown>
            </div>
          ) : (
            <CanvasEmpty
              title={tt("竞品分析会显示在这里")}
              hint={tt("填写自家产品、粘贴竞品信息，点「生成竞品分析」后即可在此查看、复制。")}
            />
          )}
        </div>
      ),
    },
  ];

  const canvas = <ResultCanvas tabs={tabs} active="report" onChange={() => {}} />;

  const schema: OpsSchema = {
    agentId: "bizdev.competition",
    title: "竞品分析",
    fields: [
      { key: "product", label: "产品/品类", type: "text" },
      { key: "market", label: "目标市场", type: "text" },
      { key: "mine", label: "自家产品信息", type: "longtext" },
      { key: "rivals", label: "竞品信息", type: "longtext", hint: "用户粘贴的竞品 listing/参数/报价等素材" },
      { key: "dimension", label: "对比维度", type: "text" },
      { key: "report", label: "竞品分析报告", type: "longtext" },
    ],
    actions: [],
  };

  const getState = (): Record<string, unknown> => ({ product, market, mine, rivals, dimension });

  const applyPatch = (patch: OpsPatch) => {
    const s = patch.set || {};
    if (typeof s.product === "string") setProduct(s.product);
    if (typeof s.market === "string") setMarket(s.market);
    if (typeof s.mine === "string") setMine(s.mine);
    if (typeof s.rivals === "string") setRivals(s.rivals);
    if (typeof s.dimension === "string") setDimension(s.dimension);
    if (typeof s.report === "string") setReport(s.report);
  };

  return { ops, canvas, schema, getState, applyPatch };
}
