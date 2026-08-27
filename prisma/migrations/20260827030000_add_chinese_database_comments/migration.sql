-- 为 DBeaver、pgAdmin 等数据库工具补充中文元数据说明。
-- 注释只影响数据库元数据，不改变表结构或现有数据。

DO $$
DECLARE
  item record;
BEGIN
  FOR item IN
    SELECT * FROM (VALUES
      ('User', '用户主表：保存账号、显示名称、语言时区、记忆开关及隐私同意信息'),
      ('CareerProfile', '职业档案：保存用户相对稳定的岗位、行业、团队和职业阶段信息'),
      ('CareerGoal', '职业目标：保存用户短期、中期和长期职业目标'),
      ('GrowthTheme', '成长主题：保存用户正在练习的长期主题、来源、状态与确认情况'),
      ('GrowthThemeLink', '成长主题证据关联：连接成长主题与事件、复盘、行动等证据实体'),
      ('Person', '职场人物：保存用户职场关系地图中的人物及基础信息'),
      ('Relationship', '人物关系：保存用户与职场人物之间的关系类型和影响程度'),
      ('PersonObservation', '人物观察：区分事实、观察、推测、用户感受及沟通偏好'),
      ('CommunicationStrategy', '沟通策略：保存面向特定人物和情境的候选或已验证策略'),
      ('Conversation', '陪伴会话：保存一次职场陪伴对话的模式、状态和摘要'),
      ('ConversationMessage', '陪伴消息：保存会话中的逐条用户、助手和系统消息'),
      ('WorkEvent', '工作事件：保存真实发生的职场事件、事实、感受和结果'),
      ('EventDynamics', '事件互动过程：保存事件的触发、压力、双方反应和结果模式'),
      ('WorkEventPerson', '事件人物关联：工作事件与参与人物的多对多关系'),
      ('ActionItem', '行动项：保存从对话、事件或复盘形成的下一步现实行动'),
      ('Reflection', '事件复盘：保存目标、经过、有效动作、改进点和下一次实验'),
      ('RoleplaySession', '模拟沟通会话：保存角色、场景、难度、目标和复盘结果'),
      ('RoleplayMessage', '模拟沟通消息：保存一次模拟中的逐条消息和反馈标签'),
      ('Memory', '长期记忆：保存可追溯、可确认、可纠正和可删除的用户记忆'),
      ('MemoryEvidence', '记忆证据：记录长期记忆来自哪条消息或业务实体'),
      ('MemoryLink', '记忆实体关联：连接记忆与人物、事件、主题等业务实体'),
      ('UserInsight', '用户洞察：保存基于多项证据形成的优势、压力源或变化洞察'),
      ('InsightEvidence', '洞察证据：记录支持某项用户洞察的来源和说明'),
      ('UserPattern', '重复模式：保存触发、典型反应、结果、反例与确认状态'),
      ('SelfModelEntry', '自我模型条目：描述用户的优势、价值、需要、压力源和工作偏好'),
      ('WorldModelEntry', '职场世界模型条目：描述公司、团队、项目、人物、约束和风险'),
      ('InteractionModel', '互动模型：描述用户面对某人物或环境时的典型反应与有效策略'),
      ('InteractionEvidence', '互动模型证据：记录支持互动模型或行为变化的真实来源'),
      ('GrowthReport', '成长报告：保存周报、月报、季度回顾的版本和总结快照'),
      ('GrowthReportTheme', '成长报告主题快照：冻结报告生成时的过去模式、近期变化和策略'),
      ('GrowthReportEvidence', '成长报告证据快照：冻结报告生成时采用的真实事件证据')
    ) AS t(table_name, description)
  LOOP
    EXECUTE format('COMMENT ON TABLE %I IS %L', item.table_name, item.description);
  END LOOP;
END $$;

DO $$
DECLARE
  col record;
  description text;
