# 🚀 WebAIDoc (梦笔公文)

> **基于 AI 的文档协作与尽调管理平台前端核心仓库**
>
> 本项目采用解耦的微模块架构，深度集成通义千问 AI 技术，提供自动化尽调资料采集、智能风险洞察、实时访谈匹配及报告在线编辑等核心能力。

---

## 🛠 技术栈与核心能力

- **核心框架**: [React](https://reactjs.org/) + [Elux](https://eluxjs.com/) (MVC 微模块化方案)
- **UI 体系**: Ant Design 5.x + 深度定制 CSS 变量样式
- **文本处理**: 定制化 WangEditor + `docx-preview`
- **智能驱动**: 深度集成 LLM 实现资料提炼 (`refreshSummary`) 与风险洞察 (`aiInsight`)
- **实时通信**: WebSocket 驱动文件解析进度与报告生成状态同步

## 📂 项目模块分布

项目采用 **Lerna** 管理的多包仓库结构，核心业务位于 `packages/doc`：

- **`stage`**: 全局控制台，处理 Iframe 握手 (`zov:PRODUCT_READY`) 与 SSO 登录。
- **`dueDiligence`**: 尽调业务核心。包含天眼查同步、AI 风险扫描、资料解析树以及访谈命中逻辑。
- **`doc`**: 模板中心与内容编辑核心。
- **`admin`**: 后台管理外壳，负责导航路由与布局分发。

## 🚦 快速开始

### 1. 环境准备
确保本地已安装 `Node.js` (>= 16) 和 `yarn`。

```bash
# 安装依赖
yarn install
```

### 2. 本地联调 (重要说明)
由于系统设计为通过 Iframe 嵌入主站工作台，本地独立运行无法接收 `PostMessage` 登录指令。
**操作规约：**
1. 访问对应环境的父级工作台 (如测试环境：`192.168.8.201:21003`)。
2. 从 Application -> LocalStorage 拷贝 `zov-user-token` 和 `zov-user-tenant` 到本地环境。
3. 刷新页面即可绕过握手流程进入系统。

### 3. 构建脚本
- `yarn build`: 全量模块构建。
- `yarn publish:test`: 打包测试环境发布包（输出至 `dist`）。
- `yarn publish:prod`: 打包生产环境发布包。

## 📘 核心文档

为了更深入了解项目架构与业务细节，请务必阅读以下文档：

- [👉 **HANDOVER.md (业务逻辑详细交接文档)**](HANDOVER.md): 包含详尽的项目难点、接口通信协议、AI 逻辑实现细节及避坑指南。
- `packages/doc/src/modules/`: 每个业务模块内部的 `entity.ts` 记录了核心数据结构。

## 🔐 安全与白名单
跨域通信受 `originWhiteList` 白名单限制。新增集成方需在 `src/index.ts` 中配置相应的 `method` 校验规则。

---
© 2026 梦笔公文 前端研发团队