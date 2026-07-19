import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import test from "node:test";

import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

import {
  ARTIFACT_FIXTURES,
  SITE_KEY,
  artifactContextFor,
  fixtureRecordsForContext,
} from "../lib/artifact-contexts.ts";

const require = createRequire(import.meta.url);
const reactUrl = new URL(
  require.resolve("react"),
  import.meta.url,
).href;
const jsxRuntimeUrl = new URL(
  require.resolve("react/jsx-runtime"),
  import.meta.url,
).href;
const shellRoot = new URL(
  "../node_modules/@oceanleo/ui/src/shell/",
  import.meta.url,
);

function dataModule(source) {
  return `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
}

async function compileModule(url, replacements = {}) {
  let source = await readFile(url, "utf8");
  for (const [specifier, replacement] of Object.entries({
    react: reactUrl,
    ...replacements,
  })) {
    source = source.replaceAll(
      JSON.stringify(specifier),
      JSON.stringify(replacement),
    );
  }
  const output = ts
    .transpileModule(source, {
      compilerOptions: {
        jsx: ts.JsxEmit.ReactJSX,
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2022,
      },
      fileName: url.pathname,
    })
    .outputText.replaceAll(
      'from "react/jsx-runtime";',
      `from ${JSON.stringify(jsxRuntimeUrl)};`,
    );
  return `${dataModule(output)}#${encodeURIComponent(url.pathname)}`;
}

const contractUrl = await compileModule(
  new URL("artifact-contract.ts", shellRoot),
);
const libraryDataUrl = await compileModule(
  new URL("library-data.ts", shellRoot),
);
const contract = await import(contractUrl);
const libraryData = await import(libraryDataUrl);

const uiStubUrl = dataModule(`
  export function useUI() { return (value) => value; }
`);
const clientStubUrl = dataModule(`
  export async function listPrimaryArtifacts() {
    return { ok: true, data: { items: [], nextCursor: null, total: 0 } };
  }
  export async function searchArtifactLibrary() {
    return { ok: true, data: { items: [], nextCursor: null, total: 0 } };
  }
  export async function prepareArtifactForAction(_action, item) {
    return { ok: true, data: item };
  }
`);
const routeStubUrl = dataModule(`
  export function editorCapabilityFor() {
    return { available: true, unavailableReason: "", route: { type: "image" } };
  }
`);
const sessionStubUrl = dataModule(`
  export function useOptionalWorkspaceSession() { return null; }
`);
const registryStubUrl = dataModule(`
  export function materialScopeKey(siteId, appId) { return siteId + "::" + appId; }
  export function registerWorkbenchMaterialSource() { return () => {}; }
`);
const workspaceStubUrl = dataModule(`
  import { createElement } from ${JSON.stringify(reactUrl)};
  export function workspaceEntryFromLibraryItem(item, options = {}) {
    return {
      id: item.key || item.id,
      title: item.title,
      category: options.category || "",
      description: options.description || "",
      libraryItem: item,
    };
  }
  export function WorkspaceLibrary(props) {
    return createElement(
      "section",
      { "data-workspace-library": "true" },
      props.toolbarActions,
      ...props.entries.map((entry) =>
        createElement("article", {
          key: entry.id,
          "data-entry-title": entry.title,
        }, entry.title),
      ),
    );
  }
`);

const { MaterialLibrary } = await import(
  await compileModule(new URL("MaterialLibrary.tsx", shellRoot), {
    "../i18n/ui/useUI": uiStubUrl,
    "./artifact-contract": contractUrl,
    "./artifact-client": clientStubUrl,
    "./library-data": libraryDataUrl,
    "./WorkspaceLibrary": workspaceStubUrl,
    "./WorkspaceSession": sessionStubUrl,
    "./workbench-material-registry": registryStubUrl,
  }),
);
const actions = await import(
  await compileModule(new URL("ArtifactActions.tsx", shellRoot), {
    "../i18n/ui/useUI": uiStubUrl,
    "./artifact-contract": contractUrl,
    "./artifact-client": clientStubUrl,
    "./library-data": libraryDataUrl,
    "./workbench-routes": routeStubUrl,
  }),
);
const routeModule = await import(
  await compileModule(new URL("workbench-routes.ts", shellRoot)),
);

function normalizeFixture(record) {
  const artifact = contract.normalizeArtifactProjection(record.projection);
  assert.ok(artifact);
  return artifact;
}

function materialFromArtifact(artifact) {
  const item = libraryData.artifactProjectionToLibraryItem(artifact);
  return {
    id: artifact.artifactId,
    title: artifact.title,
    thumb: item.thumbUrl || item.previewUrl || "",
    preview: item.previewUrl,
    categories: [artifact.artifactType],
    kind: "image",
    libraryItem: item,
  };
}

