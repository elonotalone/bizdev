"use client";

import { LibraryDetail } from "@oceanleo/ui/shell";
import { SITE_ACCENT } from "@/components/SiteShell";

// 全站文件统一由共享 LibraryDetail / MyLibrary 加载；本站 SiteShell 已在根 layout。

export default function LibraryPage() {
  return <LibraryDetail accent={SITE_ACCENT} />;
}
