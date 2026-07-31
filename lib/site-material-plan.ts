// 本站 L4 §3 映射表的机器可读投影。
// 唯一依据:docs/specs/oceanleo-material-and-game-v1/L4-sites/<siteKey>.md §3 与 §4。
// 本文件【只描述映射关系】,不含任何素材实体、artifactId、字节下限或质量断言 ——
// 后者分别属于 6号 的批产与 L3/L1 各族各载体自己的验收段。

import { ARTIFACT_TYPES, type ArtifactType } from "@oceanleo/ui/artifact";

/**
 * G2 已落库、但装机版 @oceanleo/ui\@0.205.0 的 ArtifactType 联合里还没有的两个类型。
 * 它们只能出现在【映射面数据】里,不得进入任何类型面代码 —— 否则对 0.205.0 必然 typecheck 红。
 * 解除条件:11号 发出含 oceanleo-ui\@7bee5da 的新 tag 并 bump 本站 pin。
 */
export const PENDING_UI_ARTIFACT_TYPES = ["geo_map", "interactive_doc"] as const;
export type PendingUiArtifactType = (typeof PENDING_UI_ARTIFACT_TYPES)[number];

/** 映射面允许出现的类型 = 装机版 14 项 + 待发版 2 项。 */
export type PlannedArtifactType = ArtifactType | PendingUiArtifactType;

export interface ShelfSlot {
  /** L4 §3 首列的族 slug,必须与 docs/specs/.../L3-families/<slug>.md 同名。 */
  readonly family: string;
  readonly artifactType: PlannedArtifactType;
  /** 每个 app 在该族下的份数。 */
  readonly count: number;
  /** 货架位次闭区间 [起, 止],对应 template_materials.position。 */
  readonly positions: readonly [number, number];
}

export interface AppPlan {
  readonly appId: string;
  readonly slots: readonly ShelfSlot[];
}

export interface SiteMaterialPlan {
  readonly siteKey: string;
  readonly targetPerApp: number;
  readonly apps: readonly AppPlan[];
}

export function isPendingUiArtifactType(
  value: PlannedArtifactType,
): value is PendingUiArtifactType {
  return (PENDING_UI_ARTIFACT_TYPES as readonly string[]).includes(value);
}

/** 本站映射面用到的、【已经】可进类型面代码的类型(即已在装机版联合里的那些)。 */
export function landableArtifactTypes(plan: SiteMaterialPlan): ArtifactType[] {
  const seen = new Set<string>();
  for (const app of plan.apps) {
    for (const slot of app.slots) {
      if (!isPendingUiArtifactType(slot.artifactType)) seen.add(slot.artifactType);
    }
  }
  return [...seen].sort() as ArtifactType[];
}

/** 本站仍在等 UI 发版的类型。收工报告与 V1 直接读它,不靠人工誊抄。 */
export function pendingArtifactTypes(plan: SiteMaterialPlan): PendingUiArtifactType[] {
  const seen = new Set<PendingUiArtifactType>();
  for (const app of plan.apps) {
    for (const slot of app.slots) {
      if (isPendingUiArtifactType(slot.artifactType)) seen.add(slot.artifactType);
    }
  }
  return [...seen].sort();
}

/**
 * L4 §6 场景 1 与场景 2 的映射完备性判据,fail-closed 返回逐条错误。
 * 空数组 = 通过。**不要改成抛异常**,V2 要读全量错误清单。
 */
export function validateSiteMaterialPlan(plan: SiteMaterialPlan): string[] {
  const errors: string[] = [];
  if (!plan.siteKey.trim()) errors.push("siteKey is empty");
  if (!Number.isInteger(plan.targetPerApp) || plan.targetPerApp <= 0) {
    errors.push(`targetPerApp must be a positive integer, got ${plan.targetPerApp}`);
  }
  if (plan.apps.length === 0) errors.push("plan has no apps");

  const seenAppIds = new Set<string>();
  for (const app of plan.apps) {
    if (!app.appId.trim()) errors.push("an app has an empty appId");
    if (seenAppIds.has(app.appId)) errors.push(`duplicate appId: ${app.appId}`);
    seenAppIds.add(app.appId);

    let total = 0;
    const occupied = new Map<number, string>();
    for (const slot of app.slots) {
      if (!slot.family.trim()) errors.push(`${app.appId}: a slot has an empty family`);
      if (!Number.isInteger(slot.count) || slot.count <= 0) {
        errors.push(`${app.appId}/${slot.family}: count must be a positive integer`);
      }
      const [from, to] = slot.positions;
      if (!Number.isInteger(from) || !Number.isInteger(to) || from > to || from < 1) {
        errors.push(`${app.appId}/${slot.family}: bad position range ${from}..${to}`);
        continue;
      }
      if (to - from + 1 !== slot.count) {
        errors.push(
          `${app.appId}/${slot.family}: positions ${from}..${to} hold ${to - from + 1} slots but count is ${slot.count}`,
        );
      }
      for (let position = from; position <= to; position += 1) {
        const owner = occupied.get(position);
        if (owner) {
          errors.push(`${app.appId}: position ${position} claimed by both ${owner} and ${slot.family}`);
        }
        occupied.set(position, slot.family);
      }
      total += slot.count;
      if (
        !isPendingUiArtifactType(slot.artifactType) &&
        !(ARTIFACT_TYPES as readonly string[]).includes(slot.artifactType)
      ) {
        errors.push(`${app.appId}/${slot.family}: unknown artifactType ${slot.artifactType}`);
      }
    }
    if (total !== plan.targetPerApp) {
      errors.push(`${app.appId}: slots total ${total} but targetPerApp is ${plan.targetPerApp}`);
    }
    for (let position = 1; position <= plan.targetPerApp; position += 1) {
      if (!occupied.has(position)) errors.push(`${app.appId}: position ${position} is a hole`);
    }
  }
  return errors;
}

