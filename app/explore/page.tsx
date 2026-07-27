"use client";

// {site}.oceanleo.com —— 侧栏「探索」页（宗旨 v19，操作员 2026-07-08）。
// 合同 §0.6 三段式：`/explore` = 本站素材 ｜ 更多素材；`/explore?app=<appId>` 再加一段
// 「此 app」。分段与 `?app=` 由共享 <ExplorePage> 自己解析，本站只声明 siteKey、素材
// type 与标题文案。
//
// 本站产物是商务文书（artifactType `document`），用 W5 本轮新增的 `document` 取值。
import { ExplorePage } from "@oceanleo/ui/shell";
import { SITE_ACCENT } from "@/components/SiteShell";

export default function ExplorePageRoute() {
  return <ExplorePage siteKey="bizdev" config={{ types: ["document"], title: "探索 · 商务素材", subtitle: "先看本站的商务文书成品，再按需翻更多素材。" }} accent={SITE_ACCENT} />;
}
