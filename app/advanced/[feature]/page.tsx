import { Suspense } from "react";
import { AdvancedFeatureRoute } from "@oceanleo/ui/shell";

export const dynamic = "force-dynamic";

export default function AdvancedFeaturePage() {
  return (
    <Suspense fallback={null}>
      <AdvancedFeatureRoute siteId="bizdev" />
    </Suspense>
  );
}
