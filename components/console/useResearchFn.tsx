"use client";

import { useState } from "react";
import { StudioSection, CanvasEmpty, Markdown, LeoComposer, type CanvasTab } from "@oceanleo/ui/shell";
import { LibraryCanvas } from "./LibraryCanvas";
import type { OpsPatch, OpsSchema } from "@oceanleo/ui/lib";
import { useUI } from "@oceanleo/ui/i18n";
import { aiChat, AiError } from "@/lib/ai";
import { useUser } from "@/lib/useUser";

const ACCENT = "#0e7490";

const inputCls =
  "w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100";

const FOCUS_TAGS = ["商业模式", "市场地位", "核心竞争力", "决策人画像", "合作切入点", "潜在风险"];

// 公司调研功能区（旧 PartnershipAnalyzer/CompanyResearch 的 A 类核心）：用户粘贴目标
// 公司资料/官网文案 → AI 输出结构化调研报告。旧版「自动抓官网/LinkedIn/新闻」依赖
// trade-engine（Playwright/Serper），本轮 deferred —— 这里由用户提供素材，AI 做分析。
export function useResearchFn(onNeedAuth: () => void): {
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
  const [open, setOpen] = useState<"basic" | "material" | "focus" | null>("material");
  const toggle = (s: "basic" | "material" | "focus") =>
    setOpen((cur) => (cur === s ? null : s));

  const [company, setCompany] = useState("");
  const [website, setWebsite] = useState("");
  const [material, setMaterial] = useState("");
  // 宗旨 v15/v19：主输入字段「公司资料」走模板实填（点导航卡灌 highlightTemplate）。
  const [materialTemplate, setMaterialTemplate] = useState<string | null>(null);
  const [focus, setFocus] = useState("");
  const [report, setReport] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    setError(null);
    if (!company.trim() && !material.trim()) {
      setError("请至少填写公司名称或粘贴公司资料。");
      return;
    }
    if (!user) return onNeedAuth();
    setBusy(true);
    try {
      const text = await aiChat({
        max_tokens: 3000,
        system:
          "你是资深外贸商务分析师。基于用户提供的公司资料做结构化调研报告（Markdown）。只依据所给素材推理，不要编造未提供的具体数字/事实；信息不足处标注「需补充」。报告含：① 公司概览；② 商业模式与主营；③ 市场地位与目标客户；④ 核心竞争力；⑤ 关键决策人/采购线索（若素材中有）；⑥ 对我方的合作切入点与开发建议；⑦ 潜在风险。",
        messages: [
          {
            role: "user",
            content: `目标公司：${company.trim() || "（见素材）"}
${website.trim() ? `官网：${website.trim()}` : ""}
${focus.trim() ? `重点关注：${focus.trim()}` : ""}

公司资料/官网文案/已知信息：
${material.trim() || "（未提供更多素材，请基于公司名与行业常识给出框架性分析并标注需补充项）"}`,
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
      {/* 宗旨 v19：操作台最上面 = 自由输入框（公司资料主字段），点右侧导航卡片灌模板实填。 */}
      <StudioSection
        index={1}
        title={tt("公司资料（粘贴素材）")}
        accent={ACCENT}
        open={open === "material"}
        onToggle={() => toggle("material")}
        summary={material ? "已粘贴" : "官网文案/简介/邮件等"}
      >
        <LeoComposer
          value={material}
          onChange={setMaterial}
          leoSuggest
          highlightTemplate={materialTemplate}
          accentColor={ACCENT}
          placeholder={tt("把目标公司的官网 About/产品页文案、公司简介、领英资料、往来邮件等粘贴到这里，AI 基于这些做分析。")}
        />
        <p className="mt-2 text-xs text-stone-400">
          提示：本功能基于你提供的素材分析；「自动联网抓取官网/领英/新闻」待后端部署后开放。
        </p>
      </StudioSection>

      <StudioSection
        index={2}
        title={tt("目标公司")}
        accent={ACCENT}
        open={open === "basic"}
        onToggle={() => toggle("basic")}
        summary={company || "公司名 / 官网"}
      >
        <div className="space-y-3">
          <input
            className={inputCls}
            placeholder={tt("目标公司名称")}
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
          <input
            className={inputCls}
            placeholder={tt("官网 URL（可选，供你参考）")}
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>
      </StudioSection>

      <StudioSection
        index={3}
        title={tt("关注点（可选）")}
        accent={ACCENT}
        open={open === "focus"}
        onToggle={() => toggle("focus")}
        summary={focus || "默认全面调研"}
      >
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {FOCUS_TAGS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setFocus((cur) => (cur.includes(t) ? cur : `${cur ? cur + "、" : ""}${t}`))}
                className="rounded-full border border-stone-300 px-3 py-1 text-xs font-medium text-stone-600 transition hover:bg-stone-50"
              >
                {t}
              </button>
            ))}
          </div>
          <input
            className={inputCls}
            placeholder={tt("自定义关注方向（可选）")}
            value={focus}
            onChange={(e) => setFocus(e.target.value)}
          />
        </div>
      </StudioSection>
    </div>
  );

  // 宗旨 v18：主按钮「生成调研报告」+ 错误提示恒定在操作台底部（FunctionAgentChat stickyAction）。
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
        {busy ? "AI 调研中…" : "生成调研报告 ✦"}
      </button>
    </div>
  );

  const tabs: CanvasTab[] = [
    {
      id: "report",
      label: "调研报告",
      content: (
        <div className="flex h-full flex-col">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-stone-800">{tt("调研报告")}</h2>
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
                <p className="mt-3 text-xs text-stone-400">正在分析「{company || "目标公司"}」…</p>
              </div>
            </div>
          ) : report ? (
            <div className="prose prose-sm max-w-none flex-1 overflow-y-auto rounded-xl border border-stone-200 bg-stone-50/50 p-4">
              <Markdown>{report}</Markdown>
            </div>
          ) : (
            <CanvasEmpty
              title={tt("调研报告会显示在这里")}
              hint={tt("填写公司、粘贴资料，点「生成调研报告」后即可在此查看、复制。")}
            />
          )}
        </div>
      ),
    },
  ];

  const canvas = <LibraryCanvas resultTabs={tabs} />;

  const schema: OpsSchema = {
    agentId: "bizdev.research",
    title: "公司调研",
    fields: [
      { key: "company", label: "目标公司", type: "text" },
      { key: "website", label: "官网", type: "text" },
      { key: "material", label: "公司资料", type: "longtext", hint: "用户粘贴的官网文案/简介/邮件等素材" },
      { key: "focus", label: "关注点", type: "text" },
      { key: "report", label: "调研报告", type: "longtext" },
    ],
    actions: [],
  };

  const getState = (): Record<string, unknown> => ({ company, website, material, focus });

  const applyPatch = (patch: OpsPatch) => {
    const s = patch.set || {};
    if (typeof s.company === "string") setCompany(s.company);
    if (typeof s.website === "string") setWebsite(s.website);
    // 主输入走模板实填：清空值 + 设模板 → LeoComposer 依 highlightTemplate 重新 seed。
    if (typeof s.material === "string") {
      setMaterial("");
      setMaterialTemplate(s.material);
    }
    if (typeof s.focus === "string") setFocus(s.focus);
    if (typeof s.report === "string") setReport(s.report);
  };

  // alignment §3-5：进/换成品 app 时重置本功能操作台（临时输入，安全清空）。
  const reset = () => {
    setOpen("material");
    setCompany("");
    setWebsite("");
    setMaterial("");
    setMaterialTemplate(null);
    setFocus("");
    setReport("");
    setError(null);
    setCopied(false);
  };

  return { ops, sticky, canvas, schema, getState, applyPatch, reset };
}
