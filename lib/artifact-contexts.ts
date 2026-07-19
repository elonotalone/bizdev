import type {
  ArtifactContextBinding,
  ArtifactProjection,
  ArtifactType,
} from "@oceanleo/ui/shell";

export const SITE_KEY = "bizdev" as const;
export const CONTEXT_SCHEMA = "oceanleo.artifact-context-rollout/v1" as const;
export const CONTEXT_MANIFEST_DIGEST =
  "735f0795aea55632cf302399492caa82f7150991474c892746bef228f4565a8e";
export const CATALOG_SOURCE_SHA256 =
  "0356cf88aa17a33b1826dd201cd026dba078d7bd464b0dc7f7d34c28a8e80544";

export interface ArtifactContextDefinition {
  contextId: string;
  siteKey: typeof SITE_KEY;
  appId: string | null;
  functionId: null;
  requiredPrimaryTypes: readonly ArtifactType[];
  noPrimaryMaterial: boolean;
  workflowId: string | null;
}

export interface ContextRequest {
  siteKey: string;
  appId: string | null;
  functionId: string | null;
  contextId: string;
}

export interface FixtureBinding extends ArtifactContextBinding {
  artifactId: string;
  active: true;
  role: "primary";
  pinnedRevisionId: string;
}

type FixtureProjectionInput = Omit<ArtifactProjection, "integrity"> & {
  integrity?: ArtifactProjection["integrity"];
};

export interface ArtifactFixtureRecord {
  projection: FixtureProjectionInput;
  attestation: {
    acquiredAt: string;
    author: string;
    providerUrl?: string;
    license: {
      code: string;
      url: string;
      allowsPrimary: boolean;
      allowsDerivatives: boolean;
    };
    evidence: readonly {
      purpose: "source" | "preview" | "thumbnail";
      url: string;
      sha256: string;
    }[];
  };
}

const DOCUMENT_APPS = [
  "cold-email",
  "complaint-reply",
  "exhibition-invite",
  "follow-up",
  "inquiry-reply",
  "multilang-notice",
  "negotiation-reply",
  "order-confirm-reply",
  "product-intro-letter",
  "reactivate-email",
  "term-localize",
  "trade-translate",
  "whatsapp-reply",
] as const;

const ANALYTICAL_APPS = [
  "company-research",
  "competitor-report",
  "customer-profile",
  "market-entry",
  "pricing-strategy",
  "selling-points",
] as const;

function appContext(
  appId: string,
  requiredPrimaryTypes: readonly ArtifactType[],
): ArtifactContextDefinition {
  return {
    contextId: `olctx:v1:${SITE_KEY}:app:${appId}`,
    siteKey: SITE_KEY,
    appId,
    functionId: null,
    requiredPrimaryTypes,
    noPrimaryMaterial: false,
    workflowId: `bizdev.${appId}`,
  };
}

export const ARTIFACT_CONTEXTS: readonly ArtifactContextDefinition[] =
  Object.freeze([
    {
      contextId: `olctx:v1:${SITE_KEY}:site`,
      siteKey: SITE_KEY,
      appId: null,
      functionId: null,
      requiredPrimaryTypes: [],
      noPrimaryMaterial: true,
      workflowId: null,
    },
    ...DOCUMENT_APPS.map((appId) => appContext(appId, ["document"])),
    ...ANALYTICAL_APPS.map((appId) =>
      appContext(appId, ["document", "grid", "chart"]),
    ),
  ]);

const CONTEXT_BY_ID = new Map(
  ARTIFACT_CONTEXTS.map((context) => [context.contextId, context]),
);
const CONTEXT_BY_APP = new Map(
  ARTIFACT_CONTEXTS.map((context) => [context.appId, context]),
);

export function artifactContextFor(
  appId: string | null,
): ArtifactContextDefinition {
  const context = CONTEXT_BY_APP.get(appId);
  if (!context) throw new Error(`unknown ${SITE_KEY} artifact app: ${appId}`);
  return context;
}

