"use client";

// 侧栏「探索」页（site key = `bizdev`）。**零配置**（01-decisions.md D6，
// 接口见 docs/work-logs/2026-07/oceanleo-site-materials-and-leoplay-ugc/
// W3-interface-explore-props.md §2）。
//
// 站点侧只提供两样东西：site key（逐字取自 scripts/oceanleo-sites.tsv）与本站的 app
// 目录数据。类型、分区、标题、副标题、空态文案、能力全部由共享包从 app 目录推导——
// 站内**一个字的能力配置都不许留**。以前每站手写的 `type` / `types` / `title` /
// `subtitle` / `emptyHint` 就是「一个站能用、另一个站不能用」的来源：写错一个 type
// 就把本站素材从自己的货架上筛没了（resume/law/notebook/med 都发生过）。
//
// `?app=<appId>` 由 <ExplorePage> 自己从 URL 读，站点不必再解析 window.location。
//
// 本页形状由 scripts/oceanleo-capability-parity-gate.sh [C4] 逐字看着，改回旧形状即 CI 红。

import { ExplorePage, registerSiteAppDirectory } from "@oceanleo/ui/shell";
import { SITE_ACCENT } from "@/components/SiteShell";
import { BIZDEV_APPS } from "@/lib/app-catalog";

// 把本站 app 目录交给共享包：探索页的分区轴就是工作台的 scenes（D2），
// 同一份数据同时喂两处，站内不许维护第二份分类表。模块作用域调用而不是
// useEffect —— SSR 与 CSR 必须拿到同一份目录，否则首屏没有分区。
registerSiteAppDirectory("bizdev", BIZDEV_APPS);

export default function ExplorePageRoute() {
  return <ExplorePage siteKey="bizdev" accent={SITE_ACCENT} />;
}
