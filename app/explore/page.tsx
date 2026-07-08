"use client";

// {site}.oceanleo.com —— 侧栏「探索」页（宗旨 v19，操作员 2026-07-08）。
// 整站级素材浏览：本站相关的 asset.oceanleo.com 自囤 OSS 正式库素材，masonry 瀑布流 +
// 分类 chips。共享 <ExplorePage> 单一事实源；本站只声明素材 type 与标题文案。
import { ExplorePage } from "@oceanleo/ui/shell";
import { SITE_ACCENT } from "@/components/SiteShell";

export default function ExplorePageRoute() {
  return <ExplorePage config={{ type: "image", title: "探索 · 商务素材", subtitle: "商务、外贸、办公场景素材，写商务沟通找灵感。" }} accent={SITE_ACCENT} />;
}