/** L4 §6 场景 1 的另一半:计划覆盖的 app 集合必须与本站 app 目录【逐字相等】。 */
export function diffPlanAgainstCatalog(
  plan: SiteMaterialPlan,
  catalogAppIds: readonly string[],
): { missingFromPlan: string[]; notInCatalog: string[] } {
  const planned = new Set(plan.apps.map((app) => app.appId));
  const catalog = new Set(catalogAppIds);
  return {
    missingFromPlan: [...catalog].filter((id) => !planned.has(id)).sort(),
    notInCatalog: [...planned].filter((id) => !catalog.has(id)).sort(),
  };
}

// ── 以下三处按本站 L4 填(契约允许偏离的唯一部分)────────────────────────────

export const SITE_KEY = "bizdev";

/** L4 §4:每 app 9 份 = 3 + 2 + 2 + 1 + 1,两簇族组合不同但总数同为 9。 */
export const TARGET_PER_APP = 9;

/**
 * L4 §3.1 的四列表。artifactType 取自 L4 §2 的本站类型清册
 * (保留 `document` / `deck`,新增 `grid` / `chart` / `interactive_doc`):
 * 话术分支与检索式「要能点着走」→ `interactive_doc`;台账 → `grid`。
 */
const LETTER_CLUSTER_SLOTS: readonly ShelfSlot[] = [
  { family: "dialogue-branch-script", artifactType: "interactive_doc", count: 3, positions: [1, 3] },
  { family: "contract-assembly", artifactType: "document", count: 2, positions: [4, 5] },
  { family: "ledger-register", artifactType: "grid", count: 2, positions: [6, 7] },
  { family: "voiceover-script", artifactType: "document", count: 1, positions: [8, 8] },
  { family: "search-query-builder", artifactType: "interactive_doc", count: 1, positions: [9, 9] },
];

/**
 * L4 §3.2 的四列表。图表模板族 → `chart`(L4 §2:竞品对比与定价策略需要可重算的图);
 * 关系图族同属「可重算的图」一支,方案板沿用保留的 `deck`(客户提案)。
 */
const RESEARCH_CLUSTER_SLOTS: readonly ShelfSlot[] = [
  { family: "chart-template", artifactType: "chart", count: 2, positions: [1, 2] },
  { family: "ledger-register", artifactType: "grid", count: 2, positions: [3, 4] },
  { family: "search-query-builder", artifactType: "interactive_doc", count: 2, positions: [5, 6] },
  { family: "relationship-graph", artifactType: "chart", count: 2, positions: [7, 8] },
  { family: "scheme-board", artifactType: "deck", count: 1, positions: [9, 9] },
];

/** L4 §3.1 的 13 个 app 与 §3.2 的 6 个 app,逐行展开,合计 19(L4 §3.x 覆盖校验)。 */
export const APPS: readonly AppPlan[] = [
  { appId: "cold-email", slots: LETTER_CLUSTER_SLOTS },
  { appId: "complaint-reply", slots: LETTER_CLUSTER_SLOTS },
  { appId: "exhibition-invite", slots: LETTER_CLUSTER_SLOTS },
  { appId: "follow-up", slots: LETTER_CLUSTER_SLOTS },
  { appId: "inquiry-reply", slots: LETTER_CLUSTER_SLOTS },
  { appId: "multilang-notice", slots: LETTER_CLUSTER_SLOTS },
  { appId: "negotiation-reply", slots: LETTER_CLUSTER_SLOTS },
  { appId: "order-confirm-reply", slots: LETTER_CLUSTER_SLOTS },
  { appId: "product-intro-letter", slots: LETTER_CLUSTER_SLOTS },
  { appId: "reactivate-email", slots: LETTER_CLUSTER_SLOTS },
  { appId: "whatsapp-reply", slots: LETTER_CLUSTER_SLOTS },
  { appId: "term-localize", slots: LETTER_CLUSTER_SLOTS },
  { appId: "trade-translate", slots: LETTER_CLUSTER_SLOTS },
  { appId: "company-research", slots: RESEARCH_CLUSTER_SLOTS },
  { appId: "competitor-report", slots: RESEARCH_CLUSTER_SLOTS },
  { appId: "customer-profile", slots: RESEARCH_CLUSTER_SLOTS },
  { appId: "market-entry", slots: RESEARCH_CLUSTER_SLOTS },
  { appId: "pricing-strategy", slots: RESEARCH_CLUSTER_SLOTS },
  { appId: "selling-points", slots: RESEARCH_CLUSTER_SLOTS },
];

export const SITE_MATERIAL_PLAN: SiteMaterialPlan = {
  siteKey: SITE_KEY,
  targetPerApp: TARGET_PER_APP,
  apps: APPS,
};
