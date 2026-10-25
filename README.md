# 职场成长陪伴师

围绕职场事件、陪伴对话、沟通模拟、复盘与成长证据的 Web 项目。

当前为数据库驱动 MVP：八个业务页面已建立，支持职业档案和人物管理、聊天历史与隐私控制、模拟练习保存及正式复盘。Chat 和 Role Play 的回复仍为规则 mock，真实 AI、登录鉴权、自动记忆和现实结果回访尚待完成。

## 项目文档

- [项目交接说明：当前进度、待办、安装、数据库与测试索引](README_项目交接说明.md)
- [产品架构](PRODUCT_ARCHITECTURE.md)
- [详细开发记录](docs/PROJECT_RECORD_20260925.md)
- [数据库字典](docs/DATABASE_DICTIONARY_20260827.md)
- [数据库安装说明](docs/DATABASE_SETUP.md)

## 本地启动

准备兼容 Next.js 15 / Prisma 7 的 Node.js、npm 和 PostgreSQL，新建 `career_companion` 数据库，将 `.env.example` 复制为 `.env` 并配置本机连接。

```sh
npm ci
npx prisma migrate deploy
npm run db:generate
npm run db:seed
npm run dev
```

Seed 会重建固定演示账号及其关联数据，仅适用于初始化演示环境。访问 http://localhost:3000 。本仓库包含结构、迁移与虚构演示数据，不包含本机数据库备份及真实密码。
