"use client";

// ============================================================================
// bizdev.oceanleo.com —— 成品 app 目录（宗旨 v14，操作员 2026-07-05）
// ----------------------------------------------------------------------------
// 工作台首页 = 一批【面向目的的成品外贸 app】卡片（名词化：询盘回复 / 开发信 /
// 客户公司调研 / 竞品对比报告 / 报价跟进信 / 外贸翻译 / 展会邀请函 …，≥20 个），
// 顶部横排分类器 = 本站【自定义场景词】（询盘回复 / 客户开发 / 市场调研 / 竞品对标 /
// 多语沟通 / 成交跟进）。
//
// 引擎（方案 A）：全部成品复用现成的五大引擎——智能回复 / 公司调研 / 竞品分析 /
// 开发信 / 外贸翻译（各自的 ops + 后端 agent）。差异只在进入时灌进操作台【主输入
// 字段】的预置 prompt 模板。每个成品声明它走哪个引擎（engine）+ 三个模板板块。
// ============================================================================

import { type GoalApp, type GuideSection } from "@oceanleo/ui/shell";

// 功能图：W5 流水线产出（cap-app/bizdev-<appId>），逐条 GET 200 + Content-Type 实证。
// 存 OSS key，不存整条 URL；渲染层用 @oceanleo/ui 的 capabilityImageThumbSrc()。
const capImage = (appId: string): string => `cap-app/bizdev-${appId}`;

