"use client";

import { BayPage } from "@oceanleo/ui/shell";
import { SITE_ACCENT } from "@/components/SiteShell";

export default function BayPageRoute() {
  return <BayPage siteKey="bizdev" accent={SITE_ACCENT} />;
}