export function assertArtifactContext(
  request: ContextRequest,
): ArtifactContextDefinition {
  const context = CONTEXT_BY_ID.get(request.contextId);
  if (
    !context ||
    request.siteKey !== SITE_KEY ||
    request.functionId !== null ||
    context.appId !== request.appId
  ) {
    throw new Error("invalid-binding: context identity mismatch");
  }
  return context;
}

export const EXPLICIT_BINDINGS: Readonly<
  Record<string, readonly FixtureBinding[]>
> = Object.freeze(
  Object.fromEntries(
    ARTIFACT_CONTEXTS.map((context) => [
      context.contextId,
      Object.freeze([]),
    ]),
  ),
);

const SOURCE_URL =
  "https://asset.oceanleo.com/design-templates/doc/mc-namecard-01.json";
const PREVIEW_URL =
  "https://oceanleo-assets.oss-cn-guangzhou.aliyuncs.com/assets/design-preview/mc-namecard-01.webp?v=202607040933";
const SOURCE_SHA256 =
  "0aecc05fb09e0bee141a55a203686096a137635df835fc803a4ac8d5b6353290";
const PREVIEW_SHA256 =
  "e0f9798a8a837e71fda5b505a2e199a2b8497c84b0926490c6335c7528d879ee";

// Real owned inventory retained even though no bizdev context accepts its type.
export const ARTIFACT_FIXTURES: readonly ArtifactFixtureRecord[] =
  Object.freeze([
    {
      projection: {
        schema: "oceanleo.artifact.v1",
        artifactId: "olart:bizdev:design:mc-namecard-01",
        revisionId: "r1",
        artifactType: "composite_image",
        roles: ["inventory"],
        owner: {
          principalId: "oceanleo",
          visibility: "public",
          originSiteKey: SITE_KEY,
          originAppId: null,
          originFunctionId: null,
        },
        access: {
          canRead: true,
          canPreview: true,
          canEdit: false,
          canFork: true,
          canInsert: true,
          canReplace: true,
          canFavorite: true,
          canBind: false,
          canExportSource: true,
        },
        editability: "native",
        editorCapability: "design-canvas",
        sourceFormat: "oceanleo.design-document+json",
        title: "陈嘉树商务名片",
        favorite: false,
        renditions: {
          source: {
            purpose: "source",
            revisionId: "r1",
            url: SOURCE_URL,
            mediaType: "application/json",
            format: "oceanleo.design-document+json",
            expiresAt: null,
            rendererVersion: null,
            width: null,
            height: null,
            durationMs: null,
            digest: SOURCE_SHA256,
          },
          preview: {
            purpose: "preview",
            revisionId: "r1",
            url: PREVIEW_URL,
            mediaType: "image/webp",
            format: "webp",
            expiresAt: null,
            rendererVersion: null,
            width: null,
            height: null,
            durationMs: null,
            digest: PREVIEW_SHA256,
          },
          thumbnail: {
            purpose: "thumbnail",
            revisionId: "r1",
            url: PREVIEW_URL,
            mediaType: "image/webp",
            format: "webp",
            expiresAt: null,
            rendererVersion: null,
            width: null,
            height: null,
            durationMs: null,
            digest: PREVIEW_SHA256,
          },
        },
        scene: {
          schema: "oceanleo.design-document+json",
          sceneRevisionId: "r1",
          closureStatus: "complete",
          closureDigest: SOURCE_SHA256,
          dependencyRevisionIds: [],
        },
        provenance: {
          id: "design-template:mc-namecard-01",
          sourceKind: "owned",
          licenseCode: "OceanLeo-owned",
          licenseUrl: "https://asset.oceanleo.com/terms",
          attribution: "OceanLeo",
        },
        bindings: [],
        createdAt: "2026-07-04T09:33:00.000Z",
      },
      attestation: {
        acquiredAt: "2026-07-04T09:33:00.000Z",
        author: "OceanLeo",
        license: {
          code: "OceanLeo-owned",
          url: "https://asset.oceanleo.com/terms",
          allowsPrimary: true,
          allowsDerivatives: true,
        },
        evidence: [
          { purpose: "source", url: SOURCE_URL, sha256: SOURCE_SHA256 },
          { purpose: "preview", url: PREVIEW_URL, sha256: PREVIEW_SHA256 },
        ],
      },
    },
  ]);

