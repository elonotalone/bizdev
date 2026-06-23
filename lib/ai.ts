"use client";

import { GATEWAY_BASE, SITE_ID } from "./gateway";
import { accessToken } from "./oceanleo-auth";

// Thin chat client against the unified gateway. All AI features on this site
// (智能回复 / 公司调研 / 竞品分析 / 开发信 / 外贸翻译) go through /v1/chat with
// site_id=bizdev. Billing is automatic via the gateway (nano-yuan wallet).

export class AiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "AiError";
  }
}

export async function aiChat(input: {
  system?: string;
  messages: { role: "user" | "assistant" | "system"; content: string }[];
  max_tokens?: number;
  temperature?: number;
}): Promise<string> {
  const token = await accessToken();
  if (!token) {
    throw new AiError(401, "请先登录 OceanLeo 账号再使用 AI 功能。");
  }
  let res: Response;
  try {
    res = await fetch(`${GATEWAY_BASE}/v1/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        site_id: SITE_ID,
        provider: "bailian",
        key_mode: "platform",
        system: input.system,
        messages: input.messages,
        max_tokens: input.max_tokens ?? 2000,
        temperature: input.temperature,
      }),
    });
  } catch {
    throw new AiError(0, "网络错误：无法连接 AI 网关。");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new AiError(
      res.status,
      (data as { detail?: string })?.detail || `请求失败（HTTP ${res.status}）`,
    );
  }
  return (data as { text?: string }).text || "";
}
