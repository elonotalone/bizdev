# bizdev 子站前端，打包成广州（bizdev.oceanleo.cn）能跑的镜像。
#
# 由 oceandino `scripts/oceanleo-cn-scaffold.py` 从 `scripts/oceanleo-cn-sites.tsv`
# 生成。**不要手改**：改了会在下一次 `scaffold.py check` 里被发现并覆盖。
# 要改形状就改生成器，35 个站一起改。
#
# 这份文件是门户仓 `oceanleo-cn-frontend.Dockerfile` 的参数化复制。那份是境内
# 唯一真跑通过的构建，所以这里逐条沿用它的取舍，不另发明：
#   · `.com` 由 Vercel 从同一份源码构建；这个镜像是它的境内等价物 —— 一个
#     自包含的 `next start`，运行期不碰任何境外地址。
#   · NEXT_PUBLIC_* 由 Next 在**构建期**内联进客户端包，所以是 build arg 而不是
#     运行期 env；compose 里同名的那几个是给服务端渲染用的，两边必须一致。
#   · `@oceanleo/ui` **不取** package.json 里的 `github:` pin —— 那条 pin 是
#     Vercel 构建 `.com` 用的，改它等于向 `.com` 发版。这里改用构建上下文里的
#     `.oceanleo-ui-src/`，由 workflow checkout 进来。

FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.12.1 --activate
# git: 依赖树里可能还有别的 git: 依赖，留作安全网。
RUN apk add --no-cache git
COPY package.json pnpm-lock.yaml ./

# 共享包源码。空目录或放错包必须**现在**大声失败，而不是产出一个缺了所有境内
# 修复的镜像 —— 那种镜像会正常启动、正常返回 200，只是 .cn 的一切都不对。
COPY .oceanleo-ui-src/ ./.oceanleo-ui-src/
RUN name=$(node -p "require('./.oceanleo-ui-src/package.json').name") \
    && [ "$name" = "@oceanleo/ui" ] \
    || (echo ".oceanleo-ui-src is '$name', not @oceanleo/ui" >&2; exit 1)

# 把 @oceanleo/ui 重定向到那份源码，只改这个镜像里的 package.json 副本，
# 仓库里的文件一个字不动。`file:` 指向目录时按 `files` 字段打包，与 github: pin
# 同形，只换字节来源。
RUN node -e "const fs=require('fs'),p=JSON.parse(fs.readFileSync('package.json','utf8'));\
p.pnpm={...(p.pnpm||{}),overrides:{...((p.pnpm||{}).overrides||{}),'@oceanleo/ui':'file:./.oceanleo-ui-src'}};\
fs.writeFileSync('package.json',JSON.stringify(p,null,2)+'\n');\
console.log('override:',p.pnpm.overrides)"

# --no-frozen-lockfile 只在这里：override 改了 @oceanleo/ui 解析到什么，已提交的
# lockfile 描述不了它。其余依赖仍由 lockfile 钉死。.com 的构建保持 frozen。
RUN pnpm install --no-frozen-lockfile

FROM node:22-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.12.1 --activate
# 先源码后依赖：仓库没有 .dockerignore，反过来会让工作副本的 node_modules
# 盖掉 pnpm 刚按 lockfile 解析出来的那份。
COPY . .
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json /app/pnpm-lock.yaml ./

# 境内网关。默认值就是境内的，所以无参数构建也是一个境内正确的构建，
# 而不是悄悄指向境外 API 的构建。
ARG NEXT_PUBLIC_OCEANLEO_GATEWAY_URL=https://api.oceanleo.cn
ENV NEXT_PUBLIC_OCEANLEO_GATEWAY_URL=${NEXT_PUBLIC_OCEANLEO_GATEWAY_URL}

# 本站规范 origin，进 og:url / metadataBase。境内镜像的分享卡片指向 .com 会把
# 中国用户送到一个对他们很慢甚至打不开的站。
ARG NEXT_PUBLIC_OCEANLEO_SITE_ORIGIN=https://bizdev.oceanleo.cn
ENV NEXT_PUBLIC_OCEANLEO_SITE_ORIGIN=${NEXT_PUBLIC_OCEANLEO_SITE_ORIGIN}

# 素材直链 origin。家族表里 cn 的缺省是 asset.oceanleo.cn，但那个域名今天不解析
# （素材桶在另一个阿里云账号下，本账号只有匿名只读，绑不了自定义域），
# 所以这里覆盖成桶的实际公网地址 —— 它物理在广州，不构成数据出境。
ARG NEXT_PUBLIC_OCEANLEO_ASSET_ORIGIN=https://oceanleo-assets.oss-cn-guangzhou.aliyuncs.com
ENV NEXT_PUBLIC_OCEANLEO_ASSET_ORIGIN=${NEXT_PUBLIC_OCEANLEO_ASSET_ORIGIN}

