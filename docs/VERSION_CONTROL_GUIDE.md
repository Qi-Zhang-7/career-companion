# Career Companion 版本管理指南

> 适用项目：AI 职场陪伴师 Career Companion  
> 建立日期：2026-08-28  
> 产品与技术实现仍以项目根目录 `PRODUCT_ARCHITECTURE.md` 为准。

## 1. 当前状态

项目已经初始化 Git，但截至本文创建时：

- 当前分支为 `master`。
- 还没有创建任何 Commit。
- 项目文件目前都是未跟踪文件。
- 因此 Git 暂时不能帮助项目回滚到历史版本。

当前功能已经包括：

- Clickable MVP Shell。
- PostgreSQL、Prisma Schema、Migration 和 Seed。
- Growth 数据库化。
- My Career 数据闭环。
- Workplace Map 数据闭环。
- Settings / Memory 数据闭环。

建议在继续开发 Companion Chat 前，先建立第一个稳定基线版本。

## 2. 第一次建立 Git 基线

### 2.1 检查敏感文件

首先检查 Git 状态：

```bash
git status --short
```

确认真实 `.env` 已被忽略：

```bash
git check-ignore .env
```

应该只提交：

- `.env.example`
- 变量名称和示例格式
- 不含真实密码的配置说明

禁止提交：

- `.env`
- PostgreSQL 真实密码
- API Key
- Cookie、Token、Session
- 真实客户敏感资料
- 数据库完整生产数据

### 2.2 创建首个 Commit

确认状态无误后：

```bash
git add .
git commit -m "feat: establish database-driven MVP foundation"
```

推荐将主分支统一为 `main`：

```bash
git branch -m master main
```

首个 Commit 应代表：

> 当前项目可以安装、运行、连接数据库，并完成已经实现的页面数据闭环。

## 3. 分支策略

项目当前适合采用简单的 Feature Branch，不需要复杂的 Git Flow。

### 3.1 主分支

```text
main
```

规则：

- 始终保持可运行。
- 不直接在 `main` 上进行较大的实验性开发。
- 合并前至少通过 Lint 和生产构建。
- 不提交未完成一半、无法运行的代码。

### 3.2 功能分支

每个开发任务建立独立分支，统一使用 `codex/` 前缀。

示例：

```bash
git switch -c codex/chat-database
git switch -c codex/memory-candidates
git switch -c codex/roleplay-persistence
git switch -c codex/settings-fixes
```

推荐命名方式：

```text
codex/<功能或修复名称>
```

常见类型：

| 类型 | 示例 |
|---|---|
| 新功能 | `codex/chat-database` |
| Bug 修复 | `codex/fix-memory-drawer` |
| 数据库调整 | `codex/memory-schema` |
| UI 优化 | `codex/workplace-map-layout` |
| 文档 | `codex/database-docs` |

### 3.3 完成功能后合并

功能分支完成并验证后：

```bash
git switch main
git merge --no-ff codex/chat-database
```

`--no-ff` 会保留功能分支的合并节点，后续容易看出某一组 Commit 属于哪个开发任务。

## 4. Commit 原则

### 4.1 小步提交

不要等整个大功能全部完成才提交。

例如 Settings 可以拆成：

```text
feat: load memory settings from postgres
feat: add manual memory creation
feat: add memory review and soft deletion
fix: stabilize memory drawer refresh
docs: add memory testing guide
```

一个 Commit 最好只表达一个清楚的变化。

### 4.2 Commit 前检查

每次准备提交前：

```bash
npm run lint
npm run build
git status --short
git diff
```

需要确认：

- Lint 通过。
- TypeScript 与生产构建通过。
- 页面核心流程可以运行。
- 没有临时截图。
- 没有 `.env`。
- 没有真实密码和 API Key。
- 没有不相关文件。
- Prisma Schema 改动带有对应 Migration。

### 4.3 Commit Message 规范

推荐格式：

```text
<type>: <简短说明>
```

常用类型：

| 类型 | 用途 |
|---|---|
| `feat` | 新功能 |
| `fix` | Bug 修复 |
| `refactor` | 不改变功能的代码重构 |
| `docs` | 文档修改 |
| `test` | 测试与校验脚本 |
| `chore` | 配置、依赖、构建等维护工作 |
| `style` | 纯视觉或格式调整 |

示例：

```text
feat: persist career profile edits
feat: load workplace map from postgres
fix: prevent memory drawer refresh loop
docs: add database field dictionary
test: verify postgres table comments
```

## 5. 修改交互前创建检查点

对于容易反复调整的交互，例如：

- 抽屉自动关闭。
- 保存后页面刷新。
- 表单状态管理。
- 关系图布局。
- AI Prompt 行为。

在实验前先建立检查点：

```bash
git add .
git commit -m "chore: checkpoint before memory drawer experiment"
```

然后再开始实验。

如果效果不好，可以通过 Git 恢复，不需要凭记忆手工还原。

