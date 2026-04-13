# Skill: 企业数据抓取 (Enterprise Data Scraping)

## 1. 功能定义 (Function Definition)
在尽调详情页面提供一键式全网企业数据深度抓取入口。包含页面入口引导行与二次确认交互弹窗。

## 2. UI 视觉规范 (Visual Specification)

### A. 详情页入口行 (Entry Row)
- **文件位置**: `packages/doc/src/modules/dueDiligence/views/Item/index.tsx`
- **样式类名**: `styles.scrapingRow` (定义于 `index.module.less`)
- **关键视觉参数**:
  - **背景与边框**: 背景色 `#f6faff`，边框 `1px dashed #cbdcfd`，圆角 `20px`。
  - **图标容器**: 56x56px, 背景 `#eff6ff`, 圆角 14px, 内部使用 BrainIcon (`ReviewIcon`)。
  - **标题组件**: 字号 18px, 粗体, 颜色 `#1e293b`。
  - **描述组件**: 字号 13px, 颜色 `#94a3b8`, 内容：“全网数据深度抓取，精准识别访谈重点”。
  - **交互按钮**: 宽边距蓝色主按钮，高度 40px，带 `ThunderboltOutlined` 图标。

### B. 二次确认弹窗 (Confirmation Modal)
- **调用逻辑**: `onStartScraping` 函数。
- **宽度与边距**: `width: 480` (匹配新建尽调规范)。
- **核心类名**:
  - Modal 实例类: `styles.scrapingModal`
  - 内容根容器: `styles.modalContent`
- **内容规范 (Internal DOM Strings)**:
  - `.icon-header`: 橙色时钟图标区域 (64x64px)。
  - `.title`: 居中加粗标题 (20px)。
  - `.info-box`: 浅色内容块 (`#f8fafc`), 包含具体的功能说明与 1-2 分钟耗时提醒。
- **按钮样式**: 
  - 确认按钮 (`styles.modalOkBtn`): 蓝色主色，高度 44px。
  - 取消按钮 (`styles.modalCancelBtn`): 浅灰背景。
  - **布局要求**: 纵向排列 (确认在上，取消在下)。

### C. 抓取中状态 (Loading State)
- **触发**: 弹窗点击“立即开始分析”后业务逻辑置 `scrapingStatus` 为 `'loading'`。
- **UI 变化**:
  - **标题**: 变更为“企业数据抓取中”。
  - **描述**: 变更为“正在调取全网检索接口，执行深度隐患筛查，此过程不影响您当前的操作”。
  - **图标**: 左侧图标容器增加蓝色旋转边框动画 (`loading-mask`)。
  - **容器变化**: 边框变为深蓝色实线，整体背景变淡。
  - **交互控制**: 隐藏右侧“开始抓取”按钮。

### D. 抓取完成与通知 (Completion & Notification)
- **容器变化**: `scrapingStatus` 置为 `'completed'`。图标变为实心蓝底，右侧显示“查看结果”与“刷新”双按钮。
- **完成通知 (Success Notification Bubble)**:
  - **交互形式**: 屏幕右下角悬浮气泡 (`notification.open`)。
  - **视觉特征**: 
    - 弹窗圆角 28px，背景色纯白，带超感知深度投影。
    - **Header**: 蓝色圆形闪电图标 (带外发光 shadow) + 加粗大标题 (20px, 850 weight)。
    - **Body**: 15px 字号，针对“异常特征”进行高亮标注。
    - **Footer**: 底部全宽度圆角大按钮 (48px 高度，28px 圆角)。
  - **关闭逻辑**: 右上角带浅灰色圆形背景的关闭图标。

## 3. 逻辑与 API 规范 (Logic & API)

### A. 消息反馈 (Feedback)
- 使用 `notification.open` 代替常规 Modal 以支持常驻观察。
- 按钮触发 `afterOpenChange` 或 `onClick` 事件进入详情分析页。

- **预期接口**: `DueDiligenceAPI.syncEnterprise(dealId: string): Promise<void>` (GET `/api/deal/tyc/sync`)
- **状态维护**: 接口调用后需进入轮询或长连接状态，监听抓取进度。
- **刷新机制**: 抓取完成后需触发 `refreshPage()` 以更新报告内容或状态。

### C. 自动抓取逻辑 (Automatic Sync Logic)
- **触发场景**: 当用户通过“新建尽调”入口成功创建项，并首次进入该项的“详情页面”时。
- **触发条件**: 
  1. 当前尽调项具备有效的企业信用代码 (`itemDetail.creditCode`)。
  2. 当前尽调项的补充信息 (`supplementary`) 为空，表示尚未进行过同步。
- **执行过程**:
  - 进入页面 1000ms 后自动调用 `syncEnterprise` 接口。
  - 同步过程中 UI 自动切换为 `loading` 状态。
  - 完成后弹出右下角完成通知气泡，并刷新页面。

## 4. 维护说明 (Maintenance)
后续 UI 调整或功能增强需严格遵守此 Skill 文件定义的尺寸与色彩规范。接口字段若有变更，请优先在此更新字段映射关系。
