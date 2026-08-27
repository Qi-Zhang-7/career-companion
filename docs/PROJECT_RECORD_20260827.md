# Career Companion 项目开发记录（2026-08-27）

> 本文记录截至 2026-08-27 已完成的产品、前端与数据库工作，帮助后续开发快速理解“现在有什么、为什么这样设计、下一步从哪里继续”。所有实现仍以项目根目录的 `PRODUCT_ARCHITECTURE.md` 为总规范。

## 1. 当前阶段结论

项目已经从纯 Clickable MVP Shell 进入“逐页接入真实数据库”的阶段，但还没有接入真实 AI、登录鉴权、RAG 或长期记忆自动提取。

目前已经完成：

- Next.js App Router + React + TypeScript + Tailwind CSS 的产品骨架。
- Home、Chat、My Career、Workplace Map、Role Play、Reflection、Growth、Settings 八个页面。
- 本机 PostgreSQL 18 与 DBeaver 安装、连接和数据库创建。
- Prisma 7 数据模型、首个 Migration、Seed 演示数据与数据库校验脚本。
- Growth 页面改为读取 PostgreSQL 实时数据。
- Home、My Career、Growth、Settings 通过同一个“当前用户”入口读取姓名。
- My Career 已完成 CareerProfile、CareerGoal、GrowthTheme 的数据库读取，并可通过编辑抽屉写回数据库。
- Workplace Map 已完成 Person、Relationship、PersonObservation、CommunicationStrategy、WorkEvent 的数据库读取，并支持人物维护和推测审核。
- Settings 已完成 User.memoryEnabled、Memory、MemoryEvidence、MemoryLink 的数据库读取与用户可控管理。
- Growth Report 使用快照表保存历史版本，避免模型或主题更新后覆盖过去的结论。

当前仍是混合状态：

- 用户姓名和 Growth 数据已经来自数据库。
- Home 最近关注、Chat、Role Play、Reflection 的大部分内容仍是 mock data。
- 当前没有登录系统，暂时将 `demo@career-companion.local` 视为当前用户。

## 2. 技术栈与本地环境

| 层级 | 当前实现 |
|---|---|
| Web | Next.js 15 App Router、React 19、TypeScript |
| UI | Tailwind CSS 4、shadcn/ui 风格基础组件、Lucide Icons |
| 数据库 | PostgreSQL 18（本机） |
| 数据库客户端 | DBeaver |
| ORM | Prisma 7.10、`@prisma/adapter-pg`、`pg` |
| 数据库配置 | 根目录 `.env` 中的 `DATABASE_URL`（已被 Git 忽略） |
| 演示账号 | `demo@career-companion.local` |

常用命令：

```bash
npm run dev
npm run lint
npm run build
npm run db:validate
npm run db:generate
npm run db:migrate
npm run db:seed
npm run db:verify
npm run db:studio
```

注意：数据库密码只保存在 `.env`，文档、代码和 Git 中都不要记录真实密码。

## 3. 数据库落地过程

### 3.1 本地数据库

在 PostgreSQL 中创建了：

```text
career_companion
```

DBeaver 已能连接并查看表与数据。

### 3.2 Prisma 初始化

核心文件：

- `prisma/schema.prisma`：数据结构总定义。
- `prisma/migrations/20260827003421_init/migration.sql`：首个数据库迁移。
- `prisma/seed.ts`：真实职场场景演示数据。
- `scripts/verify-database.ts`：校验演示用户、人物证据类型、Growth Theme 和报告数据。
- `src/server/db/prisma.ts`：应用内部复用的 Prisma Client。

迁移、Seed 和校验均已成功执行。

### 3.3 当前演示数据

Seed 建立的主要数据包括：

- 1 个演示用户。
- 1 份职业档案。
- 3 个职场人物。
- 4 个真实风格的工作事件。
- 2 个 Growth Theme。
- 1 个已确认的 Interaction Model。
- 3 个月度成长报告，其中历史月份为已确认快照，当前月份为草稿。

用户后来在 DBeaver 中将 `User.displayName` 从“林然”修改为“七七”，数据库已验证保存成功。

重要提醒：当前 `prisma/seed.ts` 会先删除旧的演示用户，再重新创建。如果再次运行 `npm run db:seed`，手工修改过的“七七”可能被 Seed 默认值覆盖。Seed 只适合重置演示环境，不应作为日常修改数据的方式。

## 4. 数据库整体结构

当前 Schema 包含 31 个 Model，可按业务含义分为八组。