## 6. 常用回滚方式

### 6.1 查看历史

```bash
git log --oneline --decorate --graph -20
```

### 6.2 查看某次修改

```bash
git show <commit-id>
```

### 6.3 撤销尚未提交的单个文件

使用前必须确认该文件中的现有改动确实都不需要：

```bash
git restore path/to/file
```

这会丢弃该文件尚未提交的修改，执行前要非常谨慎。

### 6.4 撤销一个已经提交的 Commit

推荐使用可追溯的 `revert`：

```bash
git revert <commit-id>
```

它会创建一个新的反向 Commit，不会破坏已有历史，适合已经共享或已经合并到 `main` 的改动。

### 6.5 暂时查看旧版本

```bash
git switch --detach <commit-id>
```

查看结束后返回：

```bash
git switch main
```

不要在不了解影响时使用：

```text
git reset --hard
```

它可能直接丢失尚未保存的代码，不应作为日常回滚方式。

## 7. 里程碑 Tag

Commit 记录每次小变化，Tag 标记一个整体可运行的产品里程碑。

推荐里程碑：

```text
v0.1.0-clickable-shell
v0.2.0-database-foundation
v0.3.0-user-data-closed-loop
v0.4.0-chat-persistence
v0.5.0-memory-candidates
v0.6.0-agent-mvp
```

创建 Tag：

```bash
git tag -a v0.3.0-user-data-closed-loop -m "Career, workplace map and memory settings are database-driven"
```

查看 Tag：

```bash
git tag --list
```

如果未来配置 GitHub，再推送 Tag：

```bash
git push origin --tags
```

## 8. 数据库版本管理

代码版本和数据库数据版本必须分开理解。

### 8.1 Git 可以管理什么

Git 可以管理：

- `prisma/schema.prisma`
- Prisma Migration SQL
- Seed
- Repository
- Server Action
- 数据校验脚本
- 数据库文档

### 8.2 Git 不能自动回滚什么

Git 不能自动恢复：

- DBeaver 中手工修改的数据。
- 用户已经新增或删除的数据。
- 已执行 Migration 对现有数据造成的变化。
- PostgreSQL 中的真实业务记录。

因此“代码回滚”不等于“数据库数据回滚”。

### 8.3 表结构修改规则

不要只在 DBeaver 中手动修改表结构。

推荐流程：

1. 修改 `prisma/schema.prisma`。
2. 创建并检查 Migration。
3. 执行 Migration。
4. 验证数据。
5. 将 Schema 与 Migration 一起提交。

命令：

```bash
npm run db:validate
npm run db:migrate -- --name <migration-name>
npm run db:verify
```

### 8.4 Seed 使用规则

当前 Seed 会删除并重新创建演示用户和关联数据。

因此：

- Seed 只用于重置本地演示环境。
- 不要在需要保留手工测试数据时随意运行。
- 生产环境不能使用这种删除重建式 Seed。
- Seed 文件应纳入 Git，但 Seed 执行产生的数据不会纳入 Git。

### 8.5 数据备份

进行以下操作前应备份：

- 删除或重命名字段。
- 修改字段类型。
- 大批量更新数据。
- 执行破坏性 Migration。
- 从本地数据库迁移到云数据库。

开发阶段可以使用 PostgreSQL `pg_dump` 保存数据库快照。备份文件可能包含敏感信息，不应直接提交到 Git。

## 9. 推荐的日常开发流程

```text
确认 main 可运行
  ↓
创建 codex/功能分支
  ↓
完成一个小步骤
  ↓
Lint + Build + 页面测试
  ↓
创建小 Commit
  ↓
继续下一小步
  ↓
完成整个功能
  ↓
更新项目记录和测试说明
  ↓
合并回 main
  ↓
重要里程碑创建 Tag
```

对应命令示例：

```bash
git switch main
git switch -c codex/chat-database

# 开发并验证
npm run lint
npm run build

git add src/server/repositories/chat-repository.ts
git add src/features/chat
git commit -m "feat: persist companion conversations"

# 功能全部完成后
git switch main
git merge --no-ff codex/chat-database
```

## 10. 项目文档的版本同步

完成功能后，需要同步检查：

```text
PRODUCT_ARCHITECTURE.md
docs/PROJECT_RECORD_20260925.md
docs/DATABASE_DICTIONARY_20260827.md
对应功能测试说明
```

文档与代码应放在同一个 Commit 中，避免出现“代码已经实现，但项目记录仍显示未开发”的情况。

## 11. 当前建议执行顺序

1. 检查 `.gitignore` 和 `.env`。
2. 创建第一个基线 Commit。
3. 将 `master` 重命名为 `main`。
4. 给当前数据库闭环版本创建一个 Tag。
5. 创建 `codex/chat-database` 分支。
6. 再开始 Companion Chat 数据库化。

在首个基线 Commit 建立之前，不建议继续进行大规模功能开发，因为此时仍然没有可靠的代码回滚点。