// 模板素材：W6 流水线产出（tpl-material/bizdev-<appId>-<n>），预览逐条 GET 200 实证。
// previewUrl 存 OSS key；artifactId 是「编辑模板」载入的正式产物对象（owner=platform，仅授权 export）。
const TEMPLATES: Record<string, { id: string; title: string; summary: string; tags: string[]; previewUrl: string; artifactId: string; artifactType: "document" }[]> = {
  "inquiry-reply": [
      {
        id: "bizdev-inquiry-reply-1",
        title: "询盘回复成品样例（首封）",
        summary: "一封可直接发出的询盘首复：24 小时内确认、按客户问题逐条作答、附三档报价前提与下一步，换产品与客户名即可复用。",
        tags: ["询盘回复", "首复", "外贸邮件"],
        previewUrl: "tpl-material/bizdev-inquiry-reply-1",
        artifactId: "892e7590-7a70-440c-a616-be3c49731eb4",
        artifactType: "document",
      },
      {
        id: "bizdev-inquiry-reply-2",
        title: "询盘回复简短快回成品样例",
        summary: "六行以内的快速回复：先给确定的答复、再给一个明确的下一步，适合移动端即时回复，避免客户久等。",
        tags: ["快速回复", "简短", "移动端"],
        previewUrl: "tpl-material/bizdev-inquiry-reply-2",
        artifactId: "bb71102e-d854-48c7-9f15-83df8c4da106",
        artifactType: "document",
      },
      {
        id: "bizdev-inquiry-reply-3",
        title: "询盘回复正式方案书成品样例",
        summary: "带报价结构的正式方案：需求复述、方案说明、三档报价与前提、交付节奏与付款方式，可直接作为附件发给客户。",
        tags: ["正式方案", "三档报价", "可附件"],
        previewUrl: "tpl-material/bizdev-inquiry-reply-3",
        artifactId: "cf73cd3d-20ae-43d9-9e00-f85bd0bd1fad",
        artifactType: "document",
      },
      {
        id: "bizdev-inquiry-reply-4",
        title: "询盘回复中英对照函件样例",
        summary: "中英逐段对照的商务函件，左中右不分栏而是段段对照，方便直接改写成任一语种发出，适合外贸与跨境沟通。",
        tags: ["中英对照", "外贸函件", "双语"],
        previewUrl: "tpl-material/bizdev-inquiry-reply-4",
        artifactId: "b8507e0c-91d9-476b-aeb5-d9b1e4cb7865",
        artifactType: "document",
      },
  ],
  "complaint-reply": [
      {
        id: "bizdev-complaint-reply-1",
        title: "客诉处理回复成品样例",
        summary: "一封稳住客户的客诉回复：先致歉与承担、再给事实与原因、然后给补救三选项与时间表，避免推诿与空承诺。",
        tags: ["客诉", "补救方案", "外贸邮件"],
        previewUrl: "tpl-material/bizdev-complaint-reply-1",
        artifactId: "47d4bcf0-e5ff-4cce-849e-3fb7aa292bcf",
        artifactType: "document",
      },
      {
        id: "bizdev-complaint-reply-2",
        title: "投诉处理回复简短快回成品样例",
        summary: "六行以内的快速回复：先给确定的答复、再给一个明确的下一步，适合移动端即时回复，避免客户久等。",
        tags: ["快速回复", "简短", "移动端"],
        previewUrl: "tpl-material/bizdev-complaint-reply-2",
        artifactId: "c690cefe-f0dd-46d8-ae06-1ccde4dcb7a7",
        artifactType: "document",
      },
      {
        id: "bizdev-complaint-reply-3",
        title: "投诉处理回复正式方案书成品样",
        summary: "带报价结构的正式方案：需求复述、方案说明、三档报价与前提、交付节奏与付款方式，可直接作为附件发给客户。",
        tags: ["正式方案", "三档报价", "可附件"],
        previewUrl: "tpl-material/bizdev-complaint-reply-3",
        artifactId: "c203ac61-a9f2-4387-a00a-a50752ae2610",
        artifactType: "document",
      },
      {
        id: "bizdev-complaint-reply-4",
        title: "投诉处理回复中英对照函件样例",
        summary: "中英逐段对照的商务函件，左中右不分栏而是段段对照，方便直接改写成任一语种发出，适合外贸与跨境沟通。",
        tags: ["中英对照", "外贸函件", "双语"],
        previewUrl: "tpl-material/bizdev-complaint-reply-4",
        artifactId: "0cc7c3fb-4fc3-4c30-96c1-70af7af654af",
        artifactType: "document",
      },
  ],
  "whatsapp-reply": [
      {
        id: "bizdev-whatsapp-reply-1",
        title: "WhatsApp 快回话术成品样例",
        summary: "一组即时消息场景的短回复模板：询价、催单、砍价、样品、失联五类，每条都口语、简短、带明确下一步。",
        tags: ["WhatsApp", "短回复", "话术"],
        previewUrl: "tpl-material/bizdev-whatsapp-reply-1",
        artifactId: "5c2aefd3-30cf-4812-b300-8bc031d2cd8a",
        artifactType: "document",
      },
      {
        id: "bizdev-whatsapp-reply-2",
        title: "WhatsApp 快回简短快",
        summary: "六行以内的快速回复：先给确定的答复、再给一个明确的下一步，适合移动端即时回复，避免客户久等。",
        tags: ["快速回复", "简短", "移动端"],
        previewUrl: "tpl-material/bizdev-whatsapp-reply-2",
        artifactId: "eb04f046-c722-48ed-bb3b-10cc7478440e",
        artifactType: "document",
      },
      {
        id: "bizdev-whatsapp-reply-3",
        title: "WhatsApp 快回正式方",
        summary: "带报价结构的正式方案：需求复述、方案说明、三档报价与前提、交付节奏与付款方式，可直接作为附件发给客户。",
        tags: ["正式方案", "三档报价", "可附件"],
        previewUrl: "tpl-material/bizdev-whatsapp-reply-3",
        artifactId: "b5f10c8b-7d03-43fb-a1ba-b1072a600f7f",
        artifactType: "document",
      },
      {
        id: "bizdev-whatsapp-reply-4",
        title: "WhatsApp 快回中英对",
        summary: "中英逐段对照的商务函件，左中右不分栏而是段段对照，方便直接改写成任一语种发出，适合外贸与跨境沟通。",
        tags: ["中英对照", "外贸函件", "双语"],
        previewUrl: "tpl-material/bizdev-whatsapp-reply-4",
        artifactId: "387a0732-6cac-400c-9916-6b8b52dd231d",
        artifactType: "document",
      },
  ],
  "negotiation-reply": [
      {
        id: "bizdev-negotiation-reply-1",
        title: "议价谈判回复成品样例",
        summary: "一封守住利润的议价回信：不直接降价、用条件交换、给三档结构化报价并设有效期，附让步顺序与底线备忘。",
        tags: ["议价", "谈判", "报价结构"],
        previewUrl: "tpl-material/bizdev-negotiation-reply-1",
        artifactId: "a47621da-ea7c-4028-a302-6f58405c3cf2",
        artifactType: "document",
      },
      {
        id: "bizdev-negotiation-reply-2",
        title: "谈判议价回复简短快回成品样例",
        summary: "六行以内的快速回复：先给确定的答复、再给一个明确的下一步，适合移动端即时回复，避免客户久等。",
        tags: ["快速回复", "简短", "移动端"],
        previewUrl: "tpl-material/bizdev-negotiation-reply-2",
        artifactId: "f82a829e-66c0-46b5-860b-9f7b77e5ea23",
        artifactType: "document",
      },
      {
        id: "bizdev-negotiation-reply-3",
        title: "谈判议价回复正式方案书成品样",
        summary: "带报价结构的正式方案：需求复述、方案说明、三档报价与前提、交付节奏与付款方式，可直接作为附件发给客户。",
        tags: ["正式方案", "三档报价", "可附件"],
        previewUrl: "tpl-material/bizdev-negotiation-reply-3",
        artifactId: "3b356a66-681b-4711-a084-3abc346e3f72",
        artifactType: "document",
      },
      {
        id: "bizdev-negotiation-reply-4",
        title: "谈判议价回复中英对照函件样例",
        summary: "中英逐段对照的商务函件，左中右不分栏而是段段对照，方便直接改写成任一语种发出，适合外贸与跨境沟通。",
        tags: ["中英对照", "外贸函件", "双语"],
        previewUrl: "tpl-material/bizdev-negotiation-reply-4",
        artifactId: "f1c17c83-26eb-45d8-aac6-414d5df0379b",
        artifactType: "document",
      },
  ],
  "cold-email": [
      {
        id: "bizdev-cold-email-1",
        title: "开发信成品样例（首触）",
        summary: "一封高回复率的开发信：只讲一个与对方相关的具体点、不群发口吻、给一个极低门槛的下一步，附主题行备选与跟进节奏。",
        tags: ["开发信", "首触", "高回复"],
        previewUrl: "tpl-material/bizdev-cold-email-1",
        artifactId: "2e8e9bd3-5d1e-464e-b234-3c54ea70d3ac",
        artifactType: "document",
      },
      {
        id: "bizdev-cold-email-2",
        title: "开发信简短快回成品样例",
        summary: "六行以内的快速回复：先给确定的答复、再给一个明确的下一步，适合移动端即时回复，避免客户久等。",
        tags: ["快速回复", "简短", "移动端"],
        previewUrl: "tpl-material/bizdev-cold-email-2",
        artifactId: "157d922c-980a-4cf7-b278-3d4d52c130f4",
        artifactType: "document",
      },
      {
        id: "bizdev-cold-email-3",
        title: "开发信正式方案书成品样例",
        summary: "带报价结构的正式方案：需求复述、方案说明、三档报价与前提、交付节奏与付款方式，可直接作为附件发给客户。",
        tags: ["正式方案", "三档报价", "可附件"],
        previewUrl: "tpl-material/bizdev-cold-email-3",
        artifactId: "27af3bab-49cc-4a08-ba43-30dc48a044ff",
        artifactType: "document",
      },
      {
        id: "bizdev-cold-email-4",
        title: "开发信中英对照函件样例",
        summary: "中英逐段对照的商务函件，左中右不分栏而是段段对照，方便直接改写成任一语种发出，适合外贸与跨境沟通。",
        tags: ["中英对照", "外贸函件", "双语"],
        previewUrl: "tpl-material/bizdev-cold-email-4",
        artifactId: "337c5783-24fd-4b35-9039-3bbe45bf7b45",
        artifactType: "document",
      },
  ],
  "reactivate-email": [
      {
        id: "bizdev-reactivate-email-1",
        title: "唤醒沉睡客户成品样例",
        summary: "一封让老客户愿意回信的唤醒信：先承认断联、给出对方离开后的真实变化、只提一个具体理由，附三种客户状态的分支写法。",
        tags: ["唤醒", "老客户", "复购"],
        previewUrl: "tpl-material/bizdev-reactivate-email-1",
        artifactId: "0a97a08f-45ff-4d9f-9fb7-7ab0809737af",
        artifactType: "document",
      },
      {
        id: "bizdev-reactivate-email-2",
        title: "唤醒沉睡客户简短快回成品样例",
        summary: "六行以内的快速回复：先给确定的答复、再给一个明确的下一步，适合移动端即时回复，避免客户久等。",
        tags: ["快速回复", "简短", "移动端"],
        previewUrl: "tpl-material/bizdev-reactivate-email-2",
        artifactId: "4c33c1c3-5e1b-4a87-aa18-d003ee9c5a05",
        artifactType: "document",
      },
      {
        id: "bizdev-reactivate-email-3",
        title: "唤醒沉睡客户正式方案书成品样",
        summary: "带报价结构的正式方案：需求复述、方案说明、三档报价与前提、交付节奏与付款方式，可直接作为附件发给客户。",
        tags: ["正式方案", "三档报价", "可附件"],
        previewUrl: "tpl-material/bizdev-reactivate-email-3",
        artifactId: "a0f2c921-b9bd-4186-983e-5147180dc9dc",
        artifactType: "document",
      },
      {
        id: "bizdev-reactivate-email-4",
        title: "唤醒沉睡客户中英对照函件样例",
        summary: "中英逐段对照的商务函件，左中右不分栏而是段段对照，方便直接改写成任一语种发出，适合外贸与跨境沟通。",
        tags: ["中英对照", "外贸函件", "双语"],
        previewUrl: "tpl-material/bizdev-reactivate-email-4",
        artifactId: "954b3c4a-709d-49f3-9dfc-b15c63a32f4b",
        artifactType: "document",
      },
  ],
  "exhibition-invite": [
      {
        id: "bizdev-exhibition-invite-1",
        title: "展会邀请函成品样例",
        summary: "一封能约到具体时段的展位邀约信：给出展位号与到达路线、明确现场能看到什么、附三个可选时段与随行准备清单。",
        tags: ["展会邀请", "展位", "约时段"],
        previewUrl: "tpl-material/bizdev-exhibition-invite-1",
        artifactId: "aadcb563-9db1-4b4d-b45e-4593205d05a2",
        artifactType: "document",
      },
      {
        id: "bizdev-exhibition-invite-2",
        title: "展会邀请函简短快回成品样例",
        summary: "六行以内的快速回复：先给确定的答复、再给一个明确的下一步，适合移动端即时回复，避免客户久等。",
        tags: ["快速回复", "简短", "移动端"],
        previewUrl: "tpl-material/bizdev-exhibition-invite-2",
        artifactId: "91b15551-f321-4c72-8ff5-926845643f57",
        artifactType: "document",
      },
      {
        id: "bizdev-exhibition-invite-3",
        title: "展会邀请函正式方案书成品样例",
        summary: "带报价结构的正式方案：需求复述、方案说明、三档报价与前提、交付节奏与付款方式，可直接作为附件发给客户。",
        tags: ["正式方案", "三档报价", "可附件"],
        previewUrl: "tpl-material/bizdev-exhibition-invite-3",
        artifactId: "62a3a910-425a-46e3-860f-4a3084c761ed",
        artifactType: "document",
      },
      {
        id: "bizdev-exhibition-invite-4",
        title: "展会邀请函中英对照函件样例",
        summary: "中英逐段对照的商务函件，左中右不分栏而是段段对照，方便直接改写成任一语种发出，适合外贸与跨境沟通。",
        tags: ["中英对照", "外贸函件", "双语"],
        previewUrl: "tpl-material/bizdev-exhibition-invite-4",
        artifactId: "1a591897-eff4-4734-87ca-0555c3bd91de",
        artifactType: "document",
      },
  ],
  "product-intro-letter": [
      {
        id: "bizdev-product-intro-letter-1",
        title: "产品推介信成品样例",
        summary: "一封面向采购决策人的产品推介：以对方的成本与风险开头、用三段说清差异、附规格摘要与试单方案，不堆砌参数。",
        tags: ["产品推介", "差异化", "试单"],
        previewUrl: "tpl-material/bizdev-product-intro-letter-1",
        artifactId: "7020a8e5-da7d-4e4f-9357-6897e6503737",
        artifactType: "document",
      },
      {
        id: "bizdev-product-intro-letter-2",
        title: "产品推介信简短快回成品样例",
        summary: "六行以内的快速回复：先给确定的答复、再给一个明确的下一步，适合移动端即时回复，避免客户久等。",
        tags: ["快速回复", "简短", "移动端"],
        previewUrl: "tpl-material/bizdev-product-intro-letter-2",
        artifactId: "c39bb6d7-0f5e-4916-ad20-b7ad207a427a",
        artifactType: "document",
      },
      {
        id: "bizdev-product-intro-letter-3",
        title: "产品推介信正式方案书成品样例",
        summary: "带报价结构的正式方案：需求复述、方案说明、三档报价与前提、交付节奏与付款方式，可直接作为附件发给客户。",
        tags: ["正式方案", "三档报价", "可附件"],
        previewUrl: "tpl-material/bizdev-product-intro-letter-3",
        artifactId: "38d8259c-0330-40d4-9c16-508d2c855ebe",
        artifactType: "document",
      },
      {
        id: "bizdev-product-intro-letter-4",
        title: "产品推介信中英对照函件样例",
        summary: "中英逐段对照的商务函件，左中右不分栏而是段段对照，方便直接改写成任一语种发出，适合外贸与跨境沟通。",
        tags: ["中英对照", "外贸函件", "双语"],
        previewUrl: "tpl-material/bizdev-product-intro-letter-4",
        artifactId: "aa50c3c8-d08d-49dd-afb6-e2908088cfaf",
        artifactType: "document",
      },
  ],
  "company-research": [
      {
        id: "bizdev-company-research-1",
        title: "客户公司调研报告成品样例",
        summary: "一份进销售会前必读的客户背景调研：主营与规模、采购组织与决策链、近期动向、切入点与风险，全部标注信息来源等级。",
        tags: ["客户调研", "决策链", "切入点"],
        previewUrl: "tpl-material/bizdev-company-research-1",
        artifactId: "8521cf5f-eaff-43c7-a676-5df0adb990a5",
        artifactType: "document",
      },
      {
        id: "bizdev-company-research-2",
        title: "客户公司调研简短快回成品样例",
        summary: "六行以内的快速回复：先给确定的答复、再给一个明确的下一步，适合移动端即时回复，避免客户久等。",
        tags: ["快速回复", "简短", "移动端"],
        previewUrl: "tpl-material/bizdev-company-research-2",
        artifactId: "3d51a46e-e66a-4a40-a8a7-45415f270d5f",
        artifactType: "document",
      },
      {
        id: "bizdev-company-research-3",
        title: "客户公司调研正式方案书成品样",
        summary: "带报价结构的正式方案：需求复述、方案说明、三档报价与前提、交付节奏与付款方式，可直接作为附件发给客户。",
        tags: ["正式方案", "三档报价", "可附件"],
        previewUrl: "tpl-material/bizdev-company-research-3",
        artifactId: "b86a9b6d-c3c0-4b65-a4c8-a5899ab5033d",
        artifactType: "document",
      },
      {
        id: "bizdev-company-research-4",
        title: "客户公司调研中英对照函件样例",
        summary: "中英逐段对照的商务函件，左中右不分栏而是段段对照，方便直接改写成任一语种发出，适合外贸与跨境沟通。",
        tags: ["中英对照", "外贸函件", "双语"],
        previewUrl: "tpl-material/bizdev-company-research-4",
        artifactId: "24ac2b15-9016-4c98-9536-fbd4b8903f32",
        artifactType: "document",
      },
  ],
  "market-entry": [
      {
        id: "bizdev-market-entry-1",
        title: "目标市场进入分析成品样例",
        summary: "一份支持去留决策的市场进入分析：需求判断、准入门槛、渠道结构、竞争格局、定价空间与分阶段进入建议。",
        tags: ["市场进入", "准入", "渠道"],
        previewUrl: "tpl-material/bizdev-market-entry-1",
        artifactId: "eff19fde-4545-4d82-93d8-5bc492d73543",
        artifactType: "document",
      },
      {
        id: "bizdev-market-entry-2",
        title: "目标市场分析简短快回成品样例",
        summary: "六行以内的快速回复：先给确定的答复、再给一个明确的下一步，适合移动端即时回复，避免客户久等。",
        tags: ["快速回复", "简短", "移动端"],
        previewUrl: "tpl-material/bizdev-market-entry-2",
        artifactId: "baaad53e-3bab-446e-b988-f7b7b9cc31f5",
        artifactType: "document",
      },
      {
        id: "bizdev-market-entry-3",
        title: "目标市场分析正式方案书成品样",
        summary: "带报价结构的正式方案：需求复述、方案说明、三档报价与前提、交付节奏与付款方式，可直接作为附件发给客户。",
        tags: ["正式方案", "三档报价", "可附件"],
        previewUrl: "tpl-material/bizdev-market-entry-3",
        artifactId: "480465f0-85a7-4848-926c-25a5f224f7ba",
        artifactType: "document",
      },
      {
        id: "bizdev-market-entry-4",
        title: "目标市场分析中英对照函件样例",
        summary: "中英逐段对照的商务函件，左中右不分栏而是段段对照，方便直接改写成任一语种发出，适合外贸与跨境沟通。",
        tags: ["中英对照", "外贸函件", "双语"],
        previewUrl: "tpl-material/bizdev-market-entry-4",
        artifactId: "c78d9af7-e8cb-4dfb-8a3f-0fe2d6e08bff",
        artifactType: "document",
      },
  ],
  "customer-profile": [
      {
        id: "bizdev-customer-profile-1",
        title: "客户画像与跟进策略成品样例",
        summary: "一份把线索变成打法的客户画像：企业属性、采购动机、决策角色、异议预判与分阶段跟进动作，附资格判定门槛。",
        tags: ["客户画像", "决策角色", "跟进策略"],
        previewUrl: "tpl-material/bizdev-customer-profile-1",
        artifactId: "b104d146-1a36-41f6-b242-8fb410d13d02",
        artifactType: "document",
      },
      {
        id: "bizdev-customer-profile-2",
        title: "客户画像分析简短快回成品样例",
        summary: "六行以内的快速回复：先给确定的答复、再给一个明确的下一步，适合移动端即时回复，避免客户久等。",
        tags: ["快速回复", "简短", "移动端"],
        previewUrl: "tpl-material/bizdev-customer-profile-2",
        artifactId: "c7180f45-8fd5-4db8-bdf7-fd143f392759",
        artifactType: "document",
      },
      {
        id: "bizdev-customer-profile-3",
        title: "客户画像分析正式方案书成品样",
        summary: "带报价结构的正式方案：需求复述、方案说明、三档报价与前提、交付节奏与付款方式，可直接作为附件发给客户。",
        tags: ["正式方案", "三档报价", "可附件"],
        previewUrl: "tpl-material/bizdev-customer-profile-3",
        artifactId: "424dccc2-8642-4adf-9394-c54dae5fe6cf",
        artifactType: "document",
      },
      {
        id: "bizdev-customer-profile-4",
        title: "客户画像分析中英对照函件样例",
        summary: "中英逐段对照的商务函件，左中右不分栏而是段段对照，方便直接改写成任一语种发出，适合外贸与跨境沟通。",
        tags: ["中英对照", "外贸函件", "双语"],
        previewUrl: "tpl-material/bizdev-customer-profile-4",
        artifactId: "298e32e1-0647-471a-87d0-2abf1bd63d44",
        artifactType: "document",
      },
  ],
  "competitor-report": [
      {
        id: "bizdev-competitor-report-1",
        title: "竞品对比报告成品样例",
        summary: "一份能直接用于销售的竞品对比：先定对比维度与权重、再逐项事实对比、最后给差异化话术与不可比项说明。",
        tags: ["竞品对比", "维度权重", "话术"],
        previewUrl: "tpl-material/bizdev-competitor-report-1",
        artifactId: "3defcd21-270d-4457-9b32-2e5c27360028",
        artifactType: "document",
      },
      {
        id: "bizdev-competitor-report-2",
        title: "竞品对比报告简短快回成品样例",
        summary: "六行以内的快速回复：先给确定的答复、再给一个明确的下一步，适合移动端即时回复，避免客户久等。",
        tags: ["快速回复", "简短", "移动端"],
        previewUrl: "tpl-material/bizdev-competitor-report-2",
        artifactId: "1be61d62-b086-4fb8-8584-3a23f47e0e8e",
        artifactType: "document",
      },
      {
        id: "bizdev-competitor-report-3",
        title: "竞品对比报告正式方案书成品样",
        summary: "带报价结构的正式方案：需求复述、方案说明、三档报价与前提、交付节奏与付款方式，可直接作为附件发给客户。",
        tags: ["正式方案", "三档报价", "可附件"],
        previewUrl: "tpl-material/bizdev-competitor-report-3",
        artifactId: "96b74baf-baa2-45b1-a1c0-7f26e656d1f0",
        artifactType: "document",
      },
      {
        id: "bizdev-competitor-report-4",
        title: "竞品对比报告中英对照函件样例",
        summary: "中英逐段对照的商务函件，左中右不分栏而是段段对照，方便直接改写成任一语种发出，适合外贸与跨境沟通。",
        tags: ["中英对照", "外贸函件", "双语"],
        previewUrl: "tpl-material/bizdev-competitor-report-4",
        artifactId: "0ef54ea4-5c22-4ebf-bf0f-21d369575b83",
        artifactType: "document",
      },
  ],
  "selling-points": [
      {
        id: "bizdev-selling-points-1",
        title: "差异化卖点提炼成品样例",
        summary: "一份把产品事实翻译成客户语言的卖点稿：三个核心卖点各配事实、证据与一句话说法，附不能说的表述清单。",
        tags: ["卖点提炼", "证据", "话术"],
        previewUrl: "tpl-material/bizdev-selling-points-1",
        artifactId: "07177956-6bf9-4282-81c2-464bcf573ba3",
        artifactType: "document",
      },
      {
        id: "bizdev-selling-points-2",
        title: "差异化卖点提炼简短快回成品样",
        summary: "六行以内的快速回复：先给确定的答复、再给一个明确的下一步，适合移动端即时回复，避免客户久等。",
        tags: ["快速回复", "简短", "移动端"],
        previewUrl: "tpl-material/bizdev-selling-points-2",
        artifactId: "8d7a911b-dbac-4942-a9b1-cd968c1cb6af",
        artifactType: "document",
      },
      {
        id: "bizdev-selling-points-3",
        title: "差异化卖点提炼正式方案书成品",
        summary: "带报价结构的正式方案：需求复述、方案说明、三档报价与前提、交付节奏与付款方式，可直接作为附件发给客户。",
        tags: ["正式方案", "三档报价", "可附件"],
        previewUrl: "tpl-material/bizdev-selling-points-3",
        artifactId: "0c464f84-9979-4783-ae21-4d3158d62f72",
        artifactType: "document",
      },
      {
        id: "bizdev-selling-points-4",
        title: "差异化卖点提炼中英对照函件样",
        summary: "中英逐段对照的商务函件，左中右不分栏而是段段对照，方便直接改写成任一语种发出，适合外贸与跨境沟通。",
        tags: ["中英对照", "外贸函件", "双语"],
        previewUrl: "tpl-material/bizdev-selling-points-4",
        artifactId: "8cbb38b3-3af2-4728-8fd3-9ed6b4443a0c",
        artifactType: "document",
      },
  ],
  "pricing-strategy": [
      {
        id: "bizdev-pricing-strategy-1",
        title: "报价策略建议成品样例",
        summary: "一份指导实际报价的策略稿：成本结构、三档价格设计、让步顺序与底线、有效期与调价触发条件。",
        tags: ["报价策略", "分档", "让步顺序"],
        previewUrl: "tpl-material/bizdev-pricing-strategy-1",
        artifactId: "d8854990-3162-4da2-977c-1bb5a57945a3",
        artifactType: "document",
      },
      {
        id: "bizdev-pricing-strategy-2",
        title: "报价策略建议简短快回成品样例",
        summary: "六行以内的快速回复：先给确定的答复、再给一个明确的下一步，适合移动端即时回复，避免客户久等。",
        tags: ["快速回复", "简短", "移动端"],
        previewUrl: "tpl-material/bizdev-pricing-strategy-2",
        artifactId: "50a4ea91-4a87-4830-8a65-8fa8dbec5aff",
        artifactType: "document",
      },
      {
        id: "bizdev-pricing-strategy-3",
        title: "报价策略建议正式方案书成品样",
        summary: "带报价结构的正式方案：需求复述、方案说明、三档报价与前提、交付节奏与付款方式，可直接作为附件发给客户。",
        tags: ["正式方案", "三档报价", "可附件"],
        previewUrl: "tpl-material/bizdev-pricing-strategy-3",
        artifactId: "6431607b-c200-4999-93f4-64862ddc00c9",
        artifactType: "document",
      },
      {
        id: "bizdev-pricing-strategy-4",
        title: "报价策略建议中英对照函件样例",
        summary: "中英逐段对照的商务函件，左中右不分栏而是段段对照，方便直接改写成任一语种发出，适合外贸与跨境沟通。",
        tags: ["中英对照", "外贸函件", "双语"],
        previewUrl: "tpl-material/bizdev-pricing-strategy-4",
        artifactId: "e31724a0-b74f-4007-bae9-2bf66930b079",
        artifactType: "document",
      },
  ],
  "trade-translate": [
      {
        id: "bizdev-trade-translate-1",
        title: "外贸函电双语对照成品样例",
        summary: "一份可直接套用的中英对照函电集：确认订单、通知延期、催款、索赔四类，附术语统一表与常见误译提示。",
        tags: ["外贸函电", "双语", "术语"],
        previewUrl: "tpl-material/bizdev-trade-translate-1",
        artifactId: "8e86414d-f46f-4892-8846-87d223d00836",
        artifactType: "document",
      },
      {
        id: "bizdev-trade-translate-2",
        title: "外贸翻译简短快回成品样例",
        summary: "六行以内的快速回复：先给确定的答复、再给一个明确的下一步，适合移动端即时回复，避免客户久等。",
        tags: ["快速回复", "简短", "移动端"],
        previewUrl: "tpl-material/bizdev-trade-translate-2",
        artifactId: "6f1a74ae-6670-4d78-b495-ab0f602dfeca",
        artifactType: "document",
      },
      {
        id: "bizdev-trade-translate-3",
        title: "外贸翻译正式方案书成品样例",
        summary: "带报价结构的正式方案：需求复述、方案说明、三档报价与前提、交付节奏与付款方式，可直接作为附件发给客户。",
        tags: ["正式方案", "三档报价", "可附件"],
        previewUrl: "tpl-material/bizdev-trade-translate-3",
        artifactId: "99c038f1-8330-4eeb-95d4-49df50624ff0",
        artifactType: "document",
      },
      {
        id: "bizdev-trade-translate-4",
        title: "外贸翻译中英对照函件样例",
        summary: "中英逐段对照的商务函件，左中右不分栏而是段段对照，方便直接改写成任一语种发出，适合外贸与跨境沟通。",
        tags: ["中英对照", "外贸函件", "双语"],
        previewUrl: "tpl-material/bizdev-trade-translate-4",
        artifactId: "92401fb1-12eb-4f88-bc7c-484c21c220d6",
        artifactType: "document",
      },
  ],
  "term-localize": [
      {
        id: "bizdev-term-localize-1",
        title: "行业术语本地化对照表成品样例",
        summary: "一份可交给译者与客服共用的术语表：中文、英文、目标市场惯用说法、使用场景与禁用译法，附维护规则。",
        tags: ["术语表", "本地化", "禁用译法"],
        previewUrl: "tpl-material/bizdev-term-localize-1",
        artifactId: "ce0bb532-8434-449b-85de-f9b36d8422b6",
        artifactType: "document",
      },
      {
        id: "bizdev-term-localize-2",
        title: "术语本地化简短快回成品样例",
        summary: "六行以内的快速回复：先给确定的答复、再给一个明确的下一步，适合移动端即时回复，避免客户久等。",
        tags: ["快速回复", "简短", "移动端"],
        previewUrl: "tpl-material/bizdev-term-localize-2",
        artifactId: "894908f7-5524-4448-8882-cc346956900b",
        artifactType: "document",
      },
      {
        id: "bizdev-term-localize-3",
        title: "术语本地化正式方案书成品样例",
        summary: "带报价结构的正式方案：需求复述、方案说明、三档报价与前提、交付节奏与付款方式，可直接作为附件发给客户。",
        tags: ["正式方案", "三档报价", "可附件"],
        previewUrl: "tpl-material/bizdev-term-localize-3",
        artifactId: "e304043b-c172-4f3d-be7c-60eca8271641",
        artifactType: "document",
      },
      {
        id: "bizdev-term-localize-4",
        title: "术语本地化中英对照函件样例",
        summary: "中英逐段对照的商务函件，左中右不分栏而是段段对照，方便直接改写成任一语种发出，适合外贸与跨境沟通。",
        tags: ["中英对照", "外贸函件", "双语"],
        previewUrl: "tpl-material/bizdev-term-localize-4",
        artifactId: "f3eaec7f-1cf3-499f-9510-7b398afc7c70",
        artifactType: "document",
      },
  ],
  "multilang-notice": [
      {
        id: "bizdev-multilang-notice-1",
        title: "多语通知函成品样例（价格调整）",
        summary: "一份三语并列的正式通告：中英双语正文加要点摘要，说明原因、生效日、过渡安排与联系人，语气克制不道歉过度。",
        tags: ["通知函", "多语", "价格调整"],
        previewUrl: "tpl-material/bizdev-multilang-notice-1",
        artifactId: "255225b6-ab14-43a9-83db-8ef05d6a73b4",
        artifactType: "document",
      },
      {
        id: "bizdev-multilang-notice-2",
        title: "多语通知函简短快回成品样例",
        summary: "六行以内的快速回复：先给确定的答复、再给一个明确的下一步，适合移动端即时回复，避免客户久等。",
        tags: ["快速回复", "简短", "移动端"],
        previewUrl: "tpl-material/bizdev-multilang-notice-2",
        artifactId: "f93d2c1b-1310-4d80-9cf3-7e3e01e49609",
        artifactType: "document",
      },
      {
        id: "bizdev-multilang-notice-3",
        title: "多语通知函正式方案书成品样例",
        summary: "带报价结构的正式方案：需求复述、方案说明、三档报价与前提、交付节奏与付款方式，可直接作为附件发给客户。",
        tags: ["正式方案", "三档报价", "可附件"],
        previewUrl: "tpl-material/bizdev-multilang-notice-3",
        artifactId: "d313e439-2107-4274-8d6f-8e17dfb86e98",
        artifactType: "document",
      },
      {
        id: "bizdev-multilang-notice-4",
        title: "多语通知函中英对照函件样例",
        summary: "中英逐段对照的商务函件，左中右不分栏而是段段对照，方便直接改写成任一语种发出，适合外贸与跨境沟通。",
        tags: ["中英对照", "外贸函件", "双语"],
        previewUrl: "tpl-material/bizdev-multilang-notice-4",
        artifactId: "a373154c-15f0-4358-852b-fcd515f2fac2",
        artifactType: "document",
      },
  ],
  "follow-up": [
      {
        id: "bizdev-follow-up-1",
        title: "报价跟进信成品样例（四封节奏）",
        summary: "报价后无回音的完整跟进序列：四封信各换一个角度、逐步降低门槛、最后一封明确收尾，附发送节奏与停止规则。",
        tags: ["报价跟进", "序列", "收尾"],
        previewUrl: "tpl-material/bizdev-follow-up-1",
        artifactId: "c8d7844c-1265-4477-82cb-e8ce99aae548",
        artifactType: "document",
      },
      {
        id: "bizdev-follow-up-2",
        title: "报价跟进信简短快回成品样例",
        summary: "六行以内的快速回复：先给确定的答复、再给一个明确的下一步，适合移动端即时回复，避免客户久等。",
        tags: ["快速回复", "简短", "移动端"],
        previewUrl: "tpl-material/bizdev-follow-up-2",
        artifactId: "664061fd-3986-4f5c-9de5-e9904817a503",
        artifactType: "document",
      },
      {
        id: "bizdev-follow-up-3",
        title: "报价跟进信正式方案书成品样例",
        summary: "带报价结构的正式方案：需求复述、方案说明、三档报价与前提、交付节奏与付款方式，可直接作为附件发给客户。",
        tags: ["正式方案", "三档报价", "可附件"],
        previewUrl: "tpl-material/bizdev-follow-up-3",
        artifactId: "5ebc86fa-9e1b-40e6-8ec0-7bba08c7b5b4",
        artifactType: "document",
      },
      {
        id: "bizdev-follow-up-4",
        title: "报价跟进信中英对照函件样例",
        summary: "中英逐段对照的商务函件，左中右不分栏而是段段对照，方便直接改写成任一语种发出，适合外贸与跨境沟通。",
        tags: ["中英对照", "外贸函件", "双语"],
        previewUrl: "tpl-material/bizdev-follow-up-4",
        artifactId: "aa2ddbdf-915e-486a-961e-8f2a4165b952",
        artifactType: "document",
      },
  ],
  "order-confirm-reply": [
      {
        id: "bizdev-order-confirm-reply-1",
        title: "订单确认回复成品样例",
        summary: "一封让客户放心的订单确认：逐项复述关键条款、给出时间表与责任人、列出需客户确认的事项与风险提示。",
        tags: ["订单确认", "条款复述", "时间表"],
        previewUrl: "tpl-material/bizdev-order-confirm-reply-1",
        artifactId: "c728c131-8de2-4a28-a922-6ff5469de3bd",
        artifactType: "document",
      },
      {
        id: "bizdev-order-confirm-reply-2",
        title: "订单确认回复简短快回成品样例",
        summary: "六行以内的快速回复：先给确定的答复、再给一个明确的下一步，适合移动端即时回复，避免客户久等。",
        tags: ["快速回复", "简短", "移动端"],
        previewUrl: "tpl-material/bizdev-order-confirm-reply-2",
        artifactId: "b265a171-2b1b-4570-9b8d-016d3af3230f",
        artifactType: "document",
      },
      {
        id: "bizdev-order-confirm-reply-3",
        title: "订单确认回复正式方案书成品样",
        summary: "带报价结构的正式方案：需求复述、方案说明、三档报价与前提、交付节奏与付款方式，可直接作为附件发给客户。",
        tags: ["正式方案", "三档报价", "可附件"],
        previewUrl: "tpl-material/bizdev-order-confirm-reply-3",
        artifactId: "2e9a9ab7-370a-47da-9840-ad84007b6b2f",
        artifactType: "document",
      },
      {
        id: "bizdev-order-confirm-reply-4",
        title: "订单确认回复中英对照函件样例",
        summary: "中英逐段对照的商务函件，左中右不分栏而是段段对照，方便直接改写成任一语种发出，适合外贸与跨境沟通。",
        tags: ["中英对照", "外贸函件", "双语"],
        previewUrl: "tpl-material/bizdev-order-confirm-reply-4",
        artifactId: "8ceaa45a-57be-4b94-bc5d-d5adf47c9773",
        artifactType: "document",
      },
  ],
};

