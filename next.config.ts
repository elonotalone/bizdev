import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@oceanleo/ui"],
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  async redirects() {
    return [
      // 旧业务路由 301 到统一工作台。
      { source: "/reply", destination: "/workspace?fn=reply", permanent: true },
      { source: "/research", destination: "/workspace?fn=research", permanent: true },
      { source: "/competition", destination: "/workspace?fn=competition", permanent: true },
      { source: "/dev-letter", destination: "/workspace?fn=dev-letter", permanent: true },
      { source: "/trade-talk", destination: "/workspace?fn=trade-talk", permanent: true },
    ];
  },
};


const withNextIntl = createNextIntlPlugin("./i18n/request.ts");
export default withNextIntl(nextConfig);

