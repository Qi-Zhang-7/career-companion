# Companion Chat 数据库测试记录（2026-08-28）

## 本轮实现

- Chat 从 PostgreSQL 读取当前用户最近 20 次会话。
- 新对话创建 `Conversation`，消息依次写入 `ConversationMessage`。
- 四种陪伴方式会记录到消息的 `mode` 字段。
- 结束对话后保存结束时间、归档状态和规则生成的摘要。
- 刷新页面后，会话、消息和摘要仍然存在。
- 左侧会话记录支持单次删除；确认后写入 `Conversation.deletedAt` 和 `status = DELETED`，并立即从页面隐藏。

本轮 AI 回复仍是 mock，并记录 `model = mock`、`promptVersion = mock-chat-v1`，便于下一阶段替换。

## 长期记忆边界

结束对话只生成 `Conversation.summary`，不会直接创建 `Memory`。未来由记忆提取流程提出候选内容，再让用户确认、纠正或拒绝；未经确认的推测不能作为事实保存。

## 前端测试

1. 打开 `/chat`，开始一段新对话。
2. 切换四种陪伴方式并发送内容。
3. 刷新浏览器，确认历史和消息仍在。
4. 点击“结束并生成摘要”，确认出现摘要且不能继续发送。
5. 切换历史会话，确认内容保持一致。
6. 点击某条会话右侧的删除图标，取消时不应变化；再次操作并确认后，该会话应从历史中消失。
7. 点击“陪伴记录”右侧的“清空”，输入错误文字或取消时历史不变；输入“清空”后，当前用户的全部会话应消失并进入新对话状态。

## DBeaver 检查

- `Conversation`：检查 `mode`、`title`、`status`、`summary`、`startedAt`、`endedAt`。
- 删除会话后检查 `Conversation.deletedAt` 已写入，`status` 为 `DELETED`；本阶段尚未物理删除消息。
- `ConversationMessage`：检查 `role`、`content`、`mode`、`model`、`promptVersion`、`sequenceNo`。
- `Memory`：本轮聊天不应自动增加记录。

## 自动冒烟测试

```bash
npm run db:verify-chat-write
npm run db:verify-chat-clear
```

测试会创建一条临时会话和三条消息，验证归档及摘要后删除临时会话；对应消息会级联删除，不保留测试数据。

清空测试会创建一个隔离的临时用户和两段会话，验证批量软删除后再删除该测试用户，不会清空演示用户的真实历史。