// 五大引擎与各自的操作台「主自由文本字段」（灌预置 / 填模板用）。
export type BizdevEngine = "reply" | "research" | "competition" | "dev-letter" | "trade-talk";

export interface BizdevApp extends GoalApp {
  engine: BizdevEngine;
}

const tpl = (label: string, hint: string, prompt: string, icon?: string): GuideSection["examples"][number] => ({
  label,
  hint,
  prompt,
  icon,
});

function sections(
  a: GuideSection["examples"],
  b: GuideSection["examples"],
  c: GuideSection["examples"],
  titles: [string, string, string] = ["常见情形", "不同风格", "快速起手"],
): GuideSection[] {
  return [
    { title: titles[0], examples: a },
    { title: titles[1], examples: b },
    { title: titles[2], examples: c },
  ];
}

// ── 场景词（本站自定义，横排分类器顺序即此顺序）─────────────────────────────
export const BIZDEV_SCENES = {
  inquiry: "询盘回复",
  develop: "客户开发",
  research: "市场调研",
  compete: "竞品对标",
  multilang: "多语沟通",
  follow: "成交跟进",
} as const;

function app(
  id: string,
  name: string,
  icon: string,
  logoColor: string,
  tagline: string,
  engine: BizdevEngine,
  scenes: string[],
  promptTemplate: string,
  guideSections: GuideSection[],
): BizdevApp {
  return {
    id,
    name,
    icon,
    logoColor,
    tagline,
    capabilities: tagline,
    engine,
    scenes,
    capabilityImage: capImage(id),
    ...(TEMPLATES[id] ? { templates: TEMPLATES[id] } : {}),
    // 宗旨 v19（操作员 2026-07-08）：点导航卡片 = 操作台【完整】回填，含选择框（OptionRow）。
    // 三个引擎的操作台各有 OptionRow，且其 applyPatch 已支持对应 set.<field>；这里按引擎补默认档，
    // withGuideDefaults 会并进每张导航卡 → 点任意卡片这些 OptionRow 都被选中（而非只填正文）。
    preset: { prompt: promptTemplate, ...engineDefaultSet(engine) },
    guideSections,
  };
}

