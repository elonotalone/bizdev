"use client";

// LeoChat 整页（聊天、联系人）。页面本体在共享包里；各站这份文件只差站 key。
import { LeoChatPage } from "@oceanleo/ui/shell";

export default function LeoChatPageRoute() {
  return <LeoChatPage siteKey="bizdev" />;
}
