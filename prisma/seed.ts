import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import {
  ConfirmationStatus,
  EvidenceKind,
  GrowthThemeSource,
  GrowthThemeStatus,
  ReportPeriod,
  ReportStatus,
} from "../src/generated/prisma/enums";

const connectionString = process.env.DATABASE_URL;

if (!connectionString || connectionString.includes("YOUR_PASSWORD")) {
  throw new Error("Set the real local DATABASE_URL in .env before running the seed.");
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
const demoEmail = "demo@career-companion.local";

async function main() {
  const previousDemo = await prisma.user.findUnique({ where: { email: demoEmail } });
  if (previousDemo) await prisma.user.delete({ where: { id: previousDemo.id } });

  const user = await prisma.user.create({
    data: {
      email: demoEmail,
      displayName: "林然",
      memoryEnabled: true,
      careerProfile: {
        create: {
          currentRole: "数据分析师",
          industry: "政府数字化 / ToG",
          companyType: "数字科技公司",
          companyAlias: "某数字科技公司",
          city: "杭州",
          yearsExperience: 4,
          teamName: "政务数据产品组",
          managerTitle: "部门负责人",
          careerStage: "专业骨干 → 项目负责人",
          profileCompleteness: 72,
        },
      },
      careerGoals: {
        create: [
          { horizon: "SHORT", title: "独立完成一次跨部门需求澄清和复盘", status: "ACTIVE" },
          { horizon: "LONG", title: "探索分析专家与项目负责人两条路径", status: "UNCLEAR" },
        ],
      },
    },
  });

  const zhang = await prisma.person.create({
    data: {
      userId: user.id,
      displayName: "张经理",
      roleTitle: "项目经理",
      groupType: "项目",
      organizationAlias: "当前政务数据治理项目",
      relationships: { create: { userId: user.id, relationshipType: "PROJECT_LEAD", influenceLevel: 4 } },
      observations: {
        create: [
          {
            kind: EvidenceKind.FACT,
            content: "负责当前政务数据治理项目的交付与验收协调。",
            sourceType: "USER_PROFILE",
            confidence: 1,
            confirmationStatus: ConfirmationStatus.USER_CONFIRMED,
          },
          {
            kind: EvidenceKind.OBSERVATION,
            content: "三次项目同步中都先确认交付节点和客户反馈。",
            sourceType: "WORK_EVENTS",
            confidence: 0.86,
            evidenceCount: 3,
            confirmationStatus: ConfirmationStatus.USER_CONFIRMED,
          },
          {
            kind: EvidenceKind.INFERENCE,
            content: "可能更容易接受结论先行、时间明确的汇报方式。",
            sourceType: "PATTERN_CANDIDATE",
            confidence: 0.66,
            evidenceCount: 3,
            confirmationStatus: ConfirmationStatus.PENDING_CONFIRMATION,
          },
          {
            kind: EvidenceKind.USER_FEELING,
            content: "被连续追问进度时，我会紧张，担心显得不可靠。",
            sourceType: "CONVERSATION",
            confidence: 1,
            confirmationStatus: ConfirmationStatus.USER_CONFIRMED,
          },
        ],
      },
      communicationStrategies: {
        create: {
          context: "项目进度被催或存在外部依赖时",
          strategy: "先说结论和节点，再说明依赖，并主动约定下次同步时间。",
          evidenceCount: 2,
          effectiveness: 0.78,
          status: "EMERGING_EFFECTIVE",
        },
      },
    },
  });

  const backend = await prisma.person.create({
    data: {
      userId: user.id,
      displayName: "老王",
      roleTitle: "后端工程师",
      groupType: "开发",
      relationships: { create: { userId: user.id, relationshipType: "CORE_COLLABORATOR", influenceLevel: 3 } },
      observations: {
        create: [
          {
            kind: EvidenceKind.FACT,
            content: "负责指标接口与数据服务。",
            sourceType: "USER_PROFILE",
            confidence: 1,
            confirmationStatus: ConfirmationStatus.USER_CONFIRMED,
          },
          {
            kind: EvidenceKind.OBSERVATION,
            content: "需求字段明确时，回复和交付通常更快。",
            sourceType: "WORK_EVENTS",
            confidence: 0.72,
            evidenceCount: 2,
            confirmationStatus: ConfirmationStatus.PENDING_CONFIRMATION,
          },
        ],
      },
    },
  });

  const client = await prisma.person.create({
    data: {
      userId: user.id,
      displayName: "陈处",
      roleTitle: "政府客户",
      groupType: "客户",
      relationships: { create: { userId: user.id, relationshipType: "CLIENT_APPROVER", influenceLevel: 5 } },
    },
  });

  const eventJune = await prisma.workEvent.create({
    data: {
      userId: user.id,
      title: "领导临时增加汇报材料",
      occurredAt: new Date("2026-06-11T16:00:00+08:00"),
      eventType: "URGENT_TASK",
      facts: "下班前收到第二天汇报需要新增分析材料的要求。",
      userInterpretation: "觉得既然交给自己，就必须当天全部完成。",
      emotion: "焦虑",
      concern: "担心提出时间冲突会被认为不够负责。",
      outcome: "直接答应并加班到晚上十一点完成。",
      importance: 4,
      people: { create: { personId: zhang.id, roleInEvent: "TASK_ASSIGNER" } },
      dynamics: {
        create: {
          triggerType: "EXTERNAL_URGENT_REQUEST",
          perceivedPressure: "HIGH",
          userNeed: "被认可",
          userResponse: "没有询问优先级，直接承诺当天完成。",
          otherResponse: "对方接受承诺。",
          outcomeCode: "OVERCOMMITTED",
        },
      },
    },
  });

  const eventJuly = await prisma.workEvent.create({
    data: {
      userId: user.id,
      title: "项目周报与临时数据核查冲突",
      occurredAt: new Date("2026-07-16T11:00:00+08:00"),
      eventType: "PRIORITY_CONFLICT",
      facts: "张经理要求当天补充数据核查，同时原定项目周报也需要完成。",
      userInterpretation: "两件事都重要，但不知道能否提出取舍。",
      emotion: "紧张",
      concern: "担心拒绝其中一项会影响信任。",
      outcome: "第一次说明两项任务冲突，但最后仍同时承诺。",
      importance: 4,
      people: { create: { personId: zhang.id, roleInEvent: "PROJECT_LEAD" } },
      dynamics: {
        create: {
          triggerType: "PRIORITY_CONFLICT",
          perceivedPressure: "HIGH",
          userNeed: "明确取舍",
          userResponse: "说明了任务冲突，但没有邀请对方决定优先级。",
          otherResponse: "对方知道存在冲突，但仍按两个节点等待结果。",
          outcomeCode: "CONFLICT_STATED_NOT_RESOLVED",
        },
      },
    },
  });

  const event1 = await prisma.workEvent.create({
    data: {
      userId: user.id,
      title: "客户临时增加区县对比维度",
      occurredAt: new Date("2026-08-19T10:00:00+08:00"),
      eventType: "REQUIREMENT_CHANGE",
      facts: "陈处在验收准备会上提出新增区县对比维度，原计划未包含该需求。",
      userInterpretation: "如果现在接受，原定交付范围会受影响。",
      emotion: "焦虑",
      concern: "担心拒绝客户，也担心项目范围失控。",
      outcome: "先确认业务目的，再将范围影响同步给项目经理决定。",
      importance: 4,
      people: { create: [{ personId: client.id, roleInEvent: "REQUESTER" }, { personId: zhang.id, roleInEvent: "DECISION_MAKER" }] },
      dynamics: {
        create: {
          triggerType: "EXTERNAL_URGENT_REQUEST",
          perceivedPressure: "HIGH",
          userNeed: "边界与可控感",
          userResponse: "先确认业务目的，并说明对原计划的影响。",
          otherResponse: "项目经理接受先评估影响再决定范围。",
          outcomeCode: "PRIORITY_CLARIFIED",
        },
      },
    },
  });

  const event2 = await prisma.workEvent.create({
    data: {
      userId: user.id,
      title: "张经理追问周五交付节点",
      occurredAt: new Date("2026-08-21T14:00:00+08:00"),
      eventType: "DEADLINE_PRESSURE",
      facts: "分析逻辑已经完成，但后端接口数据尚未提供；张经理询问周五能否交付。",
      userInterpretation: "担心对方认为项目没有推进。",
      emotion: "紧张",
      concern: "担心显得不可靠，因此容易快速承诺。",
      outcome: "说明了接口依赖，并给出下午再次确认和主动同步的节点。",
      importance: 5,
      people: { create: [{ personId: zhang.id, roleInEvent: "PROJECT_LEAD" }, { personId: backend.id, roleInEvent: "DEPENDENCY_OWNER" }] },
      dynamics: {
        create: {
          triggerType: "DEADLINE_PRESSURE",
          perceivedPressure: "HIGH",
          userNeed: "被信任与可控感",
          userResponse: "说明已完成部分、关键依赖和下一次同步时间。",
          otherResponse: "张经理停止追问背景，要求按约定时间同步风险。",
          outcomeCode: "DEPENDENCY_CLARIFIED",
        },
      },
      reflections: {
        create: {
          userId: user.id,
          goalSelf: "争取合理时间，同时维持对方对项目可控性的信心。",
          goalOther: "确认周五节点能否守住，是否需要提前同步客户。",
          whatHappened: "先解释了接口依赖，随后补充已完成部分和下一次同步节点。",
          workedWell: "说明了分析逻辑已经完成，并给出明确同步时间。",
          improvements: "避免急着证明不是自己的责任，把焦点放回共同目标。",
          nextExperiment: "在 30 秒内说清现状、依赖、下一步和节点。",
        },
      },
    },
  });

  const boundaryTheme = await prisma.growthTheme.create({
    data: {
      userId: user.id,
      title: "建立责任边界",
      description: "面对紧急需求时，先判断优先级和自身容量，再决定承诺。",
      status: GrowthThemeStatus.ACTIVE,
      source: GrowthThemeSource.CO_CREATED,
      originSummary: "多个不同人物带来的紧急需求中，出现了先承担、后评估容量的相似模式。",
      confidence: 0.78,
      confirmationStatus: ConfirmationStatus.USER_CONFIRMED,
      links: {
        create: [
          { entityType: "WORK_EVENT", entityId: eventJune.id, relationType: "ORIGIN_EVIDENCE", evidenceWeight: 0.8 },
          { entityType: "WORK_EVENT", entityId: eventJuly.id, relationType: "EARLY_CHANGE_EVIDENCE", evidenceWeight: 0.8 },
          { entityType: "WORK_EVENT", entityId: event1.id, relationType: "EVIDENCE", evidenceWeight: 0.8 },
          { entityType: "WORK_EVENT", entityId: event2.id, relationType: "EVIDENCE", evidenceWeight: 0.9 },
        ],
      },
    },
  });

  await prisma.growthTheme.create({
    data: {
      userId: user.id,
      title: "把依赖说清楚",
      description: "在项目沟通中同时说明依赖、责任人、下一步和时间点。",
      status: GrowthThemeStatus.IMPROVING,
      source: GrowthThemeSource.REFLECTION_DERIVED,
      originSummary: "最近两次进度沟通开始主动说明数据与接口依赖。",
      confidence: 0.72,
      confirmationStatus: ConfirmationStatus.USER_CONFIRMED,
      links: { create: { entityType: "WORK_EVENT", entityId: event2.id, relationType: "CHANGE_EVIDENCE", evidenceWeight: 0.9 } },
    },
  });

  await prisma.interactionModel.create({
    data: {
      userId: user.id,
      personId: zhang.id,
      environmentType: "DEADLINE_CONVERSATION",
      triggerSignature: { trigger: "被追问明确交付时间", pressure: "high" },
      typicalInternalResponse: "担心显得不可靠，容易急着解释或承诺。",
      typicalBehavior: "过去解释背景较多；最近开始先说明结论、依赖和节点。",
      typicalOutcome: "结论和节点明确时，对方追问减少。",
      effectiveStrategy: "结论先行 + 关键依赖 + 下一次同步时间。",
      confidence: 0.74,
      status: "USER_CONFIRMED",
      evidence: {
        create: { sourceType: "WORK_EVENT", sourceId: event2.id, observedChange: "从解释背景转向先给结论和节点。", evidenceWeight: 0.9, occurredAt: event2.occurredAt },
      },
    },
  });

  await prisma.growthReport.create({
    data: {
      userId: user.id,
      periodType: ReportPeriod.MONTHLY,
      periodStart: new Date("2026-06-01T00:00:00+08:00"),
      periodEnd: new Date("2026-06-30T23:59:59+08:00"),
      status: ReportStatus.CONFIRMED,
      summarySnapshot: "本月在突发任务出现时，主要反应仍是直接承担。这个记录描述当时的状态，不代表固定性格。",
      nextFocusSnapshot: "下一次先说出当前任务和新增任务之间的时间冲突。",
      confirmedAt: new Date("2026-07-02T10:00:00+08:00"),
      themes: {
        create: {
          growthThemeId: boundaryTheme.id,
          themeTitleSnapshot: "建立责任边界",
          themeStatusSnapshot: "EMERGING",
          pastPatternSnapshot: "收到紧急任务 → 担心不够负责 → 直接答应 → 加班完成",
          recentPatternSnapshot: "仍以直接承担为主，尚未出现稳定的新做法",
          nextExperimentSnapshot: "先说明当前任务，再询问新增任务的优先级。",
        },
      },
      evidence: {
        create: { sourceType: "WORK_EVENT", sourceId: eventJune.id, evidenceSnapshot: "临时增加汇报材料时直接承诺，当晚加班完成。", occurredAt: eventJune.occurredAt },
      },
    },
  });

  await prisma.growthReport.create({
    data: {
      userId: user.id,
      periodType: ReportPeriod.MONTHLY,
      periodStart: new Date("2026-07-01T00:00:00+08:00"),
      periodEnd: new Date("2026-07-31T23:59:59+08:00"),
      status: ReportStatus.CONFIRMED,
      summarySnapshot: "本月第一次在任务冲突时主动说出容量问题，但还没有把取舍交还给任务负责人。",
      nextFocusSnapshot: "不仅说明冲突，还要明确询问由谁决定优先级。",
      confirmedAt: new Date("2026-08-02T10:00:00+08:00"),
      themes: {
        create: {
          growthThemeId: boundaryTheme.id,
          themeTitleSnapshot: "建立责任边界",
          themeStatusSnapshot: "ACTIVE",
          pastPatternSnapshot: "任务冲突 → 自己消化 → 同时承诺",
          recentPatternSnapshot: "任务冲突 → 说出冲突 → 但仍同时承诺",
          effectiveStrategySnapshot: "把当前容量和任务冲突明确说出来。",
          nextExperimentSnapshot: "请项目经理明确两个任务的优先顺序。",
        },
      },
      evidence: {
        create: { sourceType: "WORK_EVENT", sourceId: eventJuly.id, evidenceSnapshot: "第一次向张经理说明两项任务存在时间冲突。", occurredAt: eventJuly.occurredAt },
      },
    },
  });

  await prisma.growthReport.create({
    data: {
      userId: user.id,
      periodType: ReportPeriod.MONTHLY,
      periodStart: new Date("2026-08-01T00:00:00+08:00"),
      periodEnd: new Date("2026-08-31T23:59:59+08:00"),
      status: ReportStatus.DRAFT,
      summarySnapshot: "本月开始在紧急需求出现时增加优先级和依赖澄清。证据仍在积累，尚不能视为稳定习惯。",
      nextFocusSnapshot: "下次新增任务出现时，先询问它与当前 P0 任务的优先级。",
      themes: {
        create: {
          growthThemeId: boundaryTheme.id,
          themeTitleSnapshot: "建立责任边界",
          themeStatusSnapshot: "ACTIVE",
          pastPatternSnapshot: "被催 → 焦虑 → 马上答应 → 加班",
          recentPatternSnapshot: "被催 → 澄清优先级 → 说明依赖 → 给时间节点",
          effectiveStrategySnapshot: "结论先行 + 说明依赖 + 给出同步节点",
          nextExperimentSnapshot: "先确认新增任务与当前 P0 任务的优先级。",
        },
      },
      evidence: {
        create: [
          { sourceType: "WORK_EVENT", sourceId: event1.id, evidenceSnapshot: "客户新增需求时先确认业务目的，并说明范围影响。", occurredAt: event1.occurredAt },
          { sourceType: "WORK_EVENT", sourceId: event2.id, evidenceSnapshot: "被催进度时说明了接口依赖，并给出主动同步节点。", occurredAt: event2.occurredAt },
        ],
      },
    },
  });

  console.log(`Seeded demo user ${user.displayName} (${user.id}) with a three-month growth history and report snapshots.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