```mermaid
flowchart LR
    U["User 当前用户"] --> CP["CareerProfile / CareerGoal"]
    U --> P["Person / Relationship"]
    P --> PO["PersonObservation / CommunicationStrategy"]
    U --> C["Conversation / Message"]
    U --> E["WorkEvent / EventDynamics / Reflection"]
    E --> A["ActionItem"]
    U --> M["Memory / Insight / Pattern"]
    M --> LM["Self / World / Interaction Model"]
    U --> G["GrowthTheme"]
    E --> G
    G --> R["GrowthReport 快照"]
```

### 4.1 用户与职业档案

| 表 | 用途 | 关键字段 |
|---|---|---|
| `User` | 用户主表、隐私设置和所有个人数据的归属根节点 | `email`、`displayName`、`locale`、`timezone`、`memoryEnabled` |
| `CareerProfile` | 相对稳定的职业背景；与 User 一对一 | `currentRole`、`industry`、`companyType`、`city`、`yearsExperience`、`careerStage` |
| `CareerGoal` | 短期、中期、长期职业目标；与 User 一对多 | `horizon`、`title`、`status`、`targetDate`、`confidence` |

设计考虑：用户姓名与账号属性放在 `User`；职业背景放在 `CareerProfile`，避免把所有内容都堆到用户主表。

### 4.2 职场人物与关系

| 表 | 用途 |
|---|---|
| `Person` | 用户职场世界中的领导、项目经理、同事、客户、HR 等人物 |
| `Relationship` | 用户与人物的关系类型、亲近度、影响力和沟通概况 |
| `PersonObservation` | 对人物的事实、观察、推测和用户感受 |
| `CommunicationStrategy` | 与某个人在特定情境下可能有效的沟通策略 |

`PersonObservation.kind` 必须明确区分：

- `FACT`：可核实事实。
- `OBSERVATION`：用户观察到的重复行为。
- `INFERENCE`：AI 或用户基于证据作出的推测。
- `USER_FEELING`：用户面对这个人物时的主观感受。

每条观察还保存 `confirmationStatus`、`confidence`、`sourceType/sourceId`、正反证据数量。这样 AI 可以主动提取候选信息，但不能未经确认把推测表现成事实。

### 4.3 对话

| 表 | 用途 |
|---|---|
| `Conversation` | 一次陪伴对话的会话信息、模式、状态和摘要 |
| `ConversationMessage` | 按顺序保存用户和助手消息，并预留模型、Prompt 版本、Token 和安全级别信息 |

目前页面仍使用 mock 对话，没有向这两张表写入真实数据。

### 4.4 事件、行动、模拟与复盘

| 表 | 用途 |
|---|---|
| `WorkEvent` | 一次有时间、事实、情绪、关注点和结果的真实职场事件 |
| `EventDynamics` | 事件中的触发、压力、用户需要、双方反应和结果模式 |
| `WorkEventPerson` | 事件与参与人物的多对多关联 |
| `ActionItem` | 从对话、事件或复盘产生的下一步行动 |
| `Reflection` | 对真实事件的目标、经过、有效动作、改进点和下一次实验 |
| `RoleplaySession` | 模拟沟通的场景、难度、目标、角色和复盘结果 |
| `RoleplayMessage` | 一轮模拟中的逐条消息 |

设计考虑：真实发生的事件与模拟练习必须分开。只有真实行动和后续复盘才能作为成长的强证据，不能把“模拟得不错”直接算作现实成长。

### 4.5 长期记忆与洞察

| 表 | 用途 |
|---|---|
| `Memory` | 可查看、可确认、可删除、带版本的长期记忆 |
| `MemoryEvidence` | 记忆来自哪条消息或哪项业务实体 |
| `MemoryLink` | 记忆与人物、事件、主题等实体的关联 |
| `UserInsight` / `InsightEvidence` | 基于多项证据形成的洞察及证据 |
| `UserPattern` | 触发 → 反应 → 结果的重复模式候选 |

目前这些表主要完成了结构预留，Settings 页面还没有读取真实 Memory 数据，AI 也还没有执行自动提取。

### 4.6 三个长期模型

| 表 | 回答的问题 |
|---|---|
| `SelfModelEntry` | “我是怎样工作和成长的人？”包括优势、需要、压力源、偏好、方向等 |
| `WorldModelEntry` | “我所在的职场世界是什么样？”包括公司、团队、项目、人物、约束和风险 |
| `InteractionModel` / `InteractionEvidence` | “我与某个人或环境相遇时，通常怎样反应，什么策略更有效？” |

