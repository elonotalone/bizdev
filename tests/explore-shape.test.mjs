import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

// S10-X2：钉死探索页的【零配置形状】（S10 派活合同 §1.3）。
// 站点侧只交两样东西：site key 与本站 app 目录；类型、分区、标题、副标题、
// 空态文案、能力全部由 @oceanleo/ui 从 app 目录推导。以前每站手写的
// `type` / `types` / `title` / `subtitle` / `emptyHint` 正是「写错一个 type
// 就把本站素材从自己货架上筛没了」的成因（resume/law/notebook/med 四起）。
// scripts/oceanleo-capability-parity-gate.sh 的 [C4] 也逐字盯着这个形状。
// 新素材类型的显示靠共享包从 app 目录推导，**不靠站内配置**。

const SITE_KEY = "bizdev";
const PAGE_PATH = "../app/explore/page.tsx";

const raw = readFileSync(new URL(PAGE_PATH, import.meta.url), "utf8");

// 页头注释逐字引用了那些被禁的属性名，断言前先去掉注释，
// 免得「零配置」断言被本页自己的说明文字骗红。
const code = raw
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/(^|[^:])\/\/.*$/gm, "$1");

test(`${SITE_KEY} explore hands the app directory to the shared package at module scope`, () => {
  assert.match(
    code,
    /import \{[^}]*\bregisterSiteAppDirectory\b[^}]*\} from "@oceanleo\/ui\/shell";/,
  );
  assert.match(code, /from "@\/lib\/app-catalog";/);
  // 行首（零缩进）即模块作用域。SSR 与 CSR 必须拿到同一份目录，
  // 挪进 useEffect 会让首屏没有分区。
  assert.match(
    code,
    new RegExp(`^registerSiteAppDirectory\\("${SITE_KEY}", [A-Z][A-Z0-9_]*\\);$`, "m"),
  );
  assert.doesNotMatch(code, /useEffect/);
});

test(`${SITE_KEY} explore renders the shared <ExplorePage> with this site's key`, () => {
  assert.match(code, /import \{[^}]*\bExplorePage\b[^}]*\} from "@oceanleo\/ui\/shell";/);
  assert.match(
    code,
    new RegExp(`<ExplorePage siteKey="${SITE_KEY}" accent=\\{SITE_ACCENT\\} />`),
  );
});

test(`${SITE_KEY} explore keeps zero capability configuration in the site`, () => {
  assert.doesNotMatch(code, /\btypes=/);
  assert.doesNotMatch(code, /\btype=/);
  assert.doesNotMatch(code, /curatedType/);
  assert.doesNotMatch(code, /\btitle=/);
  assert.doesNotMatch(code, /\bsubtitle=/);
  assert.doesNotMatch(code, /\bemptyHint=/);
  // [C4] 的其余禁用 prop 与站内自造分类表。
  assert.doesNotMatch(code, /\bsiteId=|\bconfig=|\bcategories=/);
  assert.doesNotMatch(code, /\bExploreCategory\b|\bcategories\s*[:=]\s*\[/);
});
