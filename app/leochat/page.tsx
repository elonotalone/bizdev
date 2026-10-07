"use client";

import { LeoChatPage } from "@oceanleo/ui/shell";
import { SITE_ACCENT } from "@/components/SiteShell";

export default function LeoChatPageRoute() {
  return <LeoChatPage siteKey="bizdev" accent={SITE_ACCENT} />;
}
