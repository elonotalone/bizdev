"use client";

import { useState } from "react";
import { HomeIntro, AgentChat, type AgentAttachment } from "@oceanleo/ui/shell";

// bizdev.oceanleo.com —— 「首页」（2026-06-19 宗旨）。介绍 + 大输入框；提交后就地进入
// 对话型 agent。固定操控（智能回复 / 公司调研 / 竞品分析 / 开发信 / 外贸翻译）在左侧
// 「工作台」。

const ACCENT = "#0e7490";

export default function Home() {
  const [start, setStart] = useState<{ p: string; agentId?: string; attachments?: AgentAttachment[] } | null>(null);
  // alignment §3-1：首页与对话都常驻挂载，用 viewing 切显隐——点「返回」回首页不中止对话。
  const [viewing, setViewing] = useState(false);
  return (
    <>
      <div style={viewing ? { display: "none" } : undefined}>
        <HomeIntro
          siteId="bizdev"
          siteName="LeoBizDev"
          accent={ACCENT}
          intro="LeoBizDev 是 OceanLeo 的外贸/出海 AI 工作台：把客户邮件读懂并写出专业回复、对目标公司做商业画像调研、对竞品做差异化对比、写有针对性的外贸开发信、做外贸语境的翻译与本地化。直接说出你的外贸场景，agent 会帮你完成；想用规范化操作台逐区填写，去左侧「工作台」。"
          suggestions={[
            "帮我读懂这封客户询盘并写一封专业的英文回复",
            "根据这段公司资料，给我一份目标客户的调研报告与合作切入点",
            "给做户外储能的工厂写一封冷启动外贸开发信，突出认证与交期",
          ]}
          onStart={(p, opts) => {
            setStart({ p, agentId: opts?.agentId, attachments: opts?.attachments });
            setViewing(true);
          }}
        />
      </div>
      {start && (
        <div style={viewing ? undefined : { display: "none" }}>
          <AgentChat
            key={start.p}
            siteId="bizdev"
            initialPrompt={start.p}
            initialAttachments={start.attachments}
            agentId={start.agentId}
            mode="agent"
            accent={ACCENT}
            onBack={() => setViewing(false)}
          />
        </div>
      )}
    </>
  );
}
