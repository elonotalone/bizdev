"use client";

import { LibraryDetail } from "@oceanleo/ui/shell";
import { LIBRARY_SITES, SITE_ACCENT, SITE_ID } from "@/components/SiteShell";

// resume.oceanleo.com —— 「文件库」（doctrine v4 master-detail）。四分区在侧栏，主区
// 受控 FileLibrary（上传 + 跨站分区）。本站 SiteShell 在根 layout 已包裹。

export default function LibraryPage() {
  return <LibraryDetail siteId={SITE_ID} siteName="LeoResume" sites={LIBRARY_SITES} accent={SITE_ACCENT} />;
}
