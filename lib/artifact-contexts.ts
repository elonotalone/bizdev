import type { ArtifactType } from "@oceanleo/ui/shell";

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
