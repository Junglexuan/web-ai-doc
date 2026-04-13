# Skill: 访谈问题清单 (Interview Question List)

## 1. 功能定义 (Function Definition)
在尽调详情页面的“访谈信息”下方，提供项目关联模板的访谈问题清单展示。支持 AI 洞察分析、问题清单切换及手动添加问题等交互功能。

## 2. UI 视觉规范 (Visual Specification)

### A. 容器结构 (Container Structure)
- **位置**: 位于 `packages/doc/src/modules/dueDiligence/views/Item/index.tsx` 中的“访谈信息”步骤块下方。
- **标题样式**: 继承 `.subject` 样式，支持收起/展开 (`isQuestionListCollapsed` 状态控制)。
- **内容块**: 使用 `.list` 样式，内含操作工具栏与问题列表容器。

### B. 工具栏 (Action Toolbar)
- **AI 洞察按钮**: 
  - 默认状态：`RocketOutlined` 图标，蓝色高亮风格。若不可用（缺少企业背景资料），则呈灰色禁用感。
  - 激活状态：当进入 AI 洞察模式后，该按钮变为“退出AI洞察”，红色或强色彩警示，辅助用户回到标准模式。
- **切换清单按钮**: 使用 `SwapOutlined` 图标，标准按钮样式。
- **手动添加按钮**: 使用 `PlusOutlined` 图标。未激活时为标准按钮样式；激活（输入框开启）时变为 `primary` 蓝色主按钮样式。

### C. AI 洞察视图 (AI Insight View)
- **Banner 提示**: 顶部采用蓝色渐变背景容器，告知用户当前处于 AI 补充建议模式。
- **选择逻辑**: 每个 AI 问题卡片支持勾选，底部记录已选数量。
- **导入交互**: 右上角提供“全部选择/取消全选”和“导入到当前清单”功能，导入后退出 AI 视图并刷新详情。

## 3. 逻辑与 API 规范 (Logic & API)

### A. 自动化抓取与同步 (Auto Scraping & Sync)
- **触发机制**: 新建尽调成功并跳转到详情页后，系统需自动评估是否需要同步企业数据。
- **判断条件**: 
  - `(creditCode 或 companyName 存在)` 且 `(supplementary 资料列表为空)`。
  - 进入页面 1000ms 后自动调用 `DueDiligenceAPI.syncEnterprise(dealId)`。
- **目的**: 确保用户一创建项目，AI 就能在后台开始消化企业全网公开数据。

### B. AI 洞察解析逻辑 (AI Insight Logic)
- **接口集成**: 调用 `/api/deal/aiInsight` (GET)，参数为 `dealId`。
- **四阶段渐进动画**: 点击“AI 洞察”时，显示加载进度，模拟后台多维度分析（整理资料 -> 识别风险 -> 生成问题 -> 最终合并）。
- **结果导入逻辑**: 
  - 用户勾选 AI 提出的问题。
  - 调用 `DueDiligenceAPI.updateQuestionList` 接口。
  - 将选中的 AI 问题（标记 `source: 'ai_insight'`）与原有的 `questionInfoList` 合并并提交。

### C. 访谈详情与切换 (Switching & List)
- **数据来源**: 核心数据从 `/deal/dealInstDetail` 接口返回。
- **切换清单**: 通过 `/templateInfo/getTemplateList` 获取预置清单模板，更新项目关联的 `questionId` 后刷新页面。

## 4. 维护说明 (Maintenance)
- 样式需严格遵循 `index.module.less` 中的步骤条设计语言。
- 问题清单的覆盖状态需根据录音解析结果实时更新。
- **关键**: 所有的 AI 交互需保证极致的响应感（Loading 状态与 Notification 的衔接）。
