# 职场成长陪伴师｜项目交接与打包说明

整理日期：2026-10-25。源码基线：分支 `codex/chat-database`，最近提交 `045577c`（2026-09-27，connect roleplay to reflection）。本包包含打包时工作区文件，包含尚未提交的修改。

## 1. 当前进度

项目处于数据库驱动 MVP 阶段。页面、数据存储和模拟复盘流程已经建立；真实 AI、登录鉴权与自动记忆尚未接入。此前聊天中“65%–70%”只是粗略判断，没有正式验收分母，交接以以下功能状态为准。

| 模块 | 当前实现 | 仍需完成 |
|---|---|---|
| Home | 首页及当前用户姓名读取 | 最近关注等演示内容替换为真实业务数据 |
| Chat | 会话/消息入库、四种陪伴模式、切换历史、刷新恢复、结束归档及规则摘要 | 真实模型回复、分页与自动记忆候选 |
| 聊天隐私 | 单次软删除、确认清空、保存历史开关、一次性临时对话 | 保留期限、自动过期、后台物理清理、导出 |
| My Career | 职业档案、职业目标、成长主题读取及编辑保存 | 与后续智能陪伴联动 |
| Workplace Map | 人物、关系、观察、策略、事件读取；人物维护和推测审核 | 关系距离/影响力布局、聚合筛选 |
| Role Play | 人物上下文、创建练习、消息保存、继续练习、结束归档、规则复盘 | 真实 AI 对手及更稳定的模拟引擎 |
| Reflection | 指定模拟的完整原话与草稿；用户确认编辑；同一模拟复盘更新而不重复新增 | 现实行动结果回访、WorkEvent 及成长证据关联 |
| Growth | 数据库主题、证据时间线、报告历史快照展示 | 报告生成/编辑/确认写入；周报/季度报；模式确认持久化 |
| Settings / Memory | 记忆开关、手动添加、确认、纠正、拒绝、软删除，来源与关联展示 | 自动提取/检索/更新，更多隐私与账号管理 |
| 基础设施 | Next.js、React、TypeScript、Tailwind、PostgreSQL、Prisma、迁移和验证脚本 | 登录鉴权、生产部署、可观测性、评测体系、RAG |

Growth 部分按钮目前只是展示，模式确认仅为页面状态；数据库有快照结构不等于已经交付完整报告工作流。部分初始数据来自 Seed，不能视为 AI 自动生成。当前统一使用演示账号 `demo@career-companion.local`。

## 2. 建议后续顺序

1. 完成现实结果回访：模拟 → 正式复盘 → 现实尝试 → WorkEvent/实际结果 → 用户确认的成长证据。模拟表现不能自动当作现实成长。
2. 完成聊天保留期限、过期和物理清理、数据导出。
3. 接入真实 AI：服务端模型调用、Prompt 加载、上下文与策略、安全规则、错误处理和质量评测。
4. 实现长期记忆候选提取、用户确认、检索/纠错/删除，再实现 Self / World / Interaction 模型与跨事件模式。
5. 补齐成长报告写入工作流、登录鉴权及生产环境能力。
6. 后续再做关系图布局优化、知识库上传与 RAG。

所有用户查询必须限定用户范围；事实、观察、推测与感受分开；AI 候选未经确认不能成为事实；历史报告保留版本和快照。

## 3. 解压后运行

需要 Node.js（满足 Next.js 15 与 Prisma 7 的要求，建议使用兼容的 Node 22 LTS）、npm、PostgreSQL。原开发环境使用 PostgreSQL 18，默认本地端口 5432。

1. 在 PostgreSQL 中新建空数据库 `career_companion`。
2. 将 `.env.example` 复制为 `.env`，填写本机 `DATABASE_URL`。密码中的 URL 保留字符需要编码。真实 AI 尚未接入，当前无需有效模型 Key。
3. 在项目根目录依次执行：

```powershell
npm ci
npx prisma migrate deploy
npm run db:generate
npm run db:seed
npm run dev
```

访问 http://localhost:3000 。`migrate deploy` 应用包内已有迁移；修改数据模型并创建新迁移时使用 `npm run db:migrate`。Prisma 生成目录未打包，必须执行 `db:generate`。

`db:seed` 会删除并重建固定演示账号及其关联数据。仅在新建演示数据库时运行；已有个人数据的环境不要用 Seed 作为升级步骤。

## 4. 数据库说明

