"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  OperatorConsole,
  FunctionAgentChat,
  type ConsoleFunction,
} from "@oceanleo/ui/shell";
import type { OpsSchema } from "@oceanleo/ui/lib";
import { useUI } from "@oceanleo/ui/i18n";
import { AuthModal } from "@/components/AuthModal";
import {
  IconReply,
  IconResearch,
  IconCompetition,
  IconLetter,
  IconTranslate,
} from "./icons";
import { useReplyFn } from "./useReplyFn";
import { useResearchFn } from "./useResearchFn";
import { useCompetitionFn } from "./useCompetitionFn";
import { useDevLetterFn } from "./useDevLetterFn";
import { useTradeTalkFn } from "./useTradeTalkFn";

const ACCENT = "#0e7490";
const SITE_ID = "bizdev";

// 外贸出海 单页操作台：顶部功能按键「智能回复 / 公司调研 / 竞品分析 / 开发信 / 外贸翻译」
// 翻页切换。doctrine v3：每个功能区有专属 agent，左栏「操作台 / agent」双形态。
// ?fn=<id> 深链同步到 URL；?embed=1 时隐藏外壳，只渲染该功能区（供主站工作台 iframe 内嵌）。
const FN_IDS = ["reply", "research", "competition", "dev-letter", "trade-talk"] as const;
type FnId = (typeof FN_IDS)[number];

function validFn(raw: string | null): FnId | "" {
  return (FN_IDS as readonly string[]).includes(raw ?? "") ? (raw as FnId) : "";
}

export default function ConsoleClient() {
  const tt = useUI();
  const router = useRouter();
  const search = useSearchParams();
  const [authOpen, setAuthOpen] = useState(false);
  const embed = search.get("embed") === "1";
  // solo=1（主站工作台 iframe 内嵌单个功能区）：隐藏顶部功能区按键条。
  const solo = search.get("solo") === "1";

  const onNeedAuth = useCallback(() => setAuthOpen(true), []);

  // 宗旨 v10.1（2026-06-28）：功能选择的**单一事实源 = URL `?fn=`**。删掉 v4 的
  // useWorkspaceSelection 侧栏子栏同步（避免 fn↔sel 环触发 RSC 请求风暴）。
  //   有合法 ?fn= → 进入该功能区（卡片打开）；无 → 空（显示卡片目录）。
  const activeFn = validFn(search.get("fn"));

  // 选功能区（点卡片）/ 返回目录（id=""）→ 只写 URL。打开任一功能区都显式带 ?fn=
  // （默认功能也带），从而与「无 ?fn= = 目录页」区分开。
  const selectFn = useCallback(
    (id: string) => {
      const base = embed ? "/workspace?embed=1" : "/workspace";
      const next = validFn(id);
      if (!next) {
        router.replace(base, { scroll: false });
        return;
      }
      router.replace(`${base}${embed ? "&" : "?"}fn=${next}`, { scroll: false });
    },
    [router, embed],
  );

  const reply = useReplyFn(onNeedAuth);
  const research = useResearchFn(onNeedAuth);
  const competition = useCompetitionFn(onNeedAuth);
  const devLetter = useDevLetterFn(onNeedAuth);
  const tradeTalk = useTradeTalkFn(onNeedAuth);

  // 把每个功能区的「操作台」用 FunctionAgentChat 包成「操作台 / agent」双形态。
  // 宗旨 v10：agent 与操作台独立，不读/不写操作台 state，故不再传 getOpsState/
  // onApplyPatch/onRunAction（共享包已标 @deprecated 不再调用）。
  const wrap = useCallback(
    (agentId: string, schema: OpsSchema, opsContent: React.ReactNode) => (
      <FunctionAgentChat
        agentId={agentId}
        siteId={SITE_ID}
        schema={schema}
        accent={ACCENT}
        opsContent={opsContent}
      />
    ),
    [],
  );

  const functions: ConsoleFunction[] = useMemo(
    () => [
      {
        id: "reply",
        label: "智能回复",
        icon: <IconReply />,
        tagline: "客户邮件 / 询盘智能回复",
        capabilities: "读懂客户邮件、询盘，生成得体的多语种回复草稿。",
        agentId: "bizdev.reply",
        ops: wrap("bizdev.reply", reply.schema, reply.ops),
        canvas: reply.canvas,
      },
      {
        id: "research",
        label: "公司调研",
        icon: <IconResearch />,
        tagline: "目标客户公司背景调研",
        capabilities: "调研目标客户公司背景、规模、采购偏好与联系人。",
        agentId: "bizdev.research",
        ops: wrap("bizdev.research", research.schema, research.ops),
        canvas: research.canvas,
      },
      {
        id: "competition",
        label: "竞品分析",
        icon: <IconCompetition />,
        tagline: "竞品对比 · 差异化卖点",
        capabilities: "对比竞品价格 / 卖点，输出差异化策略与话术。",
        agentId: "bizdev.competition",
        ops: wrap("bizdev.competition", competition.schema, competition.ops),
        canvas: competition.canvas,
      },
      {
        id: "dev-letter",
        label: "开发信",
        icon: <IconLetter />,
        tagline: "高回复率开发信撰写",
        capabilities: "按客户与产品生成高回复率的多语种开发信。",
        agentId: "bizdev.dev-letter",
        ops: wrap("bizdev.dev-letter", devLetter.schema, devLetter.ops),
        canvas: devLetter.canvas,
      },
      {
        id: "trade-talk",
        label: "外贸翻译",
        icon: <IconTranslate />,
        tagline: "外贸场景专业翻译",
        capabilities: "外贸邮件 / 合同 / 术语的专业双向翻译与润色。",
        agentId: "bizdev.trade-talk",
        ops: wrap("bizdev.trade-talk", tradeTalk.schema, tradeTalk.ops),
        canvas: tradeTalk.canvas,
      },
    ],
    [wrap, reply, research, competition, devLetter, tradeTalk],
  );

  return (
    <>
      <OperatorConsole
        functions={functions}
        value={activeFn || undefined}
        onChange={selectFn}
        accent={ACCENT}
        opsWidth={460}
        hideTabs={solo || embed}
        directory={!embed}
        directoryTitle={tt("LeoBizDev 工作台")}
        directorySubtitle={tt("选一个功能开始——点开后右上角可「返回」切换。")}
        siteId={SITE_ID}
      />
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
    </>
  );
}
