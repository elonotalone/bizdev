import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  ARTIFACT_CONTEXTS,
  CATALOG_SOURCE_SHA256,
  GENERATION_WORKFLOWS,
  SITE_KEY,
  artifactContextFor,
  generationContextMetadata,
} from "../lib/artifact-contexts.ts";

const appCatalogUrl = new URL("../lib/app-catalog.ts", import.meta.url);
const contextUrl = new URL("../lib/artifact-contexts.ts", import.meta.url);

async function catalogSnapshot() {
  const source = await readFile(appCatalogUrl, "utf8");
  return {
    sha256: createHash("sha256").update(source).digest("hex"),
    appIds: [...source.matchAll(/\bapp\(\s*"([^"]+)"/g)].map(
      (match) => match[1],
    ),
  };
}

test("catalog Primary contexts and generation workflows remain exact", async () => {
  const { appIds, sha256 } = await catalogSnapshot();
  assert.equal(SITE_KEY, "bizdev");
  assert.equal(sha256, CATALOG_SOURCE_SHA256);
  assert.equal(ARTIFACT_CONTEXTS.length, 20);
  assert.deepEqual(
    ARTIFACT_CONTEXTS.flatMap((context) =>
      context.appId ? [context.appId] : [],
    ).sort(),
    [...appIds].sort(),
  );
  assert.deepEqual(
    GENERATION_WORKFLOWS.map((workflow) => workflow.appId).sort(),
    [...appIds].sort(),
  );
  for (const context of ARTIFACT_CONTEXTS) {
    assert.equal(
      context.contextId,
      context.appId
        ? `olctx:v1:bizdev:app:${context.appId}`
        : "olctx:v1:bizdev:site",
    );
    assert.equal(context.siteKey, SITE_KEY);
    assert.equal(context.functionId, null);
  }
  assert.deepEqual(artifactContextFor("cold-email").requiredPrimaryTypes, [
    "document",
  ]);
  assert.deepEqual(
    artifactContextFor("company-research").requiredPrimaryTypes,
    ["document", "grid", "chart"],
  );
  assert.throws(() => artifactContextFor("not-a-bizdev-app"), /unknown bizdev/);
});

test("native generation metadata still targets each exact Primary context", () => {
  const metadata = generationContextMetadata("market-entry");
  assert.deepEqual(metadata, {
    artifact_contract: "oceanleo.transient-artifact/v1",
    context_id: "olctx:v1:bizdev:app:market-entry",
    site_key: "bizdev",
    app_id: "market-entry",
    function_id: null,
    workflow_id: "bizdev.market-entry",
    output_types: ["document"],
    source_format: "text/markdown",
    editability: "flat",
    persistence: "work-session",
    revision_state: "pending-ensure",
    layered: false,
  });
});

test("local fixture inventory and broad material fallback stay removed", async () => {
  const source = await readFile(contextUrl, "utf8");
  assert.doesNotMatch(
    source,
    /ARTIFACT_FIXTURES|EXPLICIT_BINDINGS|fixtureRecordsForContext|contextFixtureGaps|MaterialItem|https?:\/\//,
  );
});
