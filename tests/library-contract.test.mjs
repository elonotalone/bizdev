// S10-X3 —— 「我的库」roundtrip 契约（未经验收）。
// 钉死两件事：/library 路由是共享 LibraryDetail 的【无过滤】用法（全站统一，不按当前
// 站点做二次过滤），本站 app 上下文身份只有一套归一化，缺 appId 时不产 app 绑定。

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SITE_KEY = "bizdev"; // scripts/oceanleo-sites.tsv 第 1 列
const LIBRARY_PAGE = join(ROOT, "app", "library", "page.tsx");
// 本站没有 lib/materials.ts；app 上下文身份在 lib/artifact-contexts.ts。
const CONTEXT_MODULE = join(ROOT, "lib", "artifact-contexts.ts");

test("bizdev my library route is the shared LibraryDetail with no site filter", () => {
  const page = readFileSync(LIBRARY_PAGE, "utf8");
  assert.match(page, /import \{ LibraryDetail \} from "@oceanleo\/ui\/shell"/);
  assert.match(page, /<LibraryDetail accent=\{SITE_ACCENT\} \/>/);
  assert.doesNotMatch(page, /siteId=|siteName=|sites=|curatedType/);
});

test("bizdev app context keeps one normalization and fails closed", () => {
  const source = readFileSync(CONTEXT_MODULE, "utf8");
  assert.match(source, /contextId: `olctx:v1:\$\{SITE_KEY\}:app:\$\{appId\}`/);
  assert.doesNotMatch(source, /function canonicalSegment/);
  // 空/未知 appId 不产 app 绑定：抛错，而不是回落到某个默认上下文。
  assert.match(
    source,
    /if \(!context\) throw new Error\(`unknown \$\{SITE_KEY\} artifact app: \$\{appId\}`\)/,
  );
});

test("bizdev SITE_KEY matches the site catalog key verbatim", () => {
  const source = readFileSync(CONTEXT_MODULE, "utf8");
  assert.match(source, new RegExp(`export const SITE_KEY = "${SITE_KEY}" as const`));
});
