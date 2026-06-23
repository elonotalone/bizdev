"use client";

import { useState } from "react";
import { StudioSection, ResultCanvas, CanvasEmpty, Markdown, type CanvasTab } from "@oceanleo/ui/shell";
import type { OpsPatch, OpsSchema } from "@oceanleo/ui/lib";
import { aiChat, AiError } from "@/lib/ai";
import { useUser } from "@/lib/useUser";

const ACCENT = "#0e7490";

const inputCls =
  "w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100";

const ROLE_PRESETS = [
  "高级销售经理：专业、自信、导向成交",
  "技术专家：严谨、客观、详细参数",
  "售后客服：亲切、耐心、解决问题",
  "简明扼要：只回答核心结论，无废话",
];

// 智能回复功能区（旧 ReplyAssistant 的 A 类核心，gateway-native）：粘贴客户消息 →
// AI 给「理解与对策」+ 生成专业回复，可选 email/whatsapp、可指定角色语气、可润色。
// 旧版的「全网检索 / 文件库 RAG / 客户大师」依赖 trade-engine + Twenty 表，本轮 deferred。
export function useReplyFn(onNeedAuth: () => void): {
  ops: React.ReactNode;
  canvas: React.ReactNode;
  schema: OpsSchema;
  getState: () => Record<string, unknown>;
  applyPatch: (patch: OpsPatch) => void;
} {
  const { user } = useUser();
  const [open, setOpen] = useState<"customer" | "idea" | "tone" | null>("customer");
  const toggle = (s: "customer" | "idea" | "tone") =>
    setOpen((cur) => (cur === s ? null : s));

  const [customerMsg, setCustomerMsg] = useState("");
  const [answerIdea, setAnswerIdea] = useState("");
  const [role, setRole] = useState(ROLE_PRESETS[0]);
  const [replyType, setReplyType] = useState<"email" | "whatsapp">("email");

  const [understanding, setUnderstanding] = useState("");
  const [reply, setReply] = useState("");
  const [activeTab, setActiveTab] = useState("reply");
  const [busy, setBusy] = useState(false);
  const [busyKind, setBusyKind] = useState<"understanding" | "reply" | "refine" | null>(null);
  const [refine, setRefine] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const styleHint =
    replyType === "whatsapp"
      ? "WhatsApp 短消息风格：简洁、口语、可用少量 emoji，分短段。"
      : "正式商务邮件风格：有称呼/正文/结尾署名占位，结构清晰。";

  const genUnderstanding = async () => {
    setError(null);
    if (!customerMsg.trim()) {
      setError("请先粘贴客户的问题或消息。");
      return;
    }
    if (!user) return onNeedAuth();
    setBusy(true);
    setBusyKind("understanding");
    try {
      const text = await aiChat({
        system:
          "你是资深外贸销售顾问。请用中文输出对客户消息的「理解与对策」：①客户真实意图与潜台词；②风险/机会点；③回复策略要点（3-5 条）。简洁、可执行，不写最终回复正文。",
        messages: [
          {
            role: "user",
            content: `客户消息：\n${customerMsg.trim()}\n\n我的角色设定：${role}\n${
              answerIdea.trim() ? `我的初步思路：${answerIdea.trim()}` : ""
            }`,
          },
        ],
      });
      setUnderstanding(text.trim());
      setActiveTab("understanding");
    } catch (e) {
      if (e instanceof AiError && e.status === 401) onNeedAuth();
      else setError(e instanceof Error ? e.message : "生成失败，请重试。");
    } finally {
      setBusy(false);
      setBusyKind(null);
    }
  };

  const genReply = async () => {
    setError(null);
    if (!customerMsg.trim() && !answerIdea.trim()) {
      setError("请至少粘贴客户消息或填写你的回答思路。");
      return;
    }
    if (!user) return onNeedAuth();
    setBusy(true);
    setBusyKind("reply");
    try {
      const text = await aiChat({
        system: `你是资深外贸销售，擅长写专业、真诚、推进成交的客户回复。只输出可直接发送的回复正文，不要解释。${styleHint}`,
        messages: [
          {
            role: "user",
            content: `请基于以下信息生成给客户的回复（语言与客户消息一致，若客户为英文则用英文）：

客户消息：
${customerMsg.trim() || "（未提供，请基于思路组织）"}

${understanding.trim() ? `理解与对策：\n${understanding.trim()}\n` : ""}
${answerIdea.trim() ? `我的回答思路：\n${answerIdea.trim()}\n` : ""}
角色与语气：${role}`,
          },
        ],
      });
      setReply(text.trim());
      setActiveTab("reply");
    } catch (e) {
      if (e instanceof AiError && e.status === 401) onNeedAuth();
      else setError(e instanceof Error ? e.message : "生成失败，请重试。");
    } finally {
      setBusy(false);
      setBusyKind(null);
    }
  };

  const refineReply = async () => {
    setError(null);
    if (!reply.trim()) {
      setError("请先生成一版回复，再进行优化。");
      return;
    }
    if (!refine.trim()) {
      setError("请填写你的修改建议。");
      return;
    }
    if (!user) return onNeedAuth();
    setBusy(true);
    setBusyKind("refine");
    try {
      const text = await aiChat({
        system: `你是资深外贸销售。请根据用户的修改建议优化下面这版回复，只输出优化后的回复正文。${styleHint}`,
        messages: [
          {
            role: "user",
            content: `当前回复：\n${reply.trim()}\n\n修改建议：${refine.trim()}`,
          },
        ],
      });
      setReply(text.trim());
      setRefine("");
      setActiveTab("reply");
    } catch (e) {
      if (e instanceof AiError && e.status === 401) onNeedAuth();
      else setError(e instanceof Error ? e.message : "优化失败，请重试。");
    } finally {
      setBusy(false);
      setBusyKind(null);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(reply);
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
        title="客户消息"
        accent={ACCENT}
        open={open === "customer"}
        onToggle={() => toggle("customer")}
        summary={customerMsg ? "已填写" : "粘贴客户邮件/WhatsApp"}
      >
        <textarea
          className={`${inputCls} min-h-32 resize-y`}
          placeholder="粘贴客户提出的问题/邮件/WhatsApp 消息…"
          value={customerMsg}
          onChange={(e) => setCustomerMsg(e.target.value)}
        />
        <button
          type="button"
          onClick={() => void genUnderstanding()}
          disabled={busy || !customerMsg.trim()}
          className="mt-2 rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-xs font-medium text-cyan-700 transition hover:bg-cyan-100 disabled:opacity-50"
        >
          {busyKind === "understanding" ? "生成中…" : "AI 生成「理解与对策」"}
        </button>
      </StudioSection>

      <StudioSection
        index={2}
        title="我的思路（可选）"
        accent={ACCENT}
        open={open === "idea"}
        onToggle={() => toggle("idea")}
        summary={answerIdea ? "已填写" : "可选"}
      >
        <textarea
          className={`${inputCls} min-h-24 resize-y`}
          placeholder="你想表达的要点 / 报价 / 交期 / 条件等（可选）"
          value={answerIdea}
          onChange={(e) => setAnswerIdea(e.target.value)}
        />
      </StudioSection>

      <StudioSection
        index={3}
        title="角色与渠道"
        accent={ACCENT}
        open={open === "tone"}
        onToggle={() => toggle("tone")}
        summary={`${role.split("：")[0]} · ${replyType === "email" ? "邮件" : "WhatsApp"}`}
      >
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {ROLE_PRESETS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                title={r}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  role === r
                    ? "bg-cyan-700 text-white"
                    : "border border-stone-300 text-stone-600 hover:bg-stone-50"
                }`}
              >
                {r.split("：")[0]}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {(["email", "whatsapp"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setReplyType(t)}
                className={`rounded-xl border px-4 py-2 text-xs font-medium transition ${
                  replyType === t
                    ? "border-cyan-300 bg-cyan-50 text-cyan-900"
                    : "border-stone-300 text-stone-600 hover:bg-stone-50"
                }`}
              >
                {t === "email" ? "📧 邮件回复" : "💬 WhatsApp 短回复"}
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
        onClick={() => void genReply()}
        disabled={busy}
        className="w-full rounded-2xl px-4 py-3 text-sm font-bold text-white shadow-md transition hover:opacity-90 disabled:opacity-50"
        style={{ background: "linear-gradient(135deg, var(--grad-from), var(--grad-to))" }}
      >
        {busyKind === "reply" ? "AI 撰写中…" : "生成客户回复 ✦"}
      </button>
    </div>
  );

  const tabs: CanvasTab[] = [
    {
      id: "reply",
      label: "客户回复",
      content: (
        <div className="flex h-full flex-col">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-stone-800">生成结果（可编辑）</h2>
            <button
              type="button"
              onClick={() => void copy()}
              disabled={!reply}
              className="rounded-full border border-stone-300 px-3.5 py-1 text-xs font-medium text-stone-600 transition hover:bg-stone-50 disabled:opacity-40"
            >
              {copied ? "已复制 ✓" : "复制全文"}
            </button>
          </div>
          {busyKind === "reply" && !reply ? (
            <div className="grid flex-1 place-items-center py-16">
              <div className="text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-[3px] border-cyan-200 border-t-cyan-600" />
                <p className="mt-3 text-xs text-stone-400">正在撰写专业回复…</p>
              </div>
            </div>
          ) : reply ? (
            <div className="flex flex-1 flex-col gap-3">
              <textarea
                className="min-h-[18rem] flex-1 resize-y rounded-xl border border-stone-200 bg-stone-50/50 p-4 text-sm leading-relaxed outline-none focus:border-cyan-400"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
              />
              <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3">
                <div className="mb-2 text-xs font-semibold text-amber-800">🔄 继续优化</div>
                <textarea
                  className={`${inputCls} min-h-16 resize-y`}
                  placeholder="例如：语气更友好 / 增加技术细节 / 更简短 / 更正式…"
                  value={refine}
                  onChange={(e) => setRefine(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => void refineReply()}
                  disabled={busy || !refine.trim()}
                  className="mt-2 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-amber-700 disabled:opacity-50"
                >
                  {busyKind === "refine" ? "重新生成中…" : "按建议重写"}
                </button>
              </div>
            </div>
          ) : (
            <CanvasEmpty
              title="客户回复会显示在这里"
              hint="粘贴客户消息、选好角色与渠道，点「生成客户回复」后即可在此编辑、复制。"
            />
          )}
        </div>
      ),
    },
    {
      id: "understanding",
      label: "理解与对策",
      content: (
        <div className="flex h-full flex-col">
          <h2 className="mb-3 text-sm font-bold text-stone-800">理解与对策</h2>
          {busyKind === "understanding" && !understanding ? (
            <div className="grid flex-1 place-items-center py-16">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-[3px] border-cyan-200 border-t-cyan-600" />
            </div>
          ) : understanding ? (
            <div className="prose prose-sm max-w-none flex-1 overflow-y-auto rounded-xl border border-stone-200 bg-stone-50/50 p-4">
              <Markdown>{understanding}</Markdown>
            </div>
          ) : (
            <CanvasEmpty
              title="客户意图分析会显示在这里"
              hint="在「客户消息」里点「AI 生成理解与对策」，先读懂客户，再生成回复。"
            />
          )}
        </div>
      ),
    },
  ];

  const canvas = <ResultCanvas tabs={tabs} active={activeTab} onChange={setActiveTab} />;

  const schema: OpsSchema = {
    agentId: "bizdev.reply",
    title: "智能回复",
    fields: [
      { key: "customerMsg", label: "客户消息", type: "longtext", hint: "客户的邮件/WhatsApp/询盘原文" },
      { key: "answerIdea", label: "我的思路", type: "longtext" },
      {
        key: "role", label: "角色与语气", type: "enum",
        enumValues: ROLE_PRESETS.map((r) => ({ value: r, label: r.split("：")[0] })),
      },
      {
        key: "replyType", label: "渠道", type: "enum",
        enumValues: [
          { value: "email", label: "邮件" },
          { value: "whatsapp", label: "WhatsApp" },
        ],
      },
      { key: "understanding", label: "理解与对策", type: "longtext" },
      { key: "reply", label: "回复正文", type: "longtext" },
    ],
    actions: [],
  };

  const getState = (): Record<string, unknown> => ({
    customerMsg, answerIdea, role, replyType, understanding, reply,
  });

  const applyPatch = (patch: OpsPatch) => {
    const s = patch.set || {};
    if (typeof s.customerMsg === "string") setCustomerMsg(s.customerMsg);
    if (typeof s.answerIdea === "string") setAnswerIdea(s.answerIdea);
    if (typeof s.role === "string") setRole(s.role);
    if (s.replyType === "email" || s.replyType === "whatsapp") setReplyType(s.replyType);
    if (typeof s.understanding === "string") setUnderstanding(s.understanding);
    if (typeof s.reply === "string") setReply(s.reply);
  };

  return { ops, canvas, schema, getState, applyPatch };
}
