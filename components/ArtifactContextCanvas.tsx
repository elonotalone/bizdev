"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import {
  ResultCanvas,
  type ArtifactContextRef,
  type ResultCanvasProps,
} from "@oceanleo/ui/shell";
import {
  SITE_KEY,
  artifactContextFor,
} from "@/lib/artifact-contexts";

const ArtifactAppContext = createContext<string | null>(null);

export function ArtifactAppProvider({
  appId,
  children,
}: {
  appId: string;
  children: ReactNode;
}) {
  return (
    <ArtifactAppContext.Provider value={appId}>
      {children}
    </ArtifactAppContext.Provider>
  );
}

function contextRefFor(appId: string): ArtifactContextRef {
  const context = artifactContextFor(appId);
  return {
    contextId: context.contextId,
    siteKey: SITE_KEY,
    appId,
  };
}

function useArtifactAppId(explicitAppId?: string): string {
  const inheritedAppId = useContext(ArtifactAppContext);
  const appId = explicitAppId || inheritedAppId;
  if (!appId) throw new Error("artifact context appId is required");
  return appId;
}

export function ContextResultCanvas({
  appId: explicitAppId,
  emptyHint: _emptyHint,
  materialTabId: _materialTabId,
  ...props
}: ResultCanvasProps & {
  appId?: string;
  emptyHint?: string;
  materialTabId?: string;
}) {
  const appId = useArtifactAppId(explicitAppId);
  const context = useMemo(() => contextRefFor(appId), [appId]);
  return (
    <ResultCanvas
      {...props}
      siteId={SITE_KEY}
      materialContext={context}
    />
  );
}
