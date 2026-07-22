import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import test from "node:test";

import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

const require = createRequire(import.meta.url);
const reactUrl = pathToFileURL(require.resolve("react")).href;
const jsxRuntimeUrl = pathToFileURL(require.resolve("react/jsx-runtime")).href;

function dataModule(source) {
  return `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
}

async function compileModule(relativePath, replacements = {}) {
  let source = await readFile(resolve(relativePath), "utf8");
  for (const [specifier, replacement] of Object.entries(replacements)) {
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
      fileName: relativePath,
    })
    .outputText.replaceAll(
      'from "react/jsx-runtime";',
      `from ${JSON.stringify(jsxRuntimeUrl)};`,
    );
  return dataModule(output);
}

test("rendered bizdev app keeps native result and mounts remote More and My Library", async () => {
  const shellStubUrl = dataModule(`
    import { createElement } from ${JSON.stringify(reactUrl)};
    export function ResultCanvas({ tabs, active, siteId, materialContext }) {
      const selected = tabs.find((tab) => tab.id === active) || tabs[0];
      const shared = tabs
        .filter((tab) => tab.surface?.slot === "materials" || tab.surface?.slot === "mine")
        .map((tab) => createElement(
          "div",
          { key: tab.id, "data-shared-slot": tab.surface.slot },
          tab.surface.slot === "materials" ? "REMOTE_MORE" : "OWNER_MY_LIBRARY",
        ));
      return createElement(
        "main",
        {
          "data-result-canvas": siteId,
          "data-context-id": materialContext?.contextId || "",
        },
        selected?.content,
        ...shared,
      );
    }
  `);
  const contextsUrl = await compileModule("lib/artifact-contexts.ts");
  const contextCanvasUrl = await compileModule(
    "components/ArtifactContextCanvas.tsx",
    {
      react: reactUrl,
      "@oceanleo/ui/shell": shellStubUrl,
      "@/lib/artifact-contexts": contextsUrl,
    },
  );
  const libraryCanvasUrl = await compileModule(
    "components/console/LibraryCanvas.tsx",
    {
      react: reactUrl,
      "@oceanleo/ui/shell": shellStubUrl,
      "@/components/ArtifactContextCanvas": contextCanvasUrl,
    },
  );
  const { ArtifactAppProvider } = await import(contextCanvasUrl);
  const { LibraryCanvas } = await import(libraryCanvasUrl);
  const html = renderToStaticMarkup(
    React.createElement(
      ArtifactAppProvider,
      { appId: "cold-email" },
      React.createElement(LibraryCanvas, {
        resultTabs: [
          {
            id: "result",
            label: "Result",
            content: React.createElement(
              "article",
              null,
              "NATIVE_BIZDEV_RESULT",
            ),
          },
        ],
      }),
    ),
  );
  assert.match(html, /NATIVE_BIZDEV_RESULT/);
  assert.match(html, /data-shared-slot="materials"[^>]*>REMOTE_MORE/);
  assert.match(html, /data-shared-slot="mine"[^>]*>OWNER_MY_LIBRARY/);
  assert.match(html, /olctx:v1:bizdev:app:cold-email/);
});

test("bizdev delegates library surfaces without local material injection", async () => {
  const [canvas, wrapper, consoleClient, libraryPage] = await Promise.all([
    readFile(resolve("components/console/LibraryCanvas.tsx"), "utf8"),
    readFile(resolve("components/ArtifactContextCanvas.tsx"), "utf8"),
    readFile(resolve("components/console/ConsoleClient.tsx"), "utf8"),
    readFile(resolve("app/library/page.tsx"), "utf8"),
  ]);
  assert.match(
    canvas,
    /surface: \{ slot: "materials", role: "container" \}[\s\S]*?content: null/,
  );
  assert.match(
    canvas,
    /surface: \{ slot: "mine", role: "container" \}[\s\S]*?content: null/,
  );
  assert.match(wrapper, /materialContext=\{context\}/);
  assert.match(wrapper, /siteId=\{SITE_KEY\}/);
  assert.match(consoleClient, /<ArtifactAppProvider appId=\{app\.id\}>/);
  assert.match(libraryPage, /<LibraryDetail accent=\{SITE_ACCENT\} \/>/);
  assert.doesNotMatch(
    `${canvas}\n${wrapper}\n${libraryPage}`,
    /<MaterialLibrary|<ArtifactLibrary|curatedType|materials=/,
  );
  assert.equal(existsSync(resolve("lib/materials.ts")), false);
});

test("shared contract exposes all 12 More classes and owner-scoped My Library", async () => {
  const root = resolve("node_modules/@oceanleo/ui/src/shell");
  const [resultCanvas, controller, myLibrary, advancedFeatures] =
    await Promise.all([
      readFile(resolve(root, "ResultCanvas.tsx"), "utf8"),
      readFile(resolve(root, "material-library-controller.ts"), "utf8"),
      readFile(resolve(root, "MyLibrary.tsx"), "utf8"),
      readFile(resolve(root, "advanced-features.ts"), "utf8"),
    ]);
  const materialsMount =
    resultCanvas.match(/materials:\s*\([\s\S]*?<MaterialLibrary[\s\S]*?\/>/)?.[0] ||
    "";
  const mineMount =
    resultCanvas.match(/mine:\s*\([\s\S]*?<MyLibrary[\s\S]*?\/>/)?.[0] || "";
  assert.match(materialsMount, /<MaterialLibrary/);
  assert.doesNotMatch(materialsMount, /curatedType=|itemFilter=/);
  assert.match(mineMount, /<MyLibrary/);
  assert.doesNotMatch(mineMount, /curatedType=|itemFilter=/);
  assert.match(
    controller,
    /if \(!input\.taxonomy && !input\.query\.trim\(\)\)[\s\S]*?listEditableShelfArtifacts/,
  );
  assert.match(myLibrary, /listMyArtifacts/);
  assert.match(
    myLibrary,
    /setOwnedItems\(dedupeDurableItems\(mineResult\.data\.items\)\)/,
  );
  assert.match(
    myLibrary,
    /item\.artifact\.owner\.visibility !== "public"/,
  );
  assert.doesNotMatch(myLibrary, /searchArtifactLibrary|MATERIAL_LIBRARY_MORE_ROLE/);
  const featureBlock =
    advancedFeatures.match(
      /export const ADVANCED_FEATURES[\s\S]*?\] as const;/,
    )?.[0] || "";
  const featureIds = [
    ...featureBlock.matchAll(/\bid:\s*"([^"]+)"/g),
  ].map((match) => match[1]);
  assert.equal(featureIds.length, 12);
  assert.equal(new Set(featureIds).size, 12);
});
