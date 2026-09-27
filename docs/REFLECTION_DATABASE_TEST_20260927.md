# Role Play → Reflection 数据库闭环与验收

更新时间：2026-09-27

## 本轮完成

- `/reflection?source=roleplay&sessionId=...` 按当前用户读取已经归档的模拟。
- 页面展示人物、模拟场景、目标、完整原话和规则复盘草稿。
- 用户确认或编辑模拟经过、自己的目标、对方可能关注点、个人感受、有效表达、改进点和一个下一次实验。
- 保存时写入 `Reflection`，通过 `roleplaySessionId` 与 `RoleplaySession` 一对一关联。
- 同一模拟再次保存使用 upsert 更新原记录，数据库唯一索引同时阻止重复。
- `/reflection` 展示最近 20 次已结束模拟，并区分“开始复盘”和“继续编辑”。

## 数据边界

- `goalOther` 在界面标记为“推测 · 待确认”，不作为对方人格事实。
- `userFeeling` 明确保存用户主观感受，不与事实混写。
- Role Play 的规则结果只是复盘草稿，用户修改并保存后才成为正式 Reflection。
- 模拟复盘不是现实事件结果，本轮不会自动创建 WorkEvent、Memory 或 Growth Evidence。

## 数据库变更

迁移：`20260925153000_link_roleplay_reflection`

- `Reflection.roleplaySessionId UUID NULL UNIQUE`
- `Reflection.userFeeling TEXT NULL`
- 外键删除策略为 `ON DELETE SET NULL`，模拟删除后仍可保留用户写下的复盘。

## 自动验证

```bash
npm run db:verify-reflection-write
npm run db:verify-comments
npm run lint
npm run build
```

写入测试会临时创建并结束一次模拟，首次保存 Reflection 后再次修改，验证记录 ID 不变且关联数始终为 1，最后删除测试数据。

## 手工测试

1. 在 `/roleplay` 完成并结束一次模拟。
2. 点击“进入完整复盘”。
3. 检查人物、场景、目标、规则草稿和模拟原话是否对应本次练习。
4. 填写“用户感受”和“下一次实验”，保存。
5. 刷新页面，确认已保存内容恢复。
6. 修改下一次实验并再次保存。
7. 返回 `/reflection`，确认该练习显示“继续编辑”，且数据库没有产生重复 Reflection。
