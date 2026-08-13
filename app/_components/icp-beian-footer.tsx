/**
 * 境内合规页脚 —— ICP 备案号 + 公安联网备案号。
 *
 * 由 oceandino `scripts/oceanleo-cn-scaffold.py` 生成，35 个站仓各一份。
 * **不要手改**，改生成器。
 *
 * WHY 每个仓一份本地组件，而不是放进 @oceanleo/ui
 * ---------------------------------------------------------------------------
 * 试过，是错的：消费站的 package.json 把 `@oceanleo/ui` 钉在
 * `github:...#v0.211.x` 上，共享包 main 上的新导出**到不了**消费站，
 * Vercel 构建会红在解析不到这个导出。要让共享件到达消费站只有发版一条路，
 * 而境内这条链不该被 `.com` 的发版节奏卡住。
 *
 * 反对「复制 35 遍」的理由本来是「必然漏掉几个」，那条理由对**生成物**不成立。
 *
 * WHY 用构建期环境变量而不是按请求 host 判断：按 host 生成会让根布局动态化，
 * 全站丢掉 RSC 预取。而且这样 `.com` 的产物逐字节不变 —— 变量没设 → 返回
 * null → 海外页面上连一个空 div 都不会多。变量只在境内镜像的 Dockerfile 里设。
 *
 * 公安备案号单独一个变量：它比 ICP 晚办（网站开通后 30 日内另办），
 * 没下来就留空，只显示 ICP 那一行。
 */

const ICP = (process.env.NEXT_PUBLIC_OCEANLEO_ICP_BEIAN || "").trim();
// 形如 "粤公网安备 44030702001234号"，配套的记录 id 用于拼平台查询链接。
const POLICE = (process.env.NEXT_PUBLIC_OCEANLEO_POLICE_BEIAN || "").trim();
const POLICE_CODE = (
  process.env.NEXT_PUBLIC_OCEANLEO_POLICE_BEIAN_CODE || ""
).trim();

export function IcpBeianFooter() {
  if (!ICP) return null;
  return (
    <footer className="mt-auto flex flex-wrap items-center justify-center gap-x-4 gap-y-1 px-4 py-6 text-xs text-neutral-500 dark:text-neutral-400">
      <a
        href="https://beian.miit.gov.cn/"
        target="_blank"
        rel="noreferrer"
        className="hover:text-neutral-700 dark:hover:text-neutral-200"
      >
        {ICP}
      </a>
      {POLICE ? (
        <a
          href={
            POLICE_CODE
              ? `https://beian.mps.gov.cn/#/query/webSearch?code=${encodeURIComponent(POLICE_CODE)}`
              : "https://beian.mps.gov.cn/"
          }
          target="_blank"
          rel="noreferrer"
          className="hover:text-neutral-700 dark:hover:text-neutral-200"
        >
          {POLICE}
        </a>
      ) : null}
    </footer>
  );
}