// 各引擎操作台 OptionRow 的默认档（值取自各 useXxxFn 的 DEFAULT_*）：
//   reply      → role（角色人设，默认首档）、replyType（email/whatsapp，默认 email）
//   dev-letter → scene（开发信情形，默认 cold）、lang（语言，默认英语）
//   trade-talk → target（目标语言，默认英语）、tone（语气，默认商务正式）
// 其它引擎（research/competition）操作台无 OptionRow，返回空。
function engineDefaultSet(engine: BizdevEngine): { set?: Record<string, unknown> } {
  switch (engine) {
    case "reply":
      return { set: { role: "高级销售经理：专业、自信、导向成交", replyType: "email" } };
    case "dev-letter":
      return { set: { scene: "cold", lang: "英语" } };
    case "trade-talk":
      return { set: { target: "英语", tone: "商务正式" } };
    default:
      return {};
  }
}

// ============================================================================
// 成品 app 清单（≥20）。每个成品声明 engine，预置灌进该引擎的主自由文本字段。
// ============================================================================
export const BIZDEV_APPS: BizdevApp[] = [
  // ───────────────── 询盘回复（engine: reply，主字段 customerMsg）─────────────────
  app(
    "inquiry-reply", "询盘回复", "📨", "#0e7490",
    "客户询盘 → 专业回复草稿",
    "reply", [BIZDEV_SCENES.inquiry],
    "【客户询盘原文，粘贴到此】\n\n（AI 将读懂客户意图并生成一封专业、推进成交的回复草稿。）",
    sections(
      [
        tpl("首次询盘", "第一封", "客户第一次来询盘，帮我写一封专业热情、能建立信任并推进下一步的回复，读懂意图、突出优势，客户消息：[粘贴]", "🌟"),
        tpl("砍价询盘", "谈价格", "客户嫌价格高想砍价，帮我得体回复、用价值与条件守住利润、不轻易降价又不失客户，客户消息：[粘贴]", "💰"),
        tpl("技术咨询", "问参数", "客户询问产品技术参数或认证，帮我专业准确地作答、体现实力与可信度、顺势推进合作，客户消息：[粘贴]", "🔧"),
      ],
      [
        tpl("热情推进", "促成交", "用热情、主动推进成交的语气回复这条询盘，读懂客户意图、突出优势并引导下一步，客户消息：[粘贴]", "🔥"),
        tpl("专业严谨", "显实力", "用专业严谨的语气回复这条技术询盘，准确解答参数与疑问、体现实力与可信度、稳步推进，客户消息：[粘贴]", "🎓"),
        tpl("简明扼要", "抓重点", "简明扼要地回复这条询盘，只讲客户最关心的核心信息、干净利落又不失专业、引导下一步，客户消息：[粘贴]", "✂️"),
      ],
      [tpl("一句话回复", "最快起手", "帮我写一封专业、推进成交的询盘回复草稿，读懂客户意图、突出优势并引导下一步动作，客户消息：[粘贴]", "⚡")],
    ),
  ),
  app(
    "complaint-reply", "投诉处理回复", "🛎️", "#0891b2",
    "客诉 → 稳住客户的回复",
    "reply", [BIZDEV_SCENES.inquiry, BIZDEV_SCENES.follow],
    "【客户投诉/抱怨原文，粘贴到此】\n\n（AI 将帮你写一封既承担责任、又稳住客户、给出解决方案的回复。）",
    sections(
      [
        tpl("质量投诉", "先安抚", "客户投诉产品质量问题，帮我写一封先安抚、诚恳担当、再给出具体解决方案的回复、稳住客户，客户消息：[粘贴]", "📦"),
        tpl("延误投诉", "货期延迟", "客户抱怨交期延误，帮我诚恳解释原因、安抚情绪、给出补救与新时间点、保住信任，客户消息：[粘贴]", "⏰"),
        tpl("差异投诉", "货不对板", "客户说货与描述不符，帮我妥善回复、先了解核实再给出负责任的处理方案、稳住客户关系，客户消息：[粘贴]", "⚖️"),
      ],
      [
        tpl("诚恳担当", "先道歉", "用诚恳担当的语气处理这条客诉，先道歉安抚、承担责任、再给出解决方案、稳住客户不丢单，客户消息：[粘贴]", "🙏"),
        tpl("有理有据", "澄清误会", "用有理有据的方式回应这条投诉，摆事实讲清楚、澄清误会又不失礼貌、化解矛盾稳住客户，客户消息：[粘贴]", "📋"),
        tpl("保客户", "别丢单", "以保住客户为首要目标回复这条投诉，先共情安抚、给出诚意方案与补偿、修复信任别丢单，客户消息：[粘贴]", "🤝"),
      ],
      [tpl("一句话客诉", "最快起手", "帮我写一封既承担责任、又稳住客户、并给出解决方案的投诉处理回复、修复信任，客户投诉消息：[粘贴]", "⚡")],
    ),
  ),
  app(
    "whatsapp-reply", "WhatsApp 快回", "💬", "#0e7490",
    "即时消息 → 简洁口语回复",
    "reply", [BIZDEV_SCENES.inquiry, BIZDEV_SCENES.multilang],
    "【客户 WhatsApp 消息，粘贴到此】\n\n（AI 将生成简洁、口语、适合即时聊天的短回复，可带少量 emoji。切换渠道为 WhatsApp。）",
    sections(
      [
        tpl("寒暄破冰", "拉近", "客户发来寒暄消息，帮我用轻松口语、适合即时聊天的短回复拉近关系、自然带出下一步，客户消息：[粘贴]", "👋"),
        tpl("快速报价", "即时", "客户在 WhatsApp 上问价，帮我用简短专业、适合即时聊天的短回复报价并引导推进，客户消息：[粘贴]", "💵"),
        tpl("催下单", "推一把", "帮我在 WhatsApp 上用简短口语、得体不催命的短消息推动客户尽快下单、给个理由，背景：[背景]", "⏭️"),
      ],
      [
        tpl("热情口语", "亲切", "用热情口语的 WhatsApp 风格写一条简洁、适合即时聊天、可带少量 emoji 的短回复，客户消息：[粘贴]", "😊"),
        tpl("简短直接", "省时间", "用简短直接的方式回这条即时消息，一两句说清重点、口语自然适合即时聊天、不啰嗦，客户消息：[粘贴]", "⚡"),
        tpl("带表情", "有温度", "用带少量 emoji 的友好口语方式写一条适合即时聊天的短回复、拉近距离又不失专业，客户消息：[粘贴]", "🎈"),
      ],
      [tpl("一句话快回", "最快起手", "帮我写一条简洁、口语、适合即时聊天、可带少量 emoji 的 WhatsApp 短回复、自然推进，客户消息：[粘贴]", "⚡")],
    ),
  ),
  app(
    "negotiation-reply", "谈判议价回复", "🤝", "#0891b2",
    "价格拉锯 → 守利润的话术",
    "reply", [BIZDEV_SCENES.inquiry, BIZDEV_SCENES.follow],
    "【客户议价/谈条件的消息，粘贴到此】\n\n（AI 将帮你写一封既让客户有获得感、又守住底线的谈判回复。）",
    sections(
      [
        tpl("守价格", "不轻易降", "客户压价，帮我用价值与理由守住价格、既让客户有获得感又不失底线、稳步推进成交，客户消息：[粘贴]", "🛡️"),
        tpl("换条件", "以退为进", "帮我用换条件（数量/交期/付款方式）以退为进的方式回应压价、守住利润又让客户满意，客户消息：[粘贴]", "🔄"),
        tpl("给台阶", "促成交", "帮我给客户一个体面的台阶、在守住底线的前提下促成最终成交、让双方都满意，客户议价消息：[粘贴]", "🪜"),
      ],
      [
        tpl("强硬有度", "有底线", "用强硬有度、有底线的语气回应这轮议价、守住价格与利润又不激化、稳住关系，客户议价消息：[粘贴]", "💪"),
        tpl("柔中带刚", "留余地", "用柔中带刚、留有余地的方式回应议价、既照顾客户感受又守住底线、推动成交，客户议价消息：[粘贴]", "🎋"),
        tpl("双赢导向", "共赢", "用双赢导向的话术回应议价、让客户有获得感又守住我方利润、共赢促成合作，客户议价消息：[粘贴]", "🤝"),
      ],
      [tpl("一句话议价", "最快起手", "帮我写一封既让客户有获得感、又守住底线与利润的谈判议价回复、推动成交，客户议价消息：[粘贴]", "⚡")],
    ),
  ),

  // ───────────────── 客户开发（engine: dev-letter，主字段 selling）─────────────────
  app(
    "cold-email", "开发信", "✉️", "#0e7490",
    "目标客户 → 高回复率开发信",
    "dev-letter", [BIZDEV_SCENES.develop],
    "核心卖点/亮点（每行一条）：质量与价格/认证 [ ]、交期与 MOQ [ ]、工厂实力/成功案例 [ ]\n（在上方顶部字段填目标客户与推广产品，AI 将写 2 个不同切入角度的开发信版本。）",
    sections(
      [
        tpl("冷启动", "首次触达", "写一封冷启动开发信，产品 [产品]，卖点 [卖点]，个性化开头抓住注意力、简洁传达价值、结尾引导回复，提高回复率", "❄️"),
        tpl("展会后", "跟进名片", "写一封展会后开发信，跟进 [展会] 认识的客户，唤起现场印象、重申价值与合作点、结尾引导下一步沟通，自然不生硬", "🎪"),
        tpl("换供应商", "撬客户", "写一封针对想换供应商客户的开发信：[产品]，戳中换供应商的痛点、突出我方差异化与可靠性、结尾引导询盘", "🔀"),
      ],
      [
        tpl("简洁个性化", "不群发感", "写一封简洁个性化、无群发感的开发信：[产品]，针对客户量身开头、精准传达价值、结尾引导回复，提高打开与回复率", "🎯"),
        tpl("卖点突出", "亮实力", "写一封卖点突出的开发信：[产品+卖点]，用最有说服力的亮点抓住客户、简洁传达价值、结尾引导询盘，提高回复率", "💪"),
        tpl("故事切入", "有记忆点", "写一封用故事或使用场景切入的开发信：[产品]，用有画面感的开头引起兴趣、自然带出价值、结尾引导回复，有记忆点", "📖"),
      ],
      [tpl("一句话开发信", "最快起手", "帮我写一封 [产品] 的高回复率开发信，个性化开头抓住注意力、简洁传达核心价值、结尾引导客户回复询盘", "⚡")],
    ),
  ),
  app(
    "reactivate-email", "唤醒沉睡客户", "🔔", "#0891b2",
    "老客户 → 重新激活的信",
    "dev-letter", [BIZDEV_SCENES.develop, BIZDEV_SCENES.follow],
    "沉睡客户背景（曾合作/报过价/许久未回）与这次的由头（新品/优惠/涨价前）：[填写]\n（AI 将写一封自然、有由头、不尴尬的唤醒信，先在顶部填客户与产品。）",
    sections(
      [
        tpl("新品由头", "带新东西", "写一封用新品做由头的唤醒信：[客户+新品]，自然重启对话、借新品提供新价值、不尴尬地拉回客户、结尾引导回复", "🆕"),
        tpl("优惠由头", "给甜头", "写一封用限时优惠唤醒老客户的信：[客户]，借优惠给个回来的理由、营造合理紧迫感、自然重启对话、引导下单", "🎁"),
        tpl("节日问候", "自然触达", "写一封借节日问候唤醒老客户的信：[客户]，以真诚问候自然切入、顺势重启对话、不尴尬不催命、引导回复联系", "🎄"),
      ],
      [
        tpl("真诚朴实", "不尴尬", "用真诚朴实、不尴尬的语气写一封唤醒沉睡客户的信：[客户]，找个自然由头重启对话、提供价值、引导回复联系", "💛"),
        tpl("制造紧迫", "促行动", "用制造合理紧迫感的方式写一封唤醒沉睡客户的信：[客户]，给个现在回来的理由、自然重启对话、引导尽快行动", "⏳"),
        tpl("叙旧切入", "拉近", "用叙旧的方式自然切入写一封唤醒沉睡客户的信：[客户]，唤起过往合作的好印象、重启对话、提供新价值引导回复", "🕰️"),
      ],
      [tpl("一句话唤醒", "最快起手", "帮我写一封自然、有由头、不尴尬的唤醒沉睡客户的信、重启对话并提供新价值、引导回复，客户背景：[客户背景]", "⚡")],
    ),
  ),
  app(
    "exhibition-invite", "展会邀请函", "🎪", "#0e7490",
    "客户 → 展位邀约信",
    "dev-letter", [BIZDEV_SCENES.develop],
    "展会信息（名称/时间/展位号）与想邀请的客户、想展示的产品：[填写]\n（AI 将写一封让客户愿意来展位的邀请信，先在顶部填客户与产品。）",
    sections(
      [
        tpl("国际展会", "海外买家", "写一封 [展会] 展位邀请函，邀请海外客户：[展位]，讲清到场亮点与价值、给出到访理由、正式得体，让客户愿意来展位", "🌍"),
        tpl("老客户邀约", "见个面", "写一封邀请老客户来 [展会] 展位面谈的信，重申合作情谊、点明面谈价值与亮点、热情有诚意，让客户愿意赴约", "🤝"),
        tpl("新品发布", "看新品", "写一封邀请客户来展位看新品的信：[展会+新品]，突出新品亮点与到场价值、给出理由、热情得体，让客户愿意来看", "🆕"),
      ],
      [
        tpl("正式得体", "商务", "写一封正式得体的 [展会] 展位邀请函，讲清展会与展位信息、到场亮点与价值、措辞商务规范，让客户愿意来展位", "🎩"),
        tpl("热情诚意", "有温度", "写一封热情有诚意的 [展会] 展位邀请函，表达期待与欢迎、点明到场亮点与价值、真挚得体，让客户愿意赴约到访", "💛"),
        tpl("突出亮点", "给理由", "写一封突出到场亮点的 [展会] 展位邀请函，用新品、洽谈机会或福利给客户到访的理由、有吸引力，让客户愿意来", "✨"),
      ],
      [tpl("一句话邀请", "最快起手", "帮我写一封 [展会] 展位邀请函，讲清展位信息与到场亮点、给出到访理由、正式得体又有诚意，让客户愿意来展位", "⚡")],
    ),
  ),
  app(
    "product-intro-letter", "产品推介信", "📦", "#0891b2",
    "产品 → 打动人的推介信",
    "dev-letter", [BIZDEV_SCENES.develop],
    "要推介的产品卖点、适用场景与目标客户类型：[填写]\n（AI 将写一封清晰传达价值、引导询盘的产品推介信，先在顶部填客户与产品。）",
    sections(
      [
        tpl("新品上市", "推新款", "写一封新品上市推介信：[产品卖点]，清晰传达新品价值与差异化、点明适用场景与好处、结尾引导询盘或试单", "🆕"),
        tpl("爆款主推", "拳头产品", "写一封主推爆款的产品推介信：[产品]，突出畅销亮点与市场反馈、传达价值与信任感、结尾引导客户询盘或下单", "🔥"),
        tpl("系列产品", "多款打包", "写一封系列产品打包推介信：[产品线]，清晰梳理系列构成与适用场景、传达组合价值与优势、结尾引导询盘合作", "📚"),
      ],
      [
        tpl("卖点清单", "一目了然", "写一封卖点清单式的产品推介信：[产品]，把核心卖点逐条列清、一目了然、传达价值、结尾引导客户询盘或试单", "📋"),
        tpl("场景化", "讲用途", "写一封场景化讲用途的产品推介信：[产品]，用真实使用场景讲清价值与好处、代入感强、结尾引导客户询盘合作", "🎬"),
        tpl("对比优势", "比同行", "写一封突出对比优势的产品推介信：[产品]，对比同行讲清我方差异化与优势、传达价值、结尾引导客户询盘选择", "⚖️"),
      ],
      [tpl("一句话推介", "最快起手", "帮我写一封 [产品] 产品推介信，清晰传达价值与适用场景、突出卖点与优势、结尾引导客户询盘或下单，打动人", "⚡")],
    ),
  ),

  // ───────────────── 市场调研（engine: research，主字段 material）─────────────────
  app(
    "company-research", "客户公司调研", "🔍", "#2563eb",
    "公司资料 → 背景调研报告",
    "research", [BIZDEV_SCENES.research],
    "【粘贴目标公司的官网文案 / 简介 / 领英信息 / 往来邮件等素材到此】\n（在顶部填公司名与官网，AI 将输出背景/规模/采购偏好/联系人切入建议。）",
    sections(
      [
        tpl("背景摸底", "先了解", "根据这些素材调研 [公司] 的背景、规模与业务、输出结构化的公司画像与合作切入建议，素材：[粘贴]", "🏢"),
        tpl("采购偏好", "投其所好", "根据素材分析 [公司] 的采购偏好、关注点与决策特征、给出投其所好的接触与谈判建议，素材：[粘贴]", "🎯"),
        tpl("决策人", "找对人", "帮我从素材里梳理 [公司] 的关键决策人线索与联系人角色、给出找对人的接触路径建议，素材：[粘贴]", "🧑‍💼"),
      ],
      [
        tpl("速览版", "抓要点", "给我 [公司] 的速览版背景调研，只留背景、规模、业务与切入点等关键信息、精炼实用，素材：[粘贴]", "⚡"),
        tpl("深度版", "全面", "给我 [公司] 的深度背景调研报告，涵盖背景、规模、业务、采购偏好、决策人与切入建议，素材：[粘贴]", "📑"),
        tpl("切入建议", "怎么谈", "根据调研给我接触 [公司] 的切入建议、包括切入角度、话术方向与联系人路径、可落地执行，素材：[粘贴]", "🗝️"),
      ],
      [tpl("一句话调研", "最快起手", "帮我调研这家客户公司，输出背景、规模、业务、采购偏好、决策人与合作切入建议的结构化报告，素材：[粘贴素材]", "⚡")],
    ),
  ),
  app(
    "market-entry", "目标市场分析", "🗺️", "#1d4ed8",
    "产品+市场 → 进入分析",
    "research", [BIZDEV_SCENES.research],
    "【粘贴你了解到的目标市场信息 / 产品资料到此】\n（在顶部填目标公司或市场、关注点，AI 将分析该市场的需求、竞争与进入建议。）",
    sections(
      [
        tpl("新市场", "该不该进", "综合分析 [产品] 进入 [市场] 的市场需求、竞争格局、机会点与主要风险、并给出进入建议，参考素材：[素材]", "🚪"),
        tpl("需求洞察", "看需不需要", "深入分析 [市场] 对 [产品] 的真实需求规模、痛点与购买偏好、判断值不值得进入并给建议，参考素材：[素材]", "🔎"),
        tpl("准入门槛", "认证/关税", "系统梳理 [产品] 进入 [市场] 所需的认证、标准与关税等准入门槛、以及合规成本与应对，参考素材：[素材]", "🚧"),
      ],
      [
        tpl("机会导向", "找空白", "深入分析 [市场] 的需求趋势、竞争格局、机会点与尚未被满足的市场空白、给出切入建议，参考素材：[素材]", "💡"),
        tpl("风险提示", "先避坑", "系统识别 [产品] 进入 [市场] 的政策、竞争、渠道与回款等主要风险、并给出规避与应对建议，参考素材：[素材]", "⚠️"),
        tpl("落地建议", "怎么做", "给我 [产品] 进入 [市场] 的可落地建议、涵盖定位、渠道、定价与推广节奏等执行路径，参考素材：[素材]", "✅"),
      ],
      [tpl("一句话市场", "最快起手", "帮我评估 [产品] 进入 [市场] 的可行性、综合需求、竞争、门槛与风险给出明确结论与建议，参考素材：[素材]", "⚡")],
    ),
  ),
  app(
    "customer-profile", "客户画像分析", "🧑‍💼", "#2563eb",
    "线索 → 客户画像与策略",
    "research", [BIZDEV_SCENES.research, BIZDEV_SCENES.develop],
    "【粘贴关于该客户的所有已知信息（询盘/背景/采购记录）到此】\n（在顶部填公司名与关注点，AI 将画出客户画像并给出对应的销售策略。）",
    sections(
      [
        tpl("采购商画像", "买家类型", "根据信息给 [客户] 画出采购商画像、涵盖需求、决策特征与合作偏好、并给出对应销售策略，素材：[素材]", "🛒"),
        tpl("分销商画像", "渠道商", "根据信息给 [客户] 画出分销商画像、涵盖渠道能力、关注点与合作诉求、并给出对应销售策略，素材：[素材]", "🏬"),
        tpl("大客户画像", "KA", "给这个大客户（KA）画出详细画像、梳理需求痛点与决策链、并定制拿下与维护的销售策略，素材：[素材]", "🐘"),
      ],
      [
        tpl("需求痛点", "抓关键", "从素材里精准提炼 [客户] 的核心需求与痛点、并据此给出打动客户的沟通与销售策略建议，素材：[素材]", "🎯"),
        tpl("成交策略", "怎么拿下", "根据客户画像给我拿下 [客户] 的销售策略、包括切入点、价值主张与推进节奏、可落地执行，素材：[素材]", "♟️"),
        tpl("风险评估", "靠不靠谱", "评估 [客户] 的靠谱程度与合作风险、从实力、诚信与回款等维度判断、并给出合作建议，素材：[素材]", "⚖️"),
      ],
      [tpl("一句话画像", "最快起手", "帮我给这个客户画出画像、梳理需求痛点与决策特征、并给出对应的销售策略建议、可落地，素材：[素材]", "⚡")],
    ),
  ),

  // ───────────────── 竞品对标（engine: competition，主字段 rivals）─────────────────
  app(
    "competitor-report", "竞品对比报告", "📊", "#7c3aed",
    "竞品资料 → 对比与差异化",
    "competition", [BIZDEV_SCENES.compete],
    "【粘贴竞品的 listing / 参数 / 报价 / 卖点到此】\n（在顶部填产品/品类、目标市场与自家产品信息，AI 将逐维度对比并给出差异化策略。）",
    sections(
      [
        tpl("参数对比", "比配置", "逐维度对比这些竞品与我方的参数配置、提炼我方差异化优势并给出话术建议，竞品素材：[竞品素材]", "🔧"),
        tpl("价格对比", "比价位", "对比竞品价格带与定位、结合我方情况给出合理定价区间与谈判话术建议、守住优势，竞品素材：[竞品素材]", "💰"),
        tpl("卖点对比", "比亮点", "对比竞品的核心卖点与定位、提炼我方最有说服力的差异化优势并给出话术、突出不同，竞品素材：[竞品素材]", "✨"),
      ],
      [
        tpl("表格化", "一目了然", "用清晰的对比表逐维度呈现竞品与我方的参数、价格与卖点分析、一目了然、并给差异化建议，竞品素材：[竞品素材]", "📋"),
        tpl("SWOT", "结构化", "用 SWOT 框架系统分析我方相对竞品的优势、劣势、机会与威胁、并给出差异化打法建议，竞品素材：[竞品素材]", "🎯"),
        tpl("打法建议", "怎么赢", "根据竞品分析给我可落地的差异化打法、包括定位、卖点主张与谈判策略、帮我在竞争中胜出，竞品素材：[竞品素材]", "♟️"),
      ],
      [tpl("一句话竞品", "最快起手", "帮我做一份竞品对比报告、逐维度对比参数、价格与卖点、提炼我方差异化并给出打法建议，竞品素材：[竞品素材]", "⚡")],
    ),
  ),
  app(
    "selling-points", "差异化卖点提炼", "💎", "#6d28d9",
    "竞品 → 我方独特卖点",
    "competition", [BIZDEV_SCENES.compete, BIZDEV_SCENES.develop],
    "【粘贴竞品信息 + 我方产品信息到此】\n（在顶部填产品/品类与市场，AI 将对比后提炼出我方最有说服力的差异化卖点与话术。）",
    sections(
      [
        tpl("提炼卖点", "找不同", "对比竞品与我方产品、提炼出 3-5 个最有说服力的差异化卖点、并配上对客户的话术，参考素材：[素材]", "💡"),
        tpl("卖点话术", "会讲", "把我方的核心卖点转化成打动客户的销售话术、针对客户关注点表达、有说服力便于直接用，参考素材：[素材]", "🗣️"),
        tpl("USP 定位", "一句话", "帮我从产品与竞品对比中提炼一句话独特卖点（USP）、精准有力、让客户一句话记住我方优势，参考素材：[素材]", "🎯"),
      ],
      [
        tpl("性价比向", "质价比", "从性价比（质价比）角度提炼我方相对竞品的差异化卖点、并配上有说服力的对客户话术，参考素材：[素材]", "⚖️"),
        tpl("品质向", "高端", "从品质与工艺角度提炼我方相对竞品的高端差异化卖点、并配上体现价值的对客户话术，参考素材：[素材]", "🏅"),
        tpl("服务向", "软实力", "从服务、交期与售后等软实力角度提炼我方差异化卖点、并配上打消客户顾虑的话术，参考素材：[素材]", "🤝"),
      ],
      [tpl("一句话卖点", "最快起手", "帮我对比后提炼我方最有说服力的差异化卖点、并配上对客户的话术、突出不同、便于直接用，素材：[竞品+我方素材]", "⚡")],
    ),
  ),
  app(
    "pricing-strategy", "报价策略建议", "🏷️", "#7c3aed",
    "竞品价 → 我方报价打法",
    "competition", [BIZDEV_SCENES.compete, BIZDEV_SCENES.follow],
    "【粘贴竞品报价 / 市场价信息 + 我方成本或价格信息到此】\n（在顶部填产品与市场，AI 将分析价格带并给出报价策略与谈判空间建议。）",
    sections(
      [
        tpl("定价区间", "报多少", "分析竞品价格带与市场行情、结合我方成本给出合理报价区间与理由、既有竞争力又保利润，参考素材：[素材]", "📈"),
        tpl("阶梯报价", "按量", "帮我设计按订单量分档的阶梯报价策略、平衡走量与利润、并给出对客户的说明话术，参考素材：[素材]", "🪜"),
        tpl("谈判空间", "留余地", "帮我规划报价的让步空间与谈判节奏、每一步怎么让、让多少、换什么条件、守住底线，参考素材：[素材]", "🎚️"),
      ],
      [
        tpl("抢单向", "价格竞争", "以抢单（价格竞争）为目标给出报价策略、在守住底线前提下最大化中标概率、并给话术，参考素材：[素材]", "⚔️"),
        tpl("保利润", "不打价格战", "以保利润（不打价格战）为目标给出报价策略、用价值支撑价格、避免陷入低价竞争，参考素材：[素材]", "🛡️"),
        tpl("价值报价", "卖价值", "用价值报价法制定报价策略、以客户获得的价值而非成本定价、并给出支撑价格的话术，参考素材：[素材]", "💎"),
      ],
      [tpl("一句话报价", "最快起手", "帮我分析价格带、制定兼顾竞争力与利润的报价策略、并给出让步空间与谈判建议，素材：[竞品价+我方素材]", "⚡")],
    ),
  ),

  // ───────────────── 多语沟通（engine: trade-talk，主字段 source）─────────────────
  app(
    "trade-translate", "外贸翻译", "🌐", "#0d9488",
    "原文 → 专业双向翻译",
    "trade-talk", [BIZDEV_SCENES.multilang],
    "【粘贴要翻译的外贸邮件 / 合同 / 术语 / 消息到此】\n（在顶部选目标语言与语气，AI 将做专业、地道、贴合外贸场景的翻译。）",
    sections(
      [
        tpl("邮件翻译", "商务", "把这封外贸邮件专业、地道地翻译好、贴合外贸商务场景与礼仪、准确传达原意与语气，原文：[原文]", "📧"),
        tpl("合同条款", "严谨", "把这段合同条款准确、严谨地翻译、保留法律含义与术语一致性、避免歧义与漏译，原文：[原文]", "📜"),
        tpl("产品描述", "地道", "把这段产品描述地道、专业地翻译、贴合海外买家表达习惯、准确传达卖点与规格，原文：[原文]", "📦"),
      ],
      [
        tpl("正式商务", "得体", "用正式商务语气把这段内容专业地道地翻译、贴合外贸场景与礼仪、准确传达原意与分寸，原文：[原文]", "🎩"),
        tpl("口语友好", "聊天", "用口语友好的语气把这条消息地道地翻译、适合即时沟通、自然亲切又不失专业、准确达意，原文：[原文]", "💬"),
        tpl("中译外", "反向", "把这段中文专业、地道地翻成 [目标语]、贴合外贸商务场景、准确传达原意与语气、避免生硬直译，原文：[原文]", "🔄"),
      ],
      [tpl("一句话翻译", "最快起手", "帮我把这段外贸内容专业、地道地翻译、贴合外贸商务场景与礼仪、准确传达原意与语气，原文：[原文]", "⚡")],
    ),
  ),
  app(
    "term-localize", "术语本地化", "🔤", "#0f766e",
    "行业术语 → 地道对应表达",
    "trade-talk", [BIZDEV_SCENES.multilang, BIZDEV_SCENES.research],
    "【粘贴需要本地化的行业术语 / 产品名 / 参数到此】\n（在顶部选目标语言，AI 将给出该行业地道的对应译法与术语对照，避免直译生硬。）",
    sections(
      [
        tpl("行业术语", "内行话", "把这些行业术语本地化成目标市场地道的对应表达、避免生硬直译、给出术语对照、贴合内行说法，术语：[术语]", "🏭"),
        tpl("产品命名", "海外叫法", "帮我把产品名本地化成 [市场] 当地地道的叫法、贴合当地表达习惯与认知、便于推广接受，名称：[名称]", "🏷️"),
        tpl("参数单位", "换算规范", "把这些参数与单位本地化并规范换算成目标市场通用写法、符合当地标准与习惯、避免误解，参数：[参数]", "📐"),
      ],
      [
        tpl("术语对照表", "成表", "给我一份 [领域] 的术语中外对照表、给出地道的对应译法与用法说明、便于统一规范使用，术语：[术语]", "📋"),
        tpl("避免直译", "更地道", "帮我把这些生硬的直译改成目标市场地道自然的表达、贴合当地说法与习惯、读起来专业顺畅，原文：[原文]", "🎯"),
        tpl("多语对照", "多市场", "给这些术语做多语对照表、给出各目标市场地道的对应译法、便于面向不同市场统一规范使用，术语：[术语]", "🌍"),
      ],
      [tpl("一句话术语", "最快起手", "帮我把这些术语本地化成目标市场地道的对应表达、给出术语对照、避免生硬直译、贴合内行说法，术语：[术语]", "⚡")],
    ),
  ),
  app(
    "multilang-notice", "多语通知函", "📣", "#0d9488",
    "涨价/放假/变更 → 多语通告",
    "trade-talk", [BIZDEV_SCENES.multilang, BIZDEV_SCENES.follow],
    "【填写要通知客户的事项（涨价/工厂放假/交期变更/政策调整）到此】\n（在顶部选目标语言与语气，AI 将写一封得体、清楚的对客户通知函。）",
    sections(
      [
        tpl("涨价通知", "有说服力", "写一封得体、有说服力的涨价通知函，原因 [原因]，翻成 [语言]，讲清背景与生效时间、安抚客户情绪、减少流失", "📈"),
        tpl("放假通知", "提前告知", "写一封清楚得体的工厂放假通知函，放假时间 [时间]，翻成 [语言]，说明对交期的影响与应对安排、提前提醒客户", "🏮"),
        tpl("交期变更", "解释安抚", "写一封诚恳得体的交期变更通知函，说明 [情况]，翻成 [语言]，解释原因、给出新时间点与补救、安抚客户情绪", "⏰"),
      ],
      [
        tpl("正式通告", "官方", "用正式通告口吻写这封对客户的通知函、措辞规范得体、讲清事项、影响与应对安排、便于客户知悉配合，事项：[事项]", "🏛️"),
        tpl("诚恳解释", "有温度", "用诚恳解释的口吻写这封对客户的通知函、把原因与影响讲清、安抚情绪、给出应对安排、维护关系，事项：[事项]", "💛"),
        tpl("简明清楚", "别啰嗦", "简明清楚地写这封对客户的通知函、把关键信息与行动指引讲明白、干净不啰嗦、便于客户快速知悉，事项：[事项]", "✂️"),
      ],
      [tpl("一句话通知", "最快起手", "帮我写一封得体清楚的对客户多语通知函、讲清事项、影响与应对安排、措辞专业便于翻译群发，通知事项：[事项]", "⚡")],
    ),
  ),

  // ───────────────── 成交跟进（engine: reply / dev-letter 复用）─────────────────
  app(
    "follow-up", "报价跟进信", "📮", "#0e7490",
    "报价后没回音 → 跟进信",
    "dev-letter", [BIZDEV_SCENES.follow],
    "跟进背景（已报价/寄样/寄 PI 后客户未回）与这次跟进的角度：[填写]\n（AI 将写一封不催命、有价值、能重启对话的跟进信，先在顶部填客户与产品。）",
    sections(
      [
        tpl("报价后跟进", "问进展", "写一封报价后的跟进信，客户 [客户]，产品 [产品]，礼貌询问进展、提供新价值、不催命地重启对话、引导回复", "💵"),
        tpl("寄样后跟进", "问反馈", "写一封寄样后的跟进信、礼貌询问 [客户] 的样品测试反馈、提供支持、顺势推进合作、不催命有价值，引导回复", "📦"),
        tpl("PI 后跟进", "催下单", "写一封发 PI 后得体催下单的跟进信、给 [客户] 一个尽快确认的理由、营造合理紧迫感、不催命又推进成交", "📄"),
      ],
      [
        tpl("提供价值", "不催命", "写一封提供新价值、不催命的报价跟进信、用新信息或福利重启对话、自然推进合作、引导客户回复，背景：[背景]", "🎁"),
        tpl("制造紧迫", "促决定", "写一封制造合理紧迫感的报价跟进信、给客户一个现在行动的理由、推动尽快决定、又不显得逼迫，背景：[背景]", "⏳"),
        tpl("轻松破冰", "重启对话", "写一封轻松破冰、重启对话的报价跟进信、用自然由头打破沉默、拉回客户、提供价值引导回复，背景：[背景]", "🧊"),
      ],
      [tpl("一句话跟进", "最快起手", "帮我写一封不催命、有价值、能重启对话的报价跟进信、礼貌推进合作、引导客户回复，跟进背景：[背景]", "⚡")],
    ),
  ),
  app(
    "order-confirm-reply", "订单确认回复", "✅", "#0891b2",
    "客户下单 → 专业确认回复",
    "reply", [BIZDEV_SCENES.follow],
    "【客户下单/确认订单的消息，粘贴到此】\n（AI 将帮你写一封专业的订单确认回复，明确条款、安排后续、增强信任。）",
    sections(
      [
        tpl("确认订单", "定条款", "客户确认下单，帮我写一封专业的订单确认回复、逐项核对条款、明确后续安排、增强信任，客户消息：[粘贴]", "📋"),
        tpl("定金收讫", "已收款", "帮我写一封专业的回复、确认已收到定金、告知即将安排生产与后续进度、让客户安心，客户消息：[粘贴]", "💰"),
        tpl("排产告知", "给安心", "帮我写一封专业得体的回复、清晰告知客户当前排产进度与预计交期、主动同步让客户安心，背景：[背景]", "🏭"),
      ],
      [
        tpl("专业稳重", "显靠谱", "用专业稳重的语气写一封订单确认回复、核对条款、明确后续安排、显得靠谱可信、增强合作信任，客户消息：[粘贴]", "🎓"),
        tpl("热情感谢", "有温度", "用热情感谢的语气写一封订单确认回复、感谢信任、核对条款、明确后续安排、拉近关系又专业，客户消息：[粘贴]", "💛"),
        tpl("条款清晰", "防纠纷", "写一封条款清晰、防纠纷的订单确认回复、逐项确认关键条款与责任、明确后续安排、避免后续争议，客户消息：[粘贴]", "🛡️"),
      ],
      [tpl("一句话确认", "最快起手", "帮我写一封专业的订单确认回复、明确核对条款、安排后续进度、增强客户信任，客户下单消息：[粘贴]", "⚡")],
    ),
  ),
];
