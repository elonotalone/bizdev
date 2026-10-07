import type { Metadata } from "next";

// LeoChat 整页（聊天 / 联系人 / LeoBay）是登录后的私人内容，不收录。
export const metadata: Metadata = {
  title: "LeoChat",
  robots: { index: false, follow: false },
};

export default function LeoChatLayout({ children }: { children: React.ReactNode }) {
  return children;
}
