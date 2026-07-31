import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";

import ts from "typescript";

// 装机版 @oceanleo/ui@0.205.0 的 ArtifactType 联合是本轮全部类型判断的事实源,
// 因此测试直接编译 node_modules 里那一份 artifact-contract.ts,不另抄一份类型清单。
const artifactContractPath = resolve(
  "node_modules/@oceanleo/ui/src/shell/artifact-contract.ts",
);

function dataModule(source) {
  return `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
}

async function compileModule(path, replacements = {}) {
  let source = await readFile(path, "utf8");
  for (const [specifier, replacement] of Object.entries(replacements)) {
    source = source.replaceAll(
      JSON.stringify(specifier),
      JSON.stringify(replacement),
    );
  }
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: path,
  }).outputText;
  return dataModule(output);
}

async function loadPlanModule() {
  const artifactUrl = await compileModule(artifactContractPath);
  const planUrl = await compileModule(resolve("lib/site-material-plan.ts"), {
    "@oceanleo/ui/artifact": artifactUrl,
  });
  return import(planUrl);
}

// app 目录的唯一事实源是 lib/app-catalog.ts 自身,app id 一律从源码读出,
// 不在测试里手抄成第二份常量(抄一份就等于把「计划与目录是否同集合」判空了)。
async function catalogAppIds() {
  const source = await readFile(resolve("lib/app-catalog.ts"), "utf8");
  return [...source.matchAll(/\bapp\(\s*"([^"]+)"/g)].map((match) => match[1]);
}

test("bizdev 映射面计划自洽:位次 1..9 全集、无空洞无重复", async () => {
  const { SITE_MATERIAL_PLAN, validateSiteMaterialPlan } = await loadPlanModule();
  assert.deepEqual(validateSiteMaterialPlan(SITE_MATERIAL_PLAN), []);
  assert.equal(SITE_MATERIAL_PLAN.siteKey, "bizdev");
  assert.equal(SITE_MATERIAL_PLAN.targetPerApp, 9);
  assert.equal(SITE_MATERIAL_PLAN.apps.length, 19);
  for (const app of SITE_MATERIAL_PLAN.apps) {
    const positions = app.slots.flatMap((slot) => {
      const [from, to] = slot.positions;
      return Array.from({ length: to - from + 1 }, (_, index) => from + index);
    });
    assert.deepEqual(
      [...positions].sort((a, b) => a - b),
      [1, 2, 3, 4, 5, 6, 7, 8, 9],
      `${app.appId} 的货架位次不是 1..9 全集`,
    );
  }
});

test("validateSiteMaterialPlan 对越界样本 fail-closed,而不是恒返回空数组", async () => {
  const { validateSiteMaterialPlan } = await loadPlanModule();
  const hole = {
    siteKey: "bizdev",
    targetPerApp: 9,
    apps: [
      {
        appId: "cold-email",
        slots: [{ family: "ledger-register", artifactType: "grid", count: 9, positions: [2, 10] }],
      },
    ],
  };
  const overlap = {
    siteKey: "bizdev",
    targetPerApp: 2,
    apps: [
      {
        appId: "cold-email",
        slots: [
          { family: "ledger-register", artifactType: "grid", count: 1, positions: [1, 1] },
          { family: "chart-template", artifactType: "chart", count: 1, positions: [1, 1] },
        ],
      },
    ],
  };
  const countMismatch = {
    siteKey: "bizdev",
    targetPerApp: 3,
    apps: [
      {
        appId: "cold-email",
        slots: [{ family: "ledger-register", artifactType: "grid", count: 3, positions: [1, 2] }],
      },
    ],
  };
  assert.match(validateSiteMaterialPlan(hole).join("\n"), /position 1 is a hole/);
  assert.match(
    validateSiteMaterialPlan(overlap).join("\n"),
    /position 1 claimed by both/,
  );
  assert.match(
    validateSiteMaterialPlan(countMismatch).join("\n"),
    /positions 1\.\.2 hold 2 slots but count is 3/,
  );
});

test("计划覆盖的 app 集合与 lib/app-catalog.ts 的 app 目录逐字相等", async () => {
  const { SITE_MATERIAL_PLAN, diffPlanAgainstCatalog } = await loadPlanModule();
  const appIds = await catalogAppIds();
  assert.equal(appIds.length, 19);
  assert.deepEqual(diffPlanAgainstCatalog(SITE_MATERIAL_PLAN, appIds), {
    missingFromPlan: [],
    notInCatalog: [],
  });
});

test("挂起类型恰为 interactive_doc,可落地类型含 chart 与 grid", async () => {
  const { SITE_MATERIAL_PLAN, landableArtifactTypes, pendingArtifactTypes } =
    await loadPlanModule();
  assert.deepEqual(pendingArtifactTypes(SITE_MATERIAL_PLAN), ["interactive_doc"]);
  const landable = landableArtifactTypes(SITE_MATERIAL_PLAN);
  for (const artifactType of ["chart", "grid"]) {
    assert.ok(
      landable.includes(artifactType),
      `landableArtifactTypes 缺少 ${artifactType}:${landable.join(",")}`,
    );
  }
  // 装机版联合没有 interactive_doc,它只许待在映射面数据里。
  const { ARTIFACT_TYPES } = await import(await compileModule(artifactContractPath));
  assert.equal(ARTIFACT_TYPES.includes("interactive_doc"), false);
  for (const artifactType of landable) {
    assert.ok(ARTIFACT_TYPES.includes(artifactType), `${artifactType} 不在装机版联合里`);
  }
});

test("映射面不含任何素材实体:无 artifactId 字段、无 URL", async () => {
  const source = await readFile(resolve("lib/site-material-plan.ts"), "utf8");
  const offenders = [...source.matchAll(/artifactId\s*:|https?:\/\/\S+/g)].map(
    (match) => match[0],
  );
  assert.deepEqual(offenders, []);
});