三类模型都是基于证据的投影，不替代原始事件，也不能直接覆盖成“用户事实”。它们包含置信度、状态、版本和证据关系。

### 4.7 Growth Theme

| 表 | 用途 |
|---|---|
| `GrowthTheme` | 用户正在持续练习和改变的主题 |
| `GrowthThemeLink` | 主题与工作事件等真实证据的关联 |

主题保存：

- 为什么形成：`originSummary`
- 来源：`source`
- 用户确认状态：`confirmationStatus`
- 当前状态：`status`
- 置信度与首次/最近出现时间
- 关联事件数量和权重

当前 Seed 的示例主题包括“建立责任边界”和“把依赖说清楚”。这些是演示用的共创/复盘主题，不代表未来由系统无条件替用户决定。

### 4.8 成长报告与历史快照

| 表 | 用途 |
|---|---|
| `GrowthReport` | 周报、月报或季度回顾的版本、状态、总结和下一阶段重点 |
| `GrowthReportTheme` | 报告生成当时的主题、过去模式、最近模式、有效策略和下一次实验快照 |
| `GrowthReportEvidence` | 报告当时采用的真实事件证据文本快照 |

报告采用 Snapshot，而不是每次打开时根据最新 Theme 临时重算。即使几个月后 AI 或用户修改了当前理解，8 月报告仍然保留 8 月确认时的结论；新结论通过新版本或新月份报告表达。

这支持产品希望呈现的变化链：

```text
8 月：被催 → 焦虑 → 马上答应
  ↓
9 月：开始说明依赖，但仍会同时承诺冲突任务
  ↓
10 月：先澄清优先级 → 说明依赖 → 给出时间节点
```

## 5. 关键状态枚举

当前 Schema 中有 10 组枚举，主要用于避免重要业务状态被任意字符串污染：

- `ConfirmationStatus`：信息是否已被用户确认、拒绝或仍缺证据。
- `EvidenceKind`：Fact、Observation、Inference、User Feeling。
- `GrowthThemeStatus`：主题处于萌芽、活跃、改善、稳定等阶段。
- `GrowthThemeSource`：主题来自用户、对话共创、复盘或系统候选等来源。
- `ConversationMode`：倾听、教练、建议、模拟、复盘、职业与安全模式。
- `MessageRole`：消息角色。
- `EntityStatus`：通用实体状态。
- `ActionStatus`：行动项状态。
- `ReportPeriod`：周、月、季度。
- `ReportStatus`：草稿、确认、被新版本替代。

## 6. 页面目前如何读取数据库

### 6.1 当前用户统一入口

新增：

```text
src/server/repositories/current-user-repository.ts
```

现在 Home、My Career、Growth、Settings 都通过该入口识别同一个演示用户。当前逻辑是按以下邮箱查找：

```text
demo@career-companion.local
```

因此把数据库中的 `User.displayName` 改为“七七”后，这四个页面都会显示“七七”。

这是 MVP 过渡方案，不是最终鉴权方案。以后接入登录后，应在这个 repository 中改为从 Session 取得 `userId`，所有 repository 查询继续强制带 `userId`，页面不需要各自重新实现用户识别。

### 6.2 Growth Repository

```text
src/server/repositories/growth-repository.ts
```

它负责：

- 查询当前用户与 Growth Theme。
- 从 `GrowthThemeLink` 找到关联 `WorkEvent`。
- 加载事件人物和 Event Dynamics。
- 加载 Growth Report、主题快照和证据快照。
- 转换为 Growth 页面所需的 View Model。

Growth Route 使用 `dynamic = "force-dynamic"`，因此刷新页面会重新读取数据库，而不是继续显示构建时的旧值。

## 7. 过程中做过的关键调整

### 7.1 Growth 从静态卡片升级为证据时间线

Growth 页面现在展示：

- 为什么形成主题。
- 主题来源与用户确认状态。
- 关键事件时间轴。
- 过去与最近的反应方式。
- 有效策略。
- 下一步实验。
- 月度报告和历史版本快照。

页面不使用“沟通能力 82”一类抽象评分，而是用真实事件支持变化。

### 7.2 当前用户从页面写死改为统一读取

最初首页把“林然”写在组件中，修改数据库自然不会影响页面。现在用户名已经从统一 repository 读取，Home、My Career、Growth、Settings 保持一致。

My Career 已进一步接入 `CareerProfile`、`CareerGoal` 和 `GrowthTheme`，不再从 `mock-data.ts` 读取职业档案。用户保存档案后，姓名、岗位、行业、公司/团队信息、职业阶段和三段职业目标会写入 PostgreSQL。

