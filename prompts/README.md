# Agent Prompt 目录

这里存放可版本管理的 Prompt 模板。它们只应由服务端 Agent 编排层读取，不能在 React 客户端中加载，也不能包含 API Key、用户真实资料或生产机密。

当前阶段仍使用规则生成的 mock 回复；这些模板是下一阶段接入模型时的配置入口，尚未接入运行时。

## 组合方式

一次模型请求不使用单一巨型 Prompt，而按顺序组合：

1. `base/personality.v1.md`：统一人格与表达原则。
2. `base/safety.v1.md`：安全边界和高风险响应。
3. `base/privacy.v1.md`：隐私、来源、事实与推测边界。
4. 当前 Companion 能力或 Domain Agent，例如 `agents/roleplay.v1.md` 或 `agents/reflection.v1.md`。
5. 服务端生成的最小相关上下文、用户当前任务和结构化输出约束。

每次改动通过新版本文件发布，例如从 `roleplay.v1.md` 升级到 `roleplay.v2.md`；历史运行继续保留原 `prompt_version`，不能静默覆盖。

## 规划中的目录

```text
prompts/
  base/
  companion/
  agents/
  memory/
  insight/
```

七种会话模式是 Companion 的工作状态，不等于七个互不相干的机器人。`LISTENING`、`COACHING`、`ADVICE` 主要由 Companion Policy 组合能力；`ROLEPLAY`、`REFLECTION`、`CAREER` 使用对应领域能力；`SAFETY` 可覆盖其他模式。
