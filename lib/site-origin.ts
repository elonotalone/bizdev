/**
 * 本站的规范 origin，按域名家族取值。
 *
 * 由 oceandino `scripts/oceanleo-cn-scaffold.py` 生成，**不要手改**。
 *
 * WHY：家族表（`@oceanleo/ui` 的 `domain-family.ts`）只管**共享包**发出来的
 * 地址。站仓自己源码里写死的 `https://<本站>.oceanleo.com` 它一个都翻不掉，
 * 于是境内站会把自己的规范地址、og:url、sitemap 全都宣称在境外 —— 分享到微信
 * 的卡片点进去落到一个国内很慢甚至打不开的站，搜索引擎也会被告知境内页面的
 * 正本在境外。
 *
 * WHY 判据挂在 `DOMAIN_FAMILY` 而不是某个 origin 变量：境内 Dockerfile 里写明
 * 「**永远不要**在 `.com` 的 Vercel 构建里设 `DOMAIN_FAMILY`」，所以 `.com` 侧
 * 这个三元的 cn 分支**可证明走不到**，产物逐字节不变。挂在 origin 变量上则要
 * 先证明 Vercel 没设那个变量，而那个证不了。
 */
export const SITE_ORIGIN =
  process.env.NEXT_PUBLIC_OCEANLEO_DOMAIN_FAMILY === "cn"
    ? "https://bizdev.oceanleo.cn"
    : "https://bizdev.oceanleo.com";

/** 只给标题/可见文案用；链接与 metadataBase 继续用完整的 SITE_ORIGIN。 */
export const SITE_HOST = new URL(SITE_ORIGIN).host;
