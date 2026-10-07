"use client";

import { BayPage, registerSiteAppDirectory } from "@oceanleo/ui/shell";
import { SITE_ACCENT } from "@/components/SiteShell";
import { BIZDEV_APPS } from "@/lib/app-catalog";

// LeoBay 的「素材」栏按本站 app 目录分区（原来由 /explore 页注册）。
registerSiteAppDirectory("bizdev", BIZDEV_APPS);

export default function BayPageRoute() {
  return <BayPage siteKey="bizdev" accent={SITE_ACCENT} />;
}