### 7.3 Tailwind CSS 稳定性修复

曾出现页面偶发“CSS 崩掉”：Tailwind 没稳定扫描完整源码，以及 `next dev` 与 `next build` 共用缓存目录。

处理方式：

- 在 `globals.css` 显式指定 Tailwind 扫描 `src`。
- 开发环境使用 `.next-dev`，生产构建使用 `.next`。
- ESLint 与 Git 忽略 `.next-dev`。

修复后已验证开发页面在执行生产构建后仍保持完整样式。

## 8. 当前已知边界和风险

1. **暂无登录鉴权**：当前邮箱常量只适合单用户本地 MVP，不能直接用于 C 端生产环境。
2. **仍有 mock data**：看到页面内容不代表相应表已经接入数据库。
3. **Seed 会重置演示用户**：不要在有需要保留的数据时随意执行 Seed。
4. **部分通用业务类型仍是 String**：例如 `sourceType`、`entityType`、人物分组等，后续稳定后可逐步收敛为枚举或受控常量。
5. **尚未提供页面写入闭环**：目前主要通过 DBeaver 改数据，下一步需要实现表单、Server Action、校验和错误反馈。
6. **AI 提取尚未实现**：当前 Schema 已支持候选、证据和确认状态，但还没有真正的 Extractor/Consolidator。
7. **生产数据库未配置**：未来公开给 C 端用户使用时，需要托管 PostgreSQL、认证、备份、连接池、迁移流程和行级权限隔离。

## 9. 下一步建议（按小步迭代）

职业档案数据库闭环已完成。下一轮建议继续按以下顺序推进：

```text
Companion Chat 会话与消息落库
  → 记忆候选提取与用户确认闭环
  → Home 聚合真实事件、主题和行动项
  → Chat 对话落库
  → AI 候选提取 + 用户确认
```

## 10. 维护时先看哪些文件

```text
PRODUCT_ARCHITECTURE.md
docs/PROJECT_RECORD_20260827.md
docs/GROWTH_PRODUCT_DECISIONS.md
docs/DATABASE_SETUP.md
prisma/schema.prisma
prisma/seed.ts
src/server/repositories/current-user-repository.ts
src/server/repositories/growth-repository.ts
```

任何新实现都应继续遵循以下约束：

- 所有用户数据读取必须明确限定 `userId`。
- Fact、Observation、Inference、User Feeling 不混写。
- AI 可以提出候选，但未经用户确认不能升级为事实。
- Growth 结论必须有真实事件证据。
- 正式报告保留快照和版本，不覆盖历史结论。
- 页面按 feature-based architecture 拆分，不把业务查询写进客户端组件。

## 11. 整体闭环跑通后再优化的 TODO

### Workplace Map 关系图布局

当前阶段保留现有实现：

- 人物优先按照“关联真实事件数量”从多到少排序。
- 事件数量相同时，再参考 `influenceLevel` 排序。
- 使用预设坐标将人物排列在中心“我”的周围。
- 目前第 7、8 位人物会进入内圈；这只是布局位置，不代表真实关系更近。

在 Home、Chat、My Career、Workplace Map、Role Play、Reflection、Growth、Settings 的核心数据闭环全部跑通后，再进行以下优化：

- 使用 `Relationship.closeness` 决定人物距离“我”的远近。
- 使用 `Relationship.influenceLevel` 决定人物节点大小，而不是直接等同于关系亲近。
- 使用近期真实事件数量或互动频率决定连线粗细。
- 使用 `Person.groupType` 决定人物所在方向和颜色，例如领导、项目、开发、客户、HR。
- 在人物编辑表单中增加“关系紧密程度 1–5”。
- 同一圈层、同一分组内增加自动防重叠布局。
- 9–15 人时优先显示核心人物和近期人物，其余使用小节点。
- 15 人以上时考虑按项目、团队或角色聚合，并支持筛选。
- 对已离开当前项目的人提供“历史关系”视图，避免长期占据主图。

未来推荐的视觉编码：

| 数据 | 图上表达 |
|---|---|
| `closeness` | 与中心“我”的距离 |
| `influenceLevel` | 人物节点大小 |
| 近期真实事件数量 | 连线粗细或强调程度 |
| `groupType` | 方向与颜色 |
| 待确认观察数量 | 人物节点上的轻量提示 |

这项优化当前不阻塞 MVP 数据闭环，不在 Settings、Chat 和记忆流程完成前提前实施。
