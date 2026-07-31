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

// L4 §3.1 / §3.2 的两张四列表,逐格转录自规格(族 / 份数 / 货架位次)。
// 这一份不是「plan 的第二份拷贝」而是规格侧的对照物:簇表里的
// 「↑ 同簇全部 N 个 app」在 plan 里必须真展开,抽样或漏行都要被这条测出来。
const LETTER_CLUSTER_APPS = [
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
  "whatsapp-reply",
  "term-localize",
  "trade-translate",
];
const LETTER_CLUSTER_TABLE = [
  ["dialogue-branch-script", 3, 1, 3],
  ["contract-assembly", 2, 4, 5],
  ["ledger-register", 2, 6, 7],
  ["voiceover-script", 1, 8, 8],
  ["search-query-builder", 1, 9, 9],
];
const RESEARCH_CLUSTER_APPS = [
  "company-research",
  "competitor-report",
  "customer-profile",
  "market-entry",
  "pricing-strategy",
  "selling-points",
];
const RESEARCH_CLUSTER_TABLE = [
  ["chart-template", 2, 1, 2],
  ["ledger-register", 2, 3, 4],
  ["search-query-builder", 2, 5, 6],
  ["relationship-graph", 2, 7, 8],
  ["scheme-board", 1, 9, 9],
];

test("APPS 与 L4 §3 的两张簇表逐格相等,簇表已真展开到每个 app", async () => {
  const { SITE_MATERIAL_PLAN } = await loadPlanModule();
  const byAppId = new Map(SITE_MATERIAL_PLAN.apps.map((app) => [app.appId, app]));

  assert.deepEqual(
    [...byAppId.keys()].sort(),
    [...LETTER_CLUSTER_APPS, ...RESEARCH_CLUSTER_APPS].sort(),
    "plan 的 app 集合与 L4 §3 两簇展开后的并集不等",
  );
  // L4 §3.x 覆盖校验:各簇 app 去重合计 19,簇间不得交叠。
  assert.equal(LETTER_CLUSTER_APPS.length, 13);
  assert.equal(RESEARCH_CLUSTER_APPS.length, 6);
  assert.equal(byAppId.size, 19);
  for (const appId of RESEARCH_CLUSTER_APPS) {
    assert.ok(!LETTER_CLUSTER_APPS.includes(appId), `${appId} 同时出现在两簇里`);
  }

  for (const [apps, table] of [
    [LETTER_CLUSTER_APPS, LETTER_CLUSTER_TABLE],
    [RESEARCH_CLUSTER_APPS, RESEARCH_CLUSTER_TABLE],
  ]) {
    for (const appId of apps) {
      const app = byAppId.get(appId);
      assert.ok(app, `L4 §3 点名的 ${appId} 不在 plan 里`);
      assert.deepEqual(
        app.slots.map((slot) => [
          slot.family,
          slot.count,
          slot.positions[0],
          slot.positions[1],
        ]),
        table,
        `${appId} 的族/份数/货架位次与 L4 §3 表不符`,
      );
    }
  }

  // L4 §6 场景 1:每个 app 至少映射到 5 个不同族;§3.x:全站引用族数为 8。
  const families = new Set();
  for (const app of SITE_MATERIAL_PLAN.apps) {
    const perApp = new Set(app.slots.map((slot) => slot.family));
    assert.ok(perApp.size >= 5, `${app.appId} 只映射到 ${perApp.size} 个族`);
    for (const family of perApp) families.add(family);
  }
  assert.equal(families.size, 8, `本站引用族数应为 8,实为 ${families.size}`);

  // L4 §3.x 目标素材数 19 × 9 = 171。
  const total = SITE_MATERIAL_PLAN.apps.reduce(
    (sum, app) => sum + app.slots.reduce((n, slot) => n + slot.count, 0),
    0,
  );
  assert.equal(total, 171);
});

test("映射面不含任何素材实体:无 artifactId 字段、无 URL", async () => {
  const source = await readFile(resolve("lib/site-material-plan.ts"), "utf8");
  const offenders = [...source.matchAll(/artifactId\s*:|https?:\/\/\S+/g)].map(
    (match) => match[0],
  );
  assert.deepEqual(offenders, []);
});
