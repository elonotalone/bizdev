# LeoBizDev — 外贸 / 出海 AI 工作台

`bizdev.oceanleo.com` · OceanLeo 全家桶站点之一。

把外贸业务员最高价值、最可移植的 AI 能力做成「功能区 = 操作台 = agent」，全部走
OceanLeo 统一网关 `api.oceanleo.com`，按真实 token 计费（充值人民币钱包）。

## 功能区（A 类：纯 LLM，用户提供素材）

- `/workspace?fn=reply` 智能回复：粘贴客户邮件/WhatsApp → AI 给「理解与对策」+ 生成专业回复，可指定语气/角色、可润色
- `/workspace?fn=research` 公司调研：粘贴目标公司资料/官网文案 → AI 输出商业模式 / 市场地位 / 决策人画像 / 合作切入点报告
- `/workspace?fn=competition` 竞品分析：粘贴自家 + 竞品信息 → AI 出价格/功能/卖点对比与差异化打法
- `/workspace?fn=dev-letter` 开发信：按目标客户/产品/卖点 → AI 写多版本外贸开发信（冷启动/跟进/报价跟单）
- `/workspace?fn=trade-talk` 外贸翻译：外贸语境多语种互译 + 话术本地化（保留术语、商务礼仪、单位/习惯）

## 已 deferred（待 trade-engine 部署后点亮）

全网竞品扫描、自动抓官网/LinkedIn/新闻做调研、客户地图搜索、海关数据——这些需要
Playwright/RAG/Serper/Maps 的后端（旧 `trade-engine`），本轮不部署。详见
`docs/architecture/oceanleo-bizdev-app.md`（oceandino 仓）。

## 技术栈

- Next.js 16 + React 19 + Tailwind v4
- OceanLeo 跨子域 SSO（`lib/oceanleo-auth/`，cookie 作用域 `.oceanleo.com`）
- 统一 AI 网关 `api.oceanleo.com`（`lib/ai.ts` → `/v1/chat`，site_id=`bizdev`，platform key 模式）
- 共享外壳 `@oceanleo/ui`（AppShell / OperatorConsole / FunctionAgentChat / 账户·设置·API 页）
- Vercel 部署（`sin1`），push `main` 自动上线

## 本地开发

```bash
cp .env.example .env.local   # 补齐 NEXT_PUBLIC_OCEANLEO_ANON_KEY
npm install
npm run dev
```
