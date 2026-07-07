"use client";

// ============================================================================
// bizdev.oceanleo.com 「工作台」— 宗旨 v14（成品 app 目录，操作员 2026-07-05）。
// 首页 = 一批【面向目的的成品外贸 app】卡片（询盘回复 / 开发信 / 客户公司调研 /
// 竞品对比报告 / 报价跟进信 / 外贸翻译 / 展会邀请函 …，见 lib/app-catalog.ts），
// 顶部横排 = 本站自定义场景词（询盘回复 / 客户开发 / 市场调研 / 竞品对标 / 多语沟通 /
// 成交跟进）。
//
// 引擎（方案 A）：全部成品按 engine 复用现成五引擎（智能回复 / 公司调研 / 竞品分析 /
// 开发信 / 外贸翻译）的 ops + canvas + 后端 agent，靠预置区分。每个成品库→导航区三个
// 模板板块，点一张即把该模板填进该引擎操作台的主字段。?fn=<appId> 深链；?embed/?solo
// 内嵌由主站控制。
// ============================================================================

import { useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  SiteCatalogConsole,
  FunctionAgentChat,
  type GoalApp,
} from "@oceanleo/ui/shell";
import type { OpsPatch, OpsSchema } from "@oceanleo/ui/lib";
import { useUI } from "@oceanleo/ui/i18n";
import { AuthModal } from "@/components/AuthModal";
import { useReplyFn } from "./useReplyFn";
import { useResearchFn } from "./useResearchFn";
import { useCompetitionFn } from "./useCompetitionFn";
import { useDevLetterFn } from "./useDevLetterFn";
import { useTradeTalkFn } from "./useTradeTalkFn";
import { BIZDEV_APPS, type BizdevApp, type BizdevEngine } from "@/lib/app-catalog";

const ACCENT = "#0e7490";
const SITE_ID = "bizdev";

// 每个引擎的「主自由文本字段」（灌预置 / 填模板卡用）。
const PRIMARY: Record<BizdevEngine, string> = {
  reply: "customerMsg",
  research: "material",
  competition: "rivals",
  "dev-letter": "selling",
  "trade-talk": "source",
};

export default function ConsoleClient() {
  const tt = useUI();
  const router = useRouter();
  const search = useSearchParams();
  const [authOpen, setAuthOpen] = useState(false);
  const embed = search.get("embed") === "1";
  const solo = search.get("solo") === "1";
  const onNeedAuth = useCallback(() => setAuthOpen(true), []);

  const rawFn = search.get("fn") || "";
  const embedFn = embed || solo ? rawFn || BIZDEV_APPS[0].id : undefined;

  // 五引擎接线 hook（无条件调用，满足 rules-of-hooks）。
  const reply = useReplyFn(onNeedAuth);
  const research = useResearchFn(onNeedAuth);
  const competition = useCompetitionFn(onNeedAuth);
  const devLetter = useDevLetterFn(onNeedAuth);
  const tradeTalk = useTradeTalkFn(onNeedAuth);

  const onChange = useCallback(
    (id: string) => {
      if (embed) return;
      const sp = new URLSearchParams();
      if (id) sp.set("fn", id);
      if (solo) sp.set("solo", "1");
      const qs = sp.toString();
      router.replace(qs ? `/workspace?${qs}` : "/workspace", { scroll: false });
    },
    [router, embed, solo],
  );

  const bindOf = useCallback(
    (
      eng: BizdevEngine,
    ): {
      schema: OpsSchema;
      ops: React.ReactNode;
      sticky: React.ReactNode;
      canvas: React.ReactNode;
      getState: () => Record<string, unknown>;
      applyPatch: (p: OpsPatch) => void;
      reset: () => void;
    } => {
      switch (eng) {
        case "research":
          return { schema: research.schema, ops: research.ops, sticky: research.sticky, canvas: research.canvas, getState: research.getState, applyPatch: research.applyPatch, reset: research.reset };
        case "competition":
          return { schema: competition.schema, ops: competition.ops, sticky: competition.sticky, canvas: competition.canvas, getState: competition.getState, applyPatch: competition.applyPatch, reset: competition.reset };
        case "dev-letter":
          return { schema: devLetter.schema, ops: devLetter.ops, sticky: devLetter.sticky, canvas: devLetter.canvas, getState: devLetter.getState, applyPatch: devLetter.applyPatch, reset: devLetter.reset };
        case "trade-talk":
          return { schema: tradeTalk.schema, ops: tradeTalk.ops, sticky: tradeTalk.sticky, canvas: tradeTalk.canvas, getState: tradeTalk.getState, applyPatch: tradeTalk.applyPatch, reset: tradeTalk.reset };
        default:
          return { schema: reply.schema, ops: reply.ops, sticky: reply.sticky, canvas: reply.canvas, getState: reply.getState, applyPatch: reply.applyPatch, reset: reply.reset };
      }
    },
    [reply, research, competition, devLetter, tradeTalk],
  );

  const renderOps = useCallback(
    (app: GoalApp) => {
      const eng = (app as BizdevApp).engine;
      const bind = bindOf(eng);
      return (
        <FunctionAgentChat
          agentId={`${SITE_ID}.${eng}`}
          siteId={SITE_ID}
          schema={bind.schema}
          accent={ACCENT}
          opsContent={bind.ops}
          stickyAction={bind.sticky}
          getOpsState={bind.getState}
          onApplyPatch={bind.applyPatch}
          opsPrimaryField={PRIMARY[eng]}
        />
      );
    },
    [bindOf],
  );

  const renderCanvas = useCallback(
    (app: GoalApp) => bindOf((app as BizdevApp).engine).canvas,
    [bindOf],
  );

  // alignment §3-5（宗旨 v15 决策 D）：进/换成品 app 时把操作台重置回干净态，修「进 A 填了
  // 内容 → 返回目录 → 进 B 仍显示 A」。旧 applyPreset（进入即灌预置）已是 deprecated no-op，
  // 反转为「进入即清」——五引擎字段皆为临时生成输入，各自 reset。
  const onEnterApp = useCallback(
    (app: GoalApp) => {
      bindOf((app as BizdevApp).engine).reset();
    },
    [bindOf],
  );

  const apps = useMemo(() => BIZDEV_APPS, []);

  return (
    <>
      <SiteCatalogConsole
        siteId={SITE_ID}
        apps={apps}
        renderOps={renderOps}
        renderCanvas={renderCanvas}
        onEnterApp={onEnterApp}
        accent={ACCENT}
        directoryTitle={tt("LeoBizDev 工作台")}
        directorySubtitle={tt("选一个成品开始——点开后右上角可「返回」换一个。")}
        value={embedFn}
        onChange={onChange}
        embed={embed}
        solo={solo}
      />
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
    </>
  );
}
