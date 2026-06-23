"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  OperatorConsole,
  FunctionAgentChat,
  useWorkspaceSelection,
  type ConsoleFunction,
} from "@oceanleo/ui/shell";
import type { OpsPatch, OpsSchema } from "@oceanleo/ui/lib";
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
const DEFAULT_FN: FnId = "reply";

function normalizeFn(raw: string | null): FnId {
  return (FN_IDS as readonly string[]).includes(raw ?? "") ? (raw as FnId) : DEFAULT_FN;
}

export default function ConsoleClient() {
  const router = useRouter();
  const search = useSearchParams();
  const [fn, setFn] = useState<FnId>(() => normalizeFn(search.get("fn")));
  const [authOpen, setAuthOpen] = useState(false);
  const embed = search.get("embed") === "1";
  // solo=1（主站工作台 iframe 内嵌单个功能区）：隐藏顶部功能区按键条。
  const solo = search.get("solo") === "1";

  const onNeedAuth = useCallback(() => setAuthOpen(true), []);

  // doctrine v4：非内嵌时（本站有侧栏），功能区名称在侧栏子栏（ConsoleFnSubNav）。
  const [sel, setSel] = useWorkspaceSelection("workspace");

  useEffect(() => {
    const next = normalizeFn(search.get("fn"));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFn((cur) => (cur === next ? cur : next));
  }, [search]);

  useEffect(() => {
    if (embed) return;
    if (sel !== fn) setSel(fn);
  }, [fn, embed, sel, setSel]);

  const selectFn = useCallback(
    (id: string) => {
      const next = normalizeFn(id);
      setFn(next);
      const base = embed ? "/workspace?embed=1" : "/workspace";
      const qs = next === DEFAULT_FN ? base : `${base}${embed ? "&" : "?"}fn=${next}`;
      router.replace(qs, { scroll: false });
    },
    [router, embed],
  );

  useEffect(() => {
    if (embed || !sel || sel === fn) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    selectFn(sel);
  }, [sel, embed, fn, selectFn]);

  const reply = useReplyFn(onNeedAuth);
  const research = useResearchFn(onNeedAuth);
  const competition = useCompetitionFn(onNeedAuth);
  const devLetter = useDevLetterFn(onNeedAuth);
  const tradeTalk = useTradeTalkFn(onNeedAuth);

  // 把每个功能区的「操作台」用 FunctionAgentChat 包成「操作台 / agent」双形态。
  const wrap = useCallback(
    (
      agentId: string,
      schema: OpsSchema,
      opsContent: React.ReactNode,
      getOpsState: () => Record<string, unknown>,
      onApplyPatch: (p: OpsPatch) => void,
      onRunAction?: (id: string) => void,
    ) => (
      <FunctionAgentChat
        agentId={agentId}
        siteId={SITE_ID}
        schema={schema}
        accent={ACCENT}
        opsContent={opsContent}
        getOpsState={getOpsState}
        onApplyPatch={onApplyPatch}
        onRunAction={onRunAction}
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
        agentId: "bizdev.reply",
        ops: wrap("bizdev.reply", reply.schema, reply.ops, reply.getState, reply.applyPatch),
        canvas: reply.canvas,
      },
      {
        id: "research",
        label: "公司调研",
        icon: <IconResearch />,
        agentId: "bizdev.research",
        ops: wrap("bizdev.research", research.schema, research.ops, research.getState, research.applyPatch),
        canvas: research.canvas,
      },
      {
        id: "competition",
        label: "竞品分析",
        icon: <IconCompetition />,
        agentId: "bizdev.competition",
        ops: wrap("bizdev.competition", competition.schema, competition.ops, competition.getState, competition.applyPatch),
        canvas: competition.canvas,
      },
      {
        id: "dev-letter",
        label: "开发信",
        icon: <IconLetter />,
        agentId: "bizdev.dev-letter",
        ops: wrap("bizdev.dev-letter", devLetter.schema, devLetter.ops, devLetter.getState, devLetter.applyPatch),
        canvas: devLetter.canvas,
      },
      {
        id: "trade-talk",
        label: "外贸翻译",
        icon: <IconTranslate />,
        agentId: "bizdev.trade-talk",
        ops: wrap("bizdev.trade-talk", tradeTalk.schema, tradeTalk.ops, tradeTalk.getState, tradeTalk.applyPatch),
        canvas: tradeTalk.canvas,
      },
    ],
    [wrap, reply, research, competition, devLetter, tradeTalk],
  );

  return (
    <>
      <OperatorConsole
        functions={functions}
        value={fn}
        onChange={selectFn}
        accent={ACCENT}
        opsWidth={460}
        hideTabs={solo || !embed}
      />
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
    </>
  );
}