const FIXTURE_BY_ID = new Map(
  ARTIFACT_FIXTURES.map((fixture) => [
    fixture.projection.artifactId,
    fixture,
  ]),
);

export function fixtureRecordsForContext(
  request: ContextRequest,
): readonly ArtifactFixtureRecord[] {
  const context = assertArtifactContext(request);
  if (context.noPrimaryMaterial) return [];
  const bindings = EXPLICIT_BINDINGS[context.contextId];
  if (!bindings) throw new Error("invalid-binding: context has no decision");
  return bindings
    .filter((binding) => binding.active && binding.role === "primary")
    .sort((left, right) => (left.rank ?? 0) - (right.rank ?? 0))
    .flatMap((binding) => {
      const fixture = FIXTURE_BY_ID.get(binding.artifactId);
      return fixture &&
        fixture.projection.revisionId === binding.pinnedRevisionId &&
        context.requiredPrimaryTypes.includes(
          fixture.projection.artifactType,
        )
        ? [fixture]
        : [];
    });
}

export function contextFixtureGaps() {
  return ARTIFACT_CONTEXTS.filter((context) => !context.noPrimaryMaterial).map(
    (context) => {
      const boundTypes = new Set(
        (EXPLICIT_BINDINGS[context.contextId] || []).flatMap((binding) => {
          const fixture = FIXTURE_BY_ID.get(binding.artifactId);
          return fixture ? [fixture.projection.artifactType] : [];
        }),
      );
      return {
        contextId: context.contextId,
        missingTypes: context.requiredPrimaryTypes.filter(
          (type) => !boundTypes.has(type),
        ),
      };
    },
  );
}

export interface GenerationWorkflow {
  workflowId: string;
  appId: string;
  outputTypes: readonly ArtifactType[];
  sourceFormat: string;
  editability: "view_only" | "flat" | "layered";
  persistence: "work-session" | "creation";
}

export const GENERATION_WORKFLOWS: readonly GenerationWorkflow[] =
  Object.freeze([
    ...DOCUMENT_APPS.map((appId) => ({
      workflowId: `bizdev.${appId}`,
      appId,
      outputTypes: ["document"] as const,
      sourceFormat: "text/markdown",
      editability: "flat" as const,
      persistence: "work-session" as const,
    })),
    ...ANALYTICAL_APPS.map((appId) => ({
      workflowId: `bizdev.${appId}`,
      appId,
      outputTypes: ["document"] as const,
      sourceFormat: "text/markdown",
      editability: "flat" as const,
      persistence: "work-session" as const,
    })),
  ]);

const WORKFLOW_BY_APP = new Map(
  GENERATION_WORKFLOWS.map((workflow) => [workflow.appId, workflow]),
);

export function generationContextMetadata(appId: string) {
  const context = artifactContextFor(appId);
  const workflow = WORKFLOW_BY_APP.get(appId);
  if (!workflow) throw new Error(`missing generation workflow: ${appId}`);
  return {
    artifact_contract: "oceanleo.transient-artifact/v1",
    context_id: context.contextId,
    site_key: SITE_KEY,
    app_id: appId,
    function_id: null,
    workflow_id: workflow.workflowId,
    output_types: [...workflow.outputTypes],
    source_format: workflow.sourceFormat,
    editability: workflow.editability,
    persistence: workflow.persistence,
    revision_state: "pending-ensure",
    layered: false,
  };
}
