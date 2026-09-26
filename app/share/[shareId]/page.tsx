"use client";

// 分站也提供公开对话页，让本站复制的分享链接可直接匿名阅读。

import { AgentReplayPage } from "@oceanleo/ui/shell/replay";
import { useParams } from "next/navigation";

export default function SharedTranscriptRoute() {
  const params = useParams();
  const raw = params?.shareId;
  const shareId = String(Array.isArray(raw) ? raw[0] : raw || "");
  return <AgentReplayPage shareId={shareId} playback={false} />;
}