# 家族开关（oceanleo-ui/src/contracts/domain-family.ts）：com | cn。
# 不设 = com = 今天的海外行为。缺了它，境内页面的子站链接会指回 *.oceanleo.com，
# 服务端渲染出的素材/门户地址也是 .com，只有水合之后才翻成 .cn。
# 缺省 cn：这个 Dockerfile 的无参数构建就是境内构建。**永远不要**在 .com 的
# Vercel 构建里设它。
ARG NEXT_PUBLIC_OCEANLEO_DOMAIN_FAMILY=cn
ENV NEXT_PUBLIC_OCEANLEO_DOMAIN_FAMILY=${NEXT_PUBLIC_OCEANLEO_DOMAIN_FAMILY}

# 备案号页脚（@oceanleo/ui 的 IcpBeianFooter）。缺省就是真实备案号，理由同上面的
# 站点 origin：无参数构建也必须是合规构建。漏标备案号在抽查里是要求整改、
# 拒不整改可关站的项。变量为空时组件返回 null，海外产物逐字节不变。
ARG NEXT_PUBLIC_OCEANLEO_ICP_BEIAN=粤ICP备2026080430号-1
ENV NEXT_PUBLIC_OCEANLEO_ICP_BEIAN=${NEXT_PUBLIC_OCEANLEO_ICP_BEIAN}

# 公安联网备案号，比 ICP 晚办（网站开通后 30 日内），办下来前留空。
ARG NEXT_PUBLIC_OCEANLEO_POLICE_BEIAN=
ENV NEXT_PUBLIC_OCEANLEO_POLICE_BEIAN=${NEXT_PUBLIC_OCEANLEO_POLICE_BEIAN}
ARG NEXT_PUBLIC_OCEANLEO_POLICE_BEIAN_CODE=
ENV NEXT_PUBLIC_OCEANLEO_POLICE_BEIAN_CODE=${NEXT_PUBLIC_OCEANLEO_POLICE_BEIAN_CODE}

# 不是每个站都有 public/（image 就没有）。runner 阶段的 COPY 对不存在的路径是
# 硬失败（`"/app/public": not found`），而那条错误发生在构建成功**之后**，
# 读起来像镜像坏了，其实只是这个站没有静态资源目录。这里保证它存在。
RUN mkdir -p public

# 打开 next.config 里的 output:"standalone"。没有它构建照样成功，但不产出
# .next/standalone，下面的 runner 阶段会拷到空树 —— 镜像能启动、什么都不服务。
ENV OCEANLEO_BUILD_STANDALONE=1
ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm build
# 与 build 分开，好让这里的失败只可能有一个含义。
RUN test -f .next/standalone/server.js \
    || (echo "next build produced no .next/standalone/server.js" >&2; exit 1)

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 哪份共享包源码进了这个镜像。有了它，广州机上 `docker image inspect` 就能回答
# 「这个站现在跑的是哪个 @oceanleo/ui」—— 境内镜像不用 package.json 的 pin，
# 那条 pin 已经回答不了这个问题。
ARG OCEANLEO_UI_COMMIT=unknown
ARG OCEANLEO_UI_ORIGIN=unknown
ARG NEXT_PUBLIC_OCEANLEO_SITE_ORIGIN=https://bizdev.oceanleo.cn
ARG NEXT_PUBLIC_OCEANLEO_GATEWAY_URL=https://api.oceanleo.cn
LABEL cn.oceanleo.ui-commit="${OCEANLEO_UI_COMMIT}" \
      cn.oceanleo.ui-origin="${OCEANLEO_UI_ORIGIN}" \
      cn.oceanleo.site="bizdev" \
      cn.oceanleo.site-origin="${NEXT_PUBLIC_OCEANLEO_SITE_ORIGIN}" \
      cn.oceanleo.gateway="${NEXT_PUBLIC_OCEANLEO_GATEWAY_URL}"

RUN addgroup -g 1001 -S nodejs && adduser -u 1001 -S nextjs -G nodejs

# standalone/ 只带 server 和被 trace 到的依赖；static/ 与 public/ 不在里面，
# 要单独拷过来，否则页面能开但没有样式和图片。
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
ENV PORT=3105
ENV HOSTNAME=0.0.0.0
EXPOSE 3105
CMD ["node", "server.js"]
