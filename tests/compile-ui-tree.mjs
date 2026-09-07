// 把 @oceanleo/ui 的 TS 源码编译成可直接 `import()` 的 data: URL 模块树。
//
// 为什么需要它：这些「消费方契约」测试直接编译 ui 的源文件（不是构建产物）来断言
// 站点与共享 shell 的真实接口。data: 模块没有 base URL，源码里每一个相对 value import
// （`./x`、`../y`）都必须被换成另一个 data: URL，漏一个就是加载期
// ERR_UNSUPPORTED_RESOLVE_REQUEST，整份测试文件一条都跑不到。以前每个测试文件手写
// 这张替换表，ui 每加一条相对 import（v0.216 的 `./artifact-contract`、
// `../contracts/domain-family`、`./workbench-route-formats`…）就红一次。
//
// 这里改成按 transpile 之后的产物**递归**追相对 import（type-only import 已被 TS 抹掉，
// 所以只会追真正需要的 value 依赖），同一源文件只编译一次（同一 URL = 同一模块实例）。
// 想用桩替换某个模块时：
//   - `overrides`：按相对 `src/` 的无扩展名路径（如 `lib/auth/client`）全树生效；
//   - `compile(path, { "./artifact-client": url })`：只对这个文件自己的 import 生效。
// 被谁调用：tests/*.test.mjs 里所有需要编译 ui 源码的地方。
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, extname, relative, resolve as resolvePath } from "node:path";
import { pathToFileURL } from "node:url";

import ts from "typescript";

const RESOLVE_SUFFIXES = [
  "",
  ".ts",
  ".tsx",
  ".mts",
  ".mjs",
  ".js",
  "/index.ts",
  "/index.tsx",
];

export function dataModule(source) {
  return `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
}

const EMPTY_MODULE_URL = dataModule("export default {};");

function isRelative(specifier) {
  return specifier.startsWith("./") || specifier.startsWith("../");
}

function resolveRelative(fromFile, specifier) {
  const base = resolvePath(dirname(fromFile), specifier);
  for (const suffix of RESOLVE_SUFFIXES) {
    const candidate = `${base}${suffix}`;
    if (suffix === "" && extname(candidate) === "") continue;
    if (existsSync(candidate)) return candidate;
  }
  throw new Error(`compile-ui-tree: 解析不到 ${specifier}（来自 ${fromFile}）`);
}

/**
 * @param {object} options
 * @param {string} options.srcRoot  `@oceanleo/ui/src` 的绝对路径
 * @param {Record<string, string>} [options.overrides]  相对 src 的无扩展名路径 → 模块 URL
 * @param {Record<string, string>} [options.bare]  裸模块名 → 模块 URL（默认解析 react 系）
 */
export function createUiTreeCompiler({ srcRoot, overrides = {}, bare = {} }) {
  const memo = new Map();
  const inProgress = new Set();

  function overrideKey(absPath) {
    const rel = relative(srcRoot, absPath).replaceAll("\\", "/");
    return rel.replace(/\.(tsx?|mts|mjs|js)$/, "");
  }

  function bareUrl(specifier, fromFile) {
    if (bare[specifier]) return bare[specifier];
    try {
      return pathToFileURL(createRequire(fromFile).resolve(specifier)).href;
    } catch {
      // 解析不了就原样留下：真正 import 时报的错会指出是哪个包。
      return null;
    }
  }

  async function compile(absPath, localReplacements = {}) {
    const hasLocal = Object.keys(localReplacements).length > 0;
    const memoKey = hasLocal
      ? `${absPath}\u0000${JSON.stringify(localReplacements)}`
      : absPath;
    if (memo.has(memoKey)) return memo.get(memoKey);
    if (inProgress.has(memoKey)) {
      throw new Error(
        `compile-ui-tree: ${overrideKey(absPath)} 存在 value import 环，data: 模块表达不了环。`,
      );
    }
    inProgress.add(memoKey);
    try {
      const source = await readFile(absPath, "utf8");
      let output = ts.transpileModule(source, {
        compilerOptions: {
          jsx: ts.JsxEmit.ReactJSX,
          module: ts.ModuleKind.ESNext,
          target: ts.ScriptTarget.ES2022,
        },
        fileName: absPath,
      }).outputText;
      const { importedFiles } = ts.preProcessFile(output, true, true);
      const specifiers = [
        ...new Set(importedFiles.map((entry) => entry.fileName)),
      ];
      for (const specifier of specifiers) {
        let url;
        if (localReplacements[specifier]) {
          url = localReplacements[specifier];
        } else if (isRelative(specifier)) {
          if (/\.css$/.test(specifier)) {
            // Next 打包用的副作用样式导入，对逻辑断言没有意义。
            url = EMPTY_MODULE_URL;
          } else {
            const target = resolveRelative(absPath, specifier);
            const key = overrideKey(target);
            url = overrides[key] ?? (await compile(target));
          }
        } else {
          url = bareUrl(specifier, absPath);
          if (!url) continue;
        }
        output = output.replaceAll(
          JSON.stringify(specifier),
          JSON.stringify(url),
        );
      }
      const url = `${dataModule(output)}#${encodeURIComponent(
        overrideKey(absPath),
      )}`;
      memo.set(memoKey, url);
      return url;
    } finally {
      inProgress.delete(memoKey);
    }
  }

  return {
    compile,
    /** 按相对 src 的路径编译，如 `shell/artifact-contract.ts`。 */
    compileSrc: (relPath, localReplacements) =>
      compile(resolvePath(srcRoot, relPath), localReplacements),
  };
}
