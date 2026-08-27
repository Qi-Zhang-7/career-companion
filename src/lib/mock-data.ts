// Phase 1 mock boundary: replace these exports with repository/API calls in Phase 2.
export const profile = {
  name: "林然", role: "数据分析师", industry: "政府数字化 / ToG", experience: "4 年", stage: "专业骨干 → 项目负责人",
  company: "数字科技公司", team: "政务数据产品组", city: "杭州",
};

export const people = [
  { id: "zhang", name: "张经理", role: "项目经理", group: "项目", initials: "张", relation: "当前项目负责人", color: "#d8a076", x: 70, y: 18, fact: "负责政务数据治理项目交付与验收。", observation: "三次项目同步中都先确认交付节点和客户反馈。", inference: "可能更容易接受结论先行、时间明确的汇报方式。", feeling: "被连续追问进度时，我会紧张，担心显得不可靠。", preferences: ["结论先行", "明确时间节点", "风险提前同步"], events: ["8 月 21 日 · 追问数据清洗进度", "8 月 15 日 · 临时增加汇报材料"], strategy: "先说结论和节点，再说明依赖；不要从背景讲起。" },
  { id: "leader", name: "周总", role: "部门领导", group: "领导", initials: "周", relation: "部门负责人", color: "#7fa18e", x: 51, y: 4, fact: "负责数据产品线和团队资源分配。", observation: "季度汇报时持续追问业务价值。", inference: "可能更关注成果影响，而非过程细节。", feeling: "和她沟通时，我想证明自己足够专业。", preferences: ["业务价值", "关键选择", "需要的支持"], events: ["8 月 12 日 · 季度项目复盘"], strategy: "把技术工作翻译成业务影响，并提出明确决策请求。" },
  { id: "wang", name: "老王", role: "后端工程师", group: "开发", initials: "王", relation: "核心协作同事", color: "#728ba0", x: 78, y: 57, fact: "负责指标接口与数据服务。", observation: "需求字段明确时回复和交付更快。", inference: "对模糊任务可能倾向于等待进一步说明。", feeling: "接口延期时我会觉得自己被卡住。", preferences: ["字段清单", "验收标准", "接口示例"], events: ["8 月 20 日 · 指标接口延期", "8 月 9 日 · 确认字段口径"], strategy: "把依赖拆成最小清单，并确认双方时间点。" },
  { id: "xiaoli", name: "小李", role: "前端工程师", group: "同事", initials: "李", relation: "同项目协作", color: "#c28d9f", x: 24, y: 58, fact: "负责可视化大屏和管理端页面。", observation: "拿到字段和交互说明后会主动同步问题。", inference: "书面确认可能比口头交代更有效。", feeling: "和她协作比较轻松。", preferences: ["交互截图", "字段定义", "书面确认"], events: ["8 月 18 日 · 大屏字段联调"], strategy: "会后用清单确认范围，减少返工。" },
  { id: "client", name: "陈处", role: "政府客户", group: "客户", initials: "陈", relation: "项目验收方", color: "#b7965a", x: 16, y: 25, fact: "负责项目业务验收。", observation: "会议中常从最终展示效果提出临时调整。", inference: "直观结果和可展示性可能比技术过程更重要。", feeling: "临时改需求时，我会担心项目彻底失控。", preferences: ["效果预览", "通俗表达", "可落地节点"], events: ["8 月 19 日 · 新增区县对比维度"], strategy: "先确认业务目的，再给影响评估与选项。" },
  { id: "hr", name: "何敏", role: "HRBP", group: "HR", initials: "何", relation: "业务线 HR", color: "#879a9a", x: 37, y: 77, fact: "负责人才盘点和晋升流程。", observation: "沟通发展时会询问具体项目证据。", inference: "案例材料可能比笼统意愿更有说服力。", feeling: "谈职业发展时，我还不太确定如何表达诉求。", preferences: ["具体案例", "发展意愿", "下一步计划"], events: ["7 月 28 日 · 半年人才盘点"], strategy: "用项目证据说明影响力，再谈希望承担的职责。" },
];

export const growthThemes = [
  { title: "建立责任边界", status: "正在练习", why: "别人提出紧急需求时，你常常先接下来，再评估自己的容量。", evidence: 4, next: "下次先问：这件事和当前 P0 任务，哪个优先？" },
  { title: "把依赖说清楚", status: "已有变化", why: "最近两次进度沟通，你开始主动说明数据与接口依赖。", evidence: 3, next: "把依赖、责任人和时间点写进同一条同步消息。" },
  { title: "探索下一步职业方向", status: "刚刚浮现", why: "你开始关注自己是否适合从分析走向项目负责人。", evidence: 2, next: "记录一周中让你有能量和消耗最大的工作。" },
];

export const reflectionResult = {
  good: ["你先说明了已经完成的分析部分，对方能知道事情并非没有推进。", "你给出了数据到达后的明确时间节点，让风险变得可判断。"],
  improve: "你在解释依赖时有一点急着证明‘不是我的问题’，容易让对方听成甩锅。可以更早把焦点放回共同目标。",
  alternatives: ["专业版：分析逻辑已经完成，目前唯一依赖是接口数据。我今天 15:00 再确认一次，拿到后周五下班前给你初版。", "强边界版：当前有两个选择：周五交付不完整版本，或数据到齐后顺延一天交付完整版本。你希望优先哪个？"],
  next: "练习在 30 秒内说清：现状、依赖、下一步、时间节点。",
};
