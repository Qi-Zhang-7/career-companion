# Agent、Prompt 与 API Key 配置说明

更新时间：2026-09-27

## 1. API Key 放在哪里

本地开发时把真实 Key 写入项目根目录 `.env`：

```dotenv
OPENAI_API_KEY="你的真实 Key"
```

`.env.example` 只保留占位符，可提交 Git；真实 `.env` 已被忽略，不能提交。公开部署后，应在 Vercel、Cloudflare 或所选云平台的 Secret / Environment Variables 中配置，不写进源码、数据库或浏览器环境变量。只有服务端模型客户端可以读取该 Key。

## 2. Prompt 放在哪里

依据 `PRODUCT_ARCHITECTURE.md`，版本化 Prompt 统一放在项目根目录 `prompts/`。目前已建立：

```text
prompts/
  base/
    personality.v1.md
    safety.v1.md
    privacy.v1.md
  agents/
    roleplay.v1.md
    reflection.v1.md
```

后续逐步补充 `companion/`、`memory/`、`insight/` 和其余领域能力。Prompt 不散落在页面组件或 server action 中。

## 3. 后续代码如何调用

真实模型接入阶段，在 `src/server/agents/` 建立仅服务端使用的能力：

- Prompt Registry：按固定名称和版本读取模板。
- Context Builder：只组装当前任务需要的用户、人物、事件和已确认记忆。
- Companion Policy：决定本轮采用 LISTENING、COACHING、ADVICE、ROLEPLAY、REFLECTION、CAREER 或 SAFETY。
- Model Client：读取 `OPENAI_API_KEY` 并调用模型。
- Schema Validator：校验模型结构化结果，再允许写入业务数据。
- Run Logger：记录 agent、model、prompt_version、耗时、token 和结果状态，不记录未脱敏的完整敏感 Prompt。

运行时 Prompt 由“基础人格 + 安全 + 隐私 + 当前能力 + 最小相关上下文 + 当前任务”组成。`SAFETY` 可以覆盖其他工作状态。

## 4. 七种模式是不是七个独立 Agent

不是。七种模式是 Core Companion 的工作状态，用户不需要理解内部路由：

- `LISTENING`：情绪承接和倾听。
- `COACHING`：澄清问题、需要和选择。
- `ADVICE`：在信息足够时形成方案。
- `ROLEPLAY`：调用角色模拟能力。
- `REFLECTION`：基于真实语言和节点复盘。
- `CAREER`：调用职业决策能力。
- `SAFETY`：高风险时接管响应。

Role-play、Reflection、Career 等领域能力是 Core Companion 使用的工具，不应各自形成互不共享上下文的聊天机器人。

## 5. 当前实现边界

截至本记录，Chat 和 Role Play 的助手回复仍是 mock / 规则响应，没有调用真实模型，也不会读取 `OPENAI_API_KEY`。本次建立 Prompt 文件是为了固定未来配置位置和版本规则，不代表模型能力已经上线。
