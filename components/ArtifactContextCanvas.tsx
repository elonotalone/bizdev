"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import {
  ResultCanvas,
  artifactHasExactContext,
  normalizeArtifact,
  normalizeArtifactProjection,
  type ArtifactContextRef,
  type MaterialItem,
  type ResultCanvasProps,
} from "@oceanleo/ui/shell";
import {
  SITE_KEY,
  artifactContextFor,
  fixtureRecordsForContext,
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

function materialsForApp(appId: string): MaterialItem[] {
  const context = artifactContextFor(appId);
  const request = {
    siteKey: SITE_KEY,
    appId,
    functionId: null,
    contextId: context.contextId,
  };
  return fixtureRecordsForContext(request).flatMap((record) => {
    const artifact = normalizeArtifactProjection(record.projection);
    if (
      !artifact ||
      !artifact.integrity.ok ||
      !artifactHasExactContext(artifact, context.contextId) ||
      !context.requiredPrimaryTypes.includes(artifact.artifactType)
    ) {
      return [];
    }
    const item = normalizeArtifact({
      id: artifact.artifactId,
      title: artifact.title,
      artifact,
    });
    return [
      {
        id: artifact.artifactId,
        title: artifact.title,
        thumb: item.thumbUrl || item.previewUrl || "",
        preview: item.previewUrl,
        categories: [artifact.artifactType],
        desc: `${artifact.artifactType} · ${artifact.revisionId}`,
        kind: "image" as const,
        libraryItem: item,
      },
    ];
  });
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
  const materials = useMemo(() => materialsForApp(appId), [appId]);
  return (
    <ResultCanvas
      {...props}
      siteId={SITE_KEY}
      materials={materials}
      materialContext={context}
    />
  );
}
