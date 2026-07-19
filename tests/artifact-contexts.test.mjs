import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  ARTIFACT_CONTEXTS,
  ARTIFACT_FIXTURES,
  CATALOG_SOURCE_SHA256,
  EXPLICIT_BINDINGS,
  GENERATION_WORKFLOWS,
  SITE_KEY,
  artifactContextFor,
  contextFixtureGaps,
  fixtureRecordsForContext,
  generationContextMetadata,
} from "../lib/artifact-contexts.ts";

const appCatalogUrl = new URL("../lib/app-catalog.ts", import.meta.url);
const contextUrl = new URL("../lib/artifact-contexts.ts", import.meta.url);
const surfaceUrl = new URL(
  "../components/ArtifactContextCanvas.tsx",
  import.meta.url,
);

async function catalogSnapshot() {
  const source = await readFile(appCatalogUrl, "utf8");
  return {
    sha256: createHash("sha256").update(source).digest("hex"),
    appIds: [...source.matchAll(/\bapp\(\s*"([^"]+)"/g)].map(
      (match) => match[1],
    ),
  };
}

function requestFor(appId) {
  const context = artifactContextFor(appId);
  return {
    siteKey: SITE_KEY,
    appId,
    functionId: null,
    contextId: context.contextId,
  };
}

test("catalog contexts, explicit decisions, and workflows remain exact", async () => {
  const { appIds, sha256 } = await catalogSnapshot();
  assert.equal(sha256, CATALOG_SOURCE_SHA256);
  assert.equal(ARTIFACT_CONTEXTS.length, 20);
  assert.equal(
    artifactContextFor("cold-email").contextId,
    "olctx:v1:bizdev:app:cold-email",
  );
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
    assert.ok(Object.hasOwn(EXPLICIT_BINDINGS, context.contextId));
  }
});

test("exact app isolation stays fail closed with no broad fixture fallback", () => {
  for (const context of ARTIFACT_CONTEXTS) {
    assert.deepEqual(
      fixtureRecordsForContext({
        siteKey: SITE_KEY,
        appId: context.appId,
        functionId: null,
        contextId: context.contextId,
      }),
      [],
    );
  }
  assert.throws(
    () =>
      fixtureRecordsForContext({
        ...requestFor("cold-email"),
        appId: "inquiry-reply",
      }),
    /invalid-binding/,
  );
  assert.ok(
    contextFixtureGaps().every((gap) => gap.missingTypes.length > 0),
  );
});

test("owned inventory keeps exact revision, hashes, provenance, and license", () => {
  assert.equal(ARTIFACT_FIXTURES.length, 1);
  const fixture = ARTIFACT_FIXTURES[0];
  assert.equal(fixture.projection.artifactId, "olart:bizdev:design:mc-namecard-01");
  assert.equal(fixture.projection.revisionId, "r1");
  assert.equal(fixture.projection.artifactType, "composite_image");
  assert.equal(fixture.projection.editability, "native");
  assert.equal(fixture.projection.editorCapability, "design-canvas");
  assert.deepEqual(fixture.projection.bindings, []);
  assert.deepEqual(
    fixture.attestation.evidence.map(({ purpose, sha256 }) => ({
      purpose,
      sha256,
    })),
    [
      {
        purpose: "source",
        sha256:
          "0aecc05fb09e0bee141a55a203686096a137635df835fc803a4ac8d5b6353290",
      },
      {
        purpose: "preview",
        sha256:
          "e0f9798a8a837e71fda5b505a2e199a2b8497c84b0926490c6335c7528d879ee",
      },
    ],
  );
  assert.equal(fixture.attestation.license.code, "OceanLeo-owned");
  assert.equal(fixture.attestation.license.allowsPrimary, true);
  assert.equal(fixture.projection.scene?.closureStatus, "complete");
});

test("runtime uses shared projection, ResultCanvas, actions, and independent More", async () => {
  const [contextSource, surfaceSource] = await Promise.all([
    readFile(contextUrl, "utf8"),
    readFile(surfaceUrl, "utf8"),
  ]);
  assert.match(surfaceSource, /normalizeArtifactProjection/);
  assert.match(surfaceSource, /normalizeArtifact/);
  assert.match(surfaceSource, /artifactHasExactContext/);
  assert.match(surfaceSource, /<ResultCanvas/);
  assert.match(surfaceSource, /materialContext=\{context\}/);
  assert.doesNotMatch(
    surfaceSource,
    /<MaterialLibrary|useWorkbenchMaterialActions|materialActionEvidence/,
  );
  assert.doesNotMatch(
    contextSource,
    /\/v1\/|fetch\(|previewArtifact|editArtifact|insertArtifact|replaceArtifact|saveArtifactRevision|reopenArtifactRevision/,
  );
});

test("generation metadata claims only the existing Markdown producer", () => {
  for (const workflow of GENERATION_WORKFLOWS) {
    assert.deepEqual(workflow.outputTypes, ["document"]);
    assert.equal(workflow.sourceFormat, "text/markdown");
    assert.equal(workflow.editability, "flat");
    const metadata = generationContextMetadata(workflow.appId);
    assert.equal(
      metadata.context_id,
      artifactContextFor(workflow.appId).contextId,
    );
    assert.equal(metadata.revision_state, "pending-ensure");
    assert.equal(metadata.layered, false);
  }
});