test("rendered canonical fixtures keep integrity, actions, ACL/CAS gates, and More", () => {
  for (const record of ARTIFACT_FIXTURES) {
    const artifact = normalizeFixture(record);
    assert.equal(artifact.integrity.ok, true);
    assert.ok(
      Object.values(artifact.renditions).every(
        (rendition) => rendition.revisionId === artifact.revisionId,
      ),
    );
    for (const evidence of record.attestation.evidence) {
      assert.equal(
        artifact.renditions[evidence.purpose]?.digest,
        evidence.sha256,
      );
    }
    assert.equal(artifact.editability, "native");
    assert.equal(artifact.editorCapability, "design-canvas");
    assert.equal(artifact.scene?.closureStatus, "complete");
  }

  const context = artifactContextFor("cold-email");
  const records = fixtureRecordsForContext({
    siteKey: SITE_KEY,
    appId: "cold-email",
    functionId: null,
    contextId: context.contextId,
  });
  const moreMarkup = renderToStaticMarkup(
    React.createElement(MaterialLibrary, {
      materials: records.map((record) =>
        materialFromArtifact(normalizeFixture(record)),
      ),
      siteId: SITE_KEY,
      appId: "cold-email",
      contextId: context.contextId,
      fetchPrimary: false,
    }),
  );
  assert.match(moreMarkup, /打开完整素材库/);
  assert.match(moreMarkup, /更多/);
  assert.doesNotMatch(moreMarkup, /陈嘉树商务名片/);

  const artifact = normalizeFixture(ARTIFACT_FIXTURES[0]);
  const item = libraryData.artifactProjectionToLibraryItem(artifact);
  const noTarget = actions.artifactActionMatrix(item);
  assert.equal(noTarget.preview.available, true);
  assert.equal(noTarget.edit.available, true);
  assert.equal(noTarget.insert.visible, false);
  assert.equal(noTarget.replace.visible, false);

  const withTarget = actions.artifactActionMatrix(item, {
    insert: { visible: true, available: true, reason: "" },
    replace: { visible: true, available: true, reason: "" },
  });
  const actionMarkup = renderToStaticMarkup(
    React.createElement(actions.ArtifactActionButtons, {
      item,
      matrix: withTarget,
      onPreview() {},
      onEdit() {},
      onInsert() {},
      onReplace() {},
    }),
  );
  for (const label of ["预览", "编辑", "插入", "替换"]) {
    assert.match(actionMarkup, new RegExp(`>${label}<`));
  }

  const denied = contract.normalizeArtifactProjection({
    ...ARTIFACT_FIXTURES[0].projection,
    access: {
      ...ARTIFACT_FIXTURES[0].projection.access,
      canRead: false,
      canPreview: false,
      canEdit: false,
      canFork: false,
      canInsert: false,
      canReplace: false,
    },
  });
  assert.ok(denied);
  const deniedMatrix = actions.artifactActionMatrix(
    libraryData.artifactProjectionToLibraryItem(denied),
    {
      insert: { visible: true, available: true, reason: "" },
      replace: { visible: true, available: true, reason: "" },
    },
  );
  assert.equal(deniedMatrix.preview.visible, false);
  assert.equal(deniedMatrix.edit.visible, false);
  assert.equal(deniedMatrix.insert.visible, false);
  assert.equal(deniedMatrix.replace.visible, false);

  const stale = contract.normalizeArtifactEditorCommand({
    schema: "oceanleo.editor-command.v1",
    commandId: "cmd-1",
    historyGroupId: "history-1",
    action: "replace",
    source: {
      artifactId: artifact.artifactId,
      revisionId: artifact.revisionId,
      artifactType: artifact.artifactType,
      sourceFormat: artifact.sourceFormat,
    },
    target: {
      documentId: "doc-1",
      targetId: "node-1",
      slotId: "slot-1",
      geometry: { x: 0, y: 0, width: 100, height: 100 },
    },
    strategy: {
      mode: "replace-selection",
      preserve: ["slot", "geometry"],
    },
    expectedRevision: { targetRevisionId: "target-r2" },
    cas: { expectedRevisionId: "target-r1" },
  });
  assert.equal(stale, null);
});

test("website artifacts route to the website editor from the bizdev consumer", () => {
  const artifact = normalizeFixture(ARTIFACT_FIXTURES[0]);
  const item = libraryData.artifactProjectionToLibraryItem(artifact);
  assert.deepEqual(
    routeModule.editorRouteFor({
      ...item,
      kind: "website",
      artifactType: "website",
      url: "https://preview.test/cross-site",
      meta: { project_id: "cross-site-website" },
    }),
    {
      type: "embed",
      base: "https://website.oceanleo.com/embed/site-editor",
      mediaType: "website",
    },
  );
});