- 结构权威来源：`prisma/schema.prisma`；迁移历史：`prisma/migrations/`。
- 演示初始化：`prisma/seed.ts`；连接配置：`prisma.config.ts`、`src/server/db/prisma.ts`。
- 字典：`docs/DATABASE_DICTIONARY_20260827.md`；安装说明：`docs/DATABASE_SETUP.md`。历史字典需结合后续迁移阅读。
- 主要数据域：用户/职业档案、人物关系/观察/沟通策略、会话/消息、工作事件/行动/复盘、模拟会话/消息、记忆及证据、长期模型、成长主题和报告快照。
- 后续变更包括 `Conversation.deletedAt`、`User.chatHistoryEnabled`、`Reflection.roleplaySessionId`（唯一关联）和 `Reflection.userFeeling`，详见各迁移及专题记录。
- 聊天软删除不会立即删除消息；关闭历史保存或临时对话的新消息仅在页面中保留。长期记忆开关与聊天历史开关独立。
- 包内包含数据库结构、迁移和虚构 Seed，不包含当前 PostgreSQL 实例的实际数据备份。迁移不能恢复已有聊天、人物修改和用户记录。

## 5. 测试说明与验证边界

本次整理之前，本聊天已实际执行 `npm run lint` 和 `npm run build`，均通过，八个业务页面构建成功。本次仅整理与打包，没有重新执行数据库写入测试或浏览器逐项验收；历史验收记录不能代替目标机器复验。

基础检查：

```powershell
npm run db:validate
npm run lint
npm run build
npm run db:verify
npm run db:verify-comments
```

功能数据库脚本：`db:verify-memory-write`、`db:verify-chat-write`、`db:verify-chat-clear`、`db:verify-chat-history-setting`、`db:verify-roleplay-write`、`db:verify-reflection-write`（均通过 `npm run` 执行）。写入类脚本可能创建/修改/删除测试数据，请先阅读对应脚本，在独立测试数据库执行。

| 主题 | 说明及手工验收记录 | 验证脚本 |
|---|---|---|
| 数据库与中文注释 | DATABASE_SETUP、DATABASE_DICTIONARY | verify-database、verify-database-comments |
| 职业档案 | MY_CAREER_TEST_PROFILE_20260827.md | 按文档手工验证 |
| 职场人物 | WORKPLACE_MAP_TEST_20260827.md | 按文档手工验证 |
| 设置与记忆 | SETTINGS_MEMORY_TEST_20260828.md | verify-memory-write |
| 聊天与删除 | CHAT_DATABASE_TEST_20260828.md | verify-chat-write、verify-chat-clear |
| 历史保存 | CHAT_HISTORY_SETTING_20260920.md | verify-chat-history-setting |
| 临时对话 | TEMPORARY_CHAT_20260925.md | 按文档手工验证 |
| 模拟练习 | ROLEPLAY_DATABASE_TEST_20260925.md | verify-roleplay-write |
| 模拟关联复盘 | REFLECTION_DATABASE_TEST_20260927.md | verify-reflection-write |

表中说明文件位于 `docs/`，脚本位于 `scripts/`，脚本名省略 `.ts`。

## 6. 文档导航

- 总体产品规范：`PRODUCT_ARCHITECTURE.md`。
- 详细开发历程：`docs/PROJECT_RECORD_20260925.md`，正文已更新至 2026-09-27；文件名日期不是最后更新日期。
- 成长产品决策：`docs/GROWTH_PRODUCT_DECISIONS.md`。
- 后续隐私计划：`docs/NEXT_PHASE_CHAT_RETENTION_AND_PRIVACY_20260830.md`。
- Prompt 配置：`docs/AGENT_PROMPT_CONFIGURATION_20260925.md`、`prompts/README.md` 及 `prompts/base/`、`prompts/agents/`。
- Git 操作说明：`docs/VERSION_CONTROL_GUIDE.md`。
- 所有其余原始说明、验收和测试文档均完整保留在 `docs/`。

历史设计中的“下一步”可能已经完成，应优先参考本文功能表、最新项目总记录和实际源码。

## 7. ZIP 内容与排除项

包含源码、全部项目 Markdown 文档、数据库 Schema/迁移/Seed、测试脚本、配置文件、`package-lock.json`、安全占位的 `.env.example`，以及本交接说明。包内 `PACKAGE_MANIFEST.sha256` 列出文件路径和 SHA-256 校验值。

排除 `.env` 及其他真实环境文件、`.git`、`node_modules`、`.next`、`.next-dev`、生成的 Prisma Client、日志、临时缓存和 ZIP 自身。解压后需安装依赖、配置数据库并重新生成 Prisma Client。本包是源码交接包，不是已部署应用或完整数据库备份。