BEGIN
  FOR col IN
    SELECT table_name, column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name IN (
        'User','CareerProfile','CareerGoal','GrowthTheme','GrowthThemeLink','Person','Relationship',
        'PersonObservation','CommunicationStrategy','Conversation','ConversationMessage','WorkEvent',
        'EventDynamics','WorkEventPerson','ActionItem','Reflection','RoleplaySession','RoleplayMessage',
        'Memory','MemoryEvidence','MemoryLink','UserInsight','InsightEvidence','UserPattern','SelfModelEntry',
        'WorldModelEntry','InteractionModel','InteractionEvidence','GrowthReport','GrowthReportTheme',
        'GrowthReportEvidence'
      )
  LOOP
    description := CASE col.column_name
      WHEN 'id' THEN '主键：该记录的 UUID 唯一标识'
      WHEN 'userId' THEN '所属用户 ID，用于用户数据隔离'
      WHEN 'email' THEN '用户登录邮箱；可为空，全局唯一'
      WHEN 'displayName' THEN '页面显示名称或人物别名'
      WHEN 'locale' THEN '语言和本地化设置，默认 zh-CN'
      WHEN 'timezone' THEN '用户时区，默认 Asia/Shanghai'
      WHEN 'memoryEnabled' THEN '是否允许系统新增长期记忆'
      WHEN 'consentVersion' THEN '用户已同意的隐私或数据协议版本'
      WHEN 'currentRole' THEN '用户当前岗位或角色'
      WHEN 'industry' THEN '用户当前行业或业务领域'
      WHEN 'companyType' THEN '所在公司或组织类型'
      WHEN 'companyAlias' THEN '公司别名，用于减少真实公司名称暴露'
      WHEN 'city' THEN '用户当前工作城市'
      WHEN 'yearsExperience' THEN '用户累计工作年限'
      WHEN 'salaryRangeEncrypted' THEN '加密保存的薪资范围，不应存储明文'
      WHEN 'teamName' THEN '用户所在团队名称或别名'
      WHEN 'teamSize' THEN '用户所在团队人数'
      WHEN 'managerTitle' THEN '用户直属领导的职位名称'
      WHEN 'careerStage' THEN '用户当前职业发展阶段'
      WHEN 'profileCompleteness' THEN '职业档案完整度，仅表示资料完整程度，不是能力评分'
      WHEN 'horizon' THEN '职业目标时间跨度，例如短期、中期或长期'
      WHEN 'title' THEN '该业务记录的标题或名称'
      WHEN 'description' THEN '该业务记录的详细说明'
      WHEN 'targetDate' THEN '目标计划达成日期'
      WHEN 'status' THEN '当前业务状态，具体取值见对应枚举或业务约定'
      WHEN 'source' THEN '成长主题的形成来源'
      WHEN 'originSummary' THEN '成长主题为什么形成的来源说明'
      WHEN 'confirmationStatus' THEN '用户确认状态：待证据、待确认、已确认、已纠正或已拒绝等'
      WHEN 'firstSeenAt' THEN '该主题或洞察第一次出现的时间'
      WHEN 'lastSeenAt' THEN '最近一次被讨论或证据支持的时间'
      WHEN 'growthThemeId' THEN '关联的成长主题 ID'
      WHEN 'entityType' THEN '被关联业务实体的类型'
      WHEN 'entityId' THEN '被关联业务实体的 UUID'
      WHEN 'relationType' THEN '两个业务实体之间的关联类型'
      WHEN 'evidenceWeight' THEN '该条证据对结论的参考权重'
      WHEN 'roleTitle' THEN '职场人物的职位或角色名称'
      WHEN 'groupType' THEN '职场人物分组，例如领导、项目、开发、客户或 HR'
      WHEN 'organizationAlias' THEN '职场人物所属组织的别名'
      WHEN 'notes' THEN '用户主动补充的备注信息'
      WHEN 'sensitivityLevel' THEN '该人物信息的敏感等级'
      WHEN 'personId' THEN '关联的职场人物 ID'
      WHEN 'relationshipType' THEN '用户与人物之间的关系类型'
      WHEN 'closeness' THEN '用户与人物的关系接近程度，用于辅助展示和检索'
      WHEN 'influenceLevel' THEN '该人物对用户工作的影响程度'
      WHEN 'communicationSummary' THEN '用户与该人物当前沟通关系概况'
      WHEN 'kind' THEN '信息证据类型：事实、观察、推测、用户感受、沟通偏好或有效策略'
      WHEN 'content' THEN '消息正文或该条信息的具体内容'
      WHEN 'sourceType' THEN '信息或证据的来源实体类型'
      WHEN 'sourceId' THEN '信息或证据的来源实体 ID'
      WHEN 'evidenceCount' THEN '支持当前结论的证据数量'
      WHEN 'counterEvidenceCount' THEN '与当前结论相反的证据数量'
      WHEN 'counterexampleCount' THEN '重复模式的反例数量'
      WHEN 'validFrom' THEN '该版本或结论开始有效的时间'
      WHEN 'validTo' THEN '该版本或结论结束有效的时间'
      WHEN 'context' THEN '沟通策略适用的具体情境'
      WHEN 'strategy' THEN '推荐、候选或已验证的具体沟通策略'
      WHEN 'effectiveness' THEN '策略当前效果估计，不是用户能力评分'
      WHEN 'mode' THEN '陪伴对话模式，例如倾听、教练、建议、模拟或复盘'
      WHEN 'summary' THEN '该会话或业务记录的摘要'
      WHEN 'startedAt' THEN '会话开始时间'
      WHEN 'endedAt' THEN '会话结束时间'
      WHEN 'conversationId' THEN '所属陪伴会话 ID'
      WHEN 'role' THEN '消息发送角色：用户、助手或系统'
      WHEN 'model' THEN '生成该消息所使用的 AI 模型名称'
      WHEN 'promptVersion' THEN '生成该消息所使用的 Prompt 版本'
      WHEN 'tokenUsage' THEN '该次模型生成的 Token 用量 JSON'
      WHEN 'safetyLevel' THEN '该条消息或回合的安全风险级别'
      WHEN 'sequenceNo' THEN '消息在所属会话中的顺序号'
      WHEN 'occurredAt' THEN '事件或证据在现实中发生的时间'
      WHEN 'eventType' THEN '工作事件类型，例如被催进度、需求变更或跨部门协作'
      WHEN 'facts' THEN '用户确认的客观事实经过，不包含系统推测'
      WHEN 'userInterpretation' THEN '用户对事件的主观理解，与事实分开保存'
      WHEN 'emotion' THEN '用户在事件中的情绪描述'
      WHEN 'concern' THEN '用户在事件中真正担心或在意的内容'
      WHEN 'outcome' THEN '真实工作事件的实际结果'
      WHEN 'importance' THEN '记录的重要程度，用于检索和排序'
      WHEN 'workEventId' THEN '关联的真实工作事件 ID'
      WHEN 'triggerType' THEN '事件或互动的触发类型'
      WHEN 'perceivedPressure' THEN '用户在事件中感受到的压力'
      WHEN 'userNeed' THEN '用户在事件当时的核心需要'
      WHEN 'userResponse' THEN '用户在事件中的实际反应或表达'
      WHEN 'otherResponse' THEN '对方在事件中的实际反应'
      WHEN 'outcomeCode' THEN '便于聚合分析的结构化结果标签'
      WHEN 'roleInEvent' THEN '该人物在工作事件中的角色'
      WHEN 'dueAt' THEN '行动项计划完成时间'
      WHEN 'resultNote' THEN '行动执行后的结果说明'
      WHEN 'goalSelf' THEN '用户在事件或沟通中的目标'
      WHEN 'goalOther' THEN '对方在事件或沟通中可能关注的目标'
      WHEN 'whatHappened' THEN '复盘中记录的实际发生经过'
      WHEN 'workedWell' THEN '复盘中识别出的具体有效做法'
      WHEN 'improvements' THEN '复盘中识别出的具体改进点'
      WHEN 'nextExperiment' THEN '下一次准备尝试的具体行为实验'
      WHEN 'roleTemplate' THEN '模拟沟通采用的对方角色模板'
      WHEN 'scenario' THEN '模拟沟通的真实职场场景'
      WHEN 'personaStyle' THEN '模拟角色的沟通风格'
      WHEN 'difficulty' THEN '模拟沟通难度'
      WHEN 'userGoal' THEN '用户本次模拟希望达成的具体目标'
      WHEN 'reviewJson' THEN '模拟结束后的结构化复盘内容 JSON'
      WHEN 'sessionId' THEN '所属模拟沟通会话 ID'
      WHEN 'feedbackTags' THEN '针对该条模拟表达的结构化反馈标签 JSON'
      WHEN 'type' THEN '该记录的业务分类'
      WHEN 'canonicalText' THEN '长期记忆当前规范化后的文字表述'
      WHEN 'structuredData' THEN '长期记忆可供程序使用的结构化 JSON 内容'
      WHEN 'certainty' THEN '信息确定性，例如事实、观察或推测'
      WHEN 'confidence' THEN '系统对当前结论的置信度，不代表用户能力分数'
      WHEN 'sensitivity' THEN '长期记忆的敏感等级'
      WHEN 'version' THEN '当前记录的版本号'
      WHEN 'memoryId' THEN '关联的长期记忆 ID'
      WHEN 'messageId' THEN '作为证据来源的陪伴消息 ID'
      WHEN 'excerptHash' THEN '来源片段摘要值，用于去重和审计，避免保存额外敏感全文'
      WHEN 'insightId' THEN '关联的用户洞察 ID'
      WHEN 'evidenceNote' THEN '该来源为什么支持当前洞察的说明'
      WHEN 'weight' THEN '该条洞察证据的参考权重'
      WHEN 'triggerSignature' THEN '重复模式或互动模型的典型触发条件 JSON'
      WHEN 'responseSignature' THEN '用户典型反应的结构化 JSON'
      WHEN 'outcomeSignature' THEN '典型结果的结构化 JSON'
      WHEN 'eventCount' THEN '支持该重复模式的真实事件数量'
      WHEN 'category' THEN '自我模型类别，例如优势、价值、需要、压力源或工作偏好'
      WHEN 'statement' THEN 'Self Model 或 World Model 当前版本的文字表述'
      WHEN 'environmentType' THEN '互动发生的环境或场景类型'
      WHEN 'typicalInternalResponse' THEN '用户在该互动情境中的典型心理反应'
      WHEN 'typicalBehavior' THEN '用户在该互动情境中的典型实际行为'
      WHEN 'typicalOutcome' THEN '该互动模式通常导致的结果'
      WHEN 'effectiveStrategy' THEN '已有证据支持的有效应对或沟通策略'
      WHEN 'interactionModelId' THEN '关联的互动模型 ID'
      WHEN 'observedChange' THEN '该证据显示出的具体行为变化'
      WHEN 'periodType' THEN '成长报告周期类型：周、月或季度'
      WHEN 'periodStart' THEN '成长报告统计周期开始时间'
      WHEN 'periodEnd' THEN '成长报告统计周期结束时间'
      WHEN 'summarySnapshot' THEN '报告生成或确认时冻结的总结快照'
      WHEN 'nextFocusSnapshot' THEN '报告生成或确认时冻结的下一阶段重点'
      WHEN 'generatedAt' THEN '成长报告生成时间'
      WHEN 'confirmedAt' THEN '用户确认成长报告的时间'
      WHEN 'reportId' THEN '所属成长报告 ID'
      WHEN 'themeTitleSnapshot' THEN '报告生成时冻结的成长主题标题'
      WHEN 'themeStatusSnapshot' THEN '报告生成时冻结的成长主题状态'
      WHEN 'pastPatternSnapshot' THEN '报告生成时冻结的过去反应方式'
      WHEN 'recentPatternSnapshot' THEN '报告生成时冻结的近期反应方式'
      WHEN 'effectiveStrategySnapshot' THEN '报告生成时冻结的有效策略'
      WHEN 'nextExperimentSnapshot' THEN '报告生成时冻结的下一步实验'
      WHEN 'reportThemeId' THEN '关联的成长报告主题快照 ID'
      WHEN 'evidenceSnapshot' THEN '报告生成时冻结的证据文字，后续不随原记录变化'
      WHEN 'createdAt' THEN '记录创建时间'
      WHEN 'updatedAt' THEN '记录最近更新时间'
      WHEN 'deletedAt' THEN '软删除时间；为空表示未删除'
      ELSE format('业务字段 %s，详细定义见数据库数据字典', col.column_name)
    END;

    EXECUTE format('COMMENT ON COLUMN %I.%I IS %L', col.table_name, col.column_name, description);
  END LOOP;
END $$;
