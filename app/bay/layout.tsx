import type { Metadata } from "next";
import { headers } from "next/headers";
import { CONFIGURED_DOMAIN_FAMILY, domainFamilyProfile, familyForHost } from "@oceanleo/ui/contracts";

export async function generateMetadata(): Promise<Metadata> {
  const host = (await headers()).get("host");
  const profile = domainFamilyProfile(CONFIGURED_DOMAIN_FAMILY ?? familyForHost(host));
  const canonical = `${String(profile.portalOrigin || "").replace(/\/+$/, "")}/bay`;
  return {
    robots: { index: false, follow: false },
    alternates: { canonical },
  };
}

export default function BayLayout({ children }: { children: React.ReactNode }) {
  return children;
}
