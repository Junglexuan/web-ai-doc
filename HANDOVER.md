# 🚀 WebAIDoc 前端业务逻辑详细交接文档

> **文档状态**：核心架构与业务链路梳理 (v1.0)
> **最后修订**：2026-04-20
> **项目背景**：本系统是一个基于 AI 的文档协作与尽调管理平台，支持文档编辑、模板管理、合规审查及尽调溯源等功能。

---

## 1. 项目架构与技术栈

### 1.1 核心技术选型

- **框架**: React + [Elux](https://eluxjs.com/) (基于 Model-View-Controller 的微模块框架)。
- **状态管理**: Elux 内建状态管理（类似 Redux 但更模块化）。
- **组件库**: Ant Design (Antd)。
- **编辑器**: WangEditor (定制化扩展，支持 AI 填充与变量绑定)。
- **工程化**: Lerna 项目管理，Vite/Rollup 构建。

### 1.2 目录结构 (以核心包 `packages/doc` 为例)

```text
/packages/doc
├── src
│   ├── modules/          # 业务模块 (内含 Model, View, API, Entity)
│   │   ├── admin/        # 管理后台外壳 (含 Header, Menu, 路由分发)
│   │   ├── stage/        # 全局舞台模块 (登录、初始化、用户信息转换)
│   │   ├── home/         # 首页轮播图、最近创作、热门模板
│   │   ├── doc/          # 文档编辑与模板中心核心逻辑
│   │   ├── dueDiligence/ # 尽调管理 (含详情页 Item, 溯源 Trace, 分享 Share)
│   │   └── contractReview/# 合同审查模块
│   ├── Project.ts        # 模块聚合配置
│   ├── Global.ts         # 全局变量与接口定义 (window.GLOBAL_CONFIG)
│   └── index.ts          # 应用入口 (处理子应用嵌入与 PostMessage 通信)
```

---

## 2. 核心业务流程与代码逻辑

### 2.1 应用启动与跨域集成 (Iframe 模式)

本系统广泛作为子应用嵌入在其他 Portal 环境中：

1.  **READY 握手**：`src/index.ts` 中，子应用启动后通过 `postMessage({method: 'zov:PRODUCT_READY'})` 通知父窗口。
    - **安全校验规则**：为防止非法站点恶意嵌入并获取用户信息，系统由于 `originWhiteList` 定义了一套自定义消息共享源链白名单。
    ```typescript
    const originWhiteList = ['http://113.44.121.105', 'http://192.168.1.126:5173', 'https://astra.binarysee.com', 'http://192.168.8.201:21003'];
    ```
    - **逻辑理由**：所有接收到的跨域消息必须匹配此白名单且 `method` 以 `zov:` 开头，否则将被视为非法消息源并拒绝处理后续的 `USER_INFO_DELIVERY` 逻辑。
2.  **用户信息交付**：父窗口回传 `zov:USER_INFO_DELIVERY`，前端将其中的 `token` 和 `userInfo` 存入 `localStorage`，随后调用 `renderApp()`。
3.  **租户切换拦截**：在 `request.ts` 拦截器中，若收到 `402` 错误，说明租户上下文变更，前端会通过 PostMessage 通知主应用执行 `TENANT_CHANGED` 逻辑。
4.  **本地开发调试 (Local Dev Tips)**：
    - **背景原因**：由于本地调试环境（如 `localhost`）并未集成生产环境的跨端、跨域名单点登录（SSO）系统，且无法通过 Iframe 接收到主应用的 PostMessage 用户信息推送。
    - **操作规约**：需先访问对应环境的父级工作台（如 `192.168.8.201:21003`），打开浏览器控制台，从 Application -> LocalStorage 中手动拷贝 `zov-user-token`、`zov-user-tenant` 和 `zov-user-info` (JSON 格式) 到本地项目环境（如 `localhost:20101`）的 LocalStorage 中，刷新页面即可完成手工登录。

### 2.2 尽调溯源与分享逻辑 (Due Diligence Trace)

- **免登录策略**：在 `stage/model.ts` 中，`TRACE_PAGE_PREFIX` 和 `SHARE_PAGE_PREFIX` 路由被识别为免登录。若在此路径下，系统会分配一个 `guest` 身份。
- **渲染链路**：`admin/views/Main` 根据当前路由判断，若是溯源页则越过后台外壳，直接渲染 `dueDiligence/views/Trace` 或 `ShareLink`。

### 2.3 尽调业务流程与核心逻辑 (Core Business Flow)

本系统的核心价值在于通过 AI 自动化处理尽调的全流程（从资料搜集到报告生成）。

1.  **尽调创建与初始化**：

    - **创建入口**：在首页通过 `createItem` 接口创建。
    - **联动属性**：创建时选定的“业务角色”会决定默认的“文档模板”和“访谈问题清单”。
    - **天眼查同步**：一旦填写了 `companyName`（企业名称），系统会在 `Sync` 时自动调用 `syncEnterprise`。后端会异步抓取工商、股东、对外投资、司法风险等深度数据，并将其存储为 `basicInfo` JSON。

2.  **AI 洞察 (AI Insight)**：

    - **逻辑触发**：当企业数据同步任务完成后，系统会自动发起 `aiInsight` 请求。
    - **洞察范围**：AI 会基于企业的抓取资料（及已上传的资料）进行风险扫描，自动总结生成针对性的“补充访谈问题”。
    - **采纳逻辑**：用户在“AI 洞察”面板勾选采纳后，调 `acceptAiInsight` 将这些问题合并入当前的访谈清单。

3.  **资料管理与解析**：

    - **分层存储**：支持物理文件夹（`ResourceNode`）管理。上传通过 `uploadFolder` 处理，支持拖拽大文件。
    - **异步解析 (Parsing)**：文件上传后进入后端解析队列。前端通过 WebSocket 订阅 `DEAL_FILE_PROGRESS` 消息，实时更新解析进度（1: 待解析, 2: 解析中, 3: 解析成功, 4: 解析失败）。
    - **资料提炼**：用户可点击“提炼总结”(`refreshSummary`)，让 AI 快速扫描所有已上传文档并生成摘要预览。

4.  **访谈与问题清单匹配**：

    - **清单维护**：访谈问题清单支持从公共库“切换”或“手动新增”。
    - **实时匹配 (Hitting)**：在移动端/PC 端访谈录制过程中（或上传录音后），后端解析音轨内容并与清单中的关键字匹配。一旦命中，该问题在前端的状态会由 `uncovered` 变为 `covered`。

5.  **报告生成与在线编辑**：
    - **异步构建**：点击“生成报告”触发 `rebuildReport`（异步任务）。前端通过轮询或 WebSocket 监听 `reportStatus` 状态。
    - **预览与编辑**：生成成功后，点击“编辑报告”会通过 `editReportUrl` 接口获取专用加密链接，跳转至第三方在线编辑器进行文档精修。

---

## 3. 模块化开发模式 (Elux 范式)

每个模块遵循以下结构：

- **`model.ts`**: 业务 logic 核心。
  - `onMount`: 路由进入时的初始化逻辑（如获取数据）。
  - `@effect`: 异步副作用处理（API 调用、跨模块派发）。
  - `@reducer`: 同步状态修改。
- **`views/`**: React 组件实现，通过 `connectStore` 连接 Model 状态。
- **`entity.ts`**: 常量、枚举与 TypeScript 类型定义。
- **`api.ts`**: 该模块专属的后端请求封装。

---

## 4. 关键避坑与开发指南

### 4.1 环境变量与配置中心

- 本系统严禁在 `env` 文件中硬编码 `BASE_URL`。
- 所有全局静态地址（UserCenter, Editor, SitesUrl）均定义在 `window` 下，由 `public/config.js`（或部署环境注入）初始化，并在 `Global.ts` 中统一导出。

### 4.2 请求权限 (Headers)

- 请求头中会自动携带 `Authorization` (Bearer 格式) 和 `Tenant`。
- 若需要静默请求（不弹出全局 Loading 或错误提示），在 Axios 配置中传入 `headers: { quiet: 1 }`。

### 4.3 文档预览与预览

- 系统集成了 `docx-preview` 以支持前端纯 JS 转换 Word 为 PDF（见 `request.ts` 的 `downloadPdfFromWord`）。
- 编辑器与预览通常通过 `openDoc` 工具函数分发至 `SitesUrl.editor` 对应的外部服务处理。

---

## 5. 常见指令与脚本

- `yarn build`: 本地全量模块构建。
- `yarn publish:test`: 测试环境全量模块构建。
- `yarn publish:prod`: 生产环境全量模块构建。

## 6. 测试及生产服务地址

- 测试地址
  - 可参考 packages/doc/env/test/client/config.js
    - '/auth/': 'http://192.168.8.201:21000/',
    - '/api/': '/report/',
    - '/ws/': 'ws://192.168.8.201:20101/report/ws/',
- 生产地址
  - 可参考 packages/doc/env/sit/client/config.js
    - '/auth/': 'http://user.binarysee.com/auth/',
    - '/api/': '/report/',
    - '/ws/': 'wss://xiaoli.binarysee.com/report/ws/',

## 7. 部署上环境

    - 测试环境：
        - cd /home/report/nginx/html/
        - rm -rf xiaoli-desktop.zip
        - rm -rf __MACOSX
        - rm -rf xiaoli-desktop
        - unzip xiaoli-desktop.zip

    - 生产环境：
        - 打包给项目负责人
