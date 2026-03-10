# PDF 跳转定位 (PDF Link Localization)

## 技能描述

实现通过特定格式的超链接，在浏览器新页签中打开目标 PDF 文件，并根据链接参数自动定位、滚动并高亮显示文档中的特定区域（如某个段落、关键词等）。

## 方案实施路径

### 1. 链接协议格式 (Link Protocol)

链接需携带定位参数，示例如下：
`https://your-domain.com#/pdf-locator?fileId={file_id}&page={page_number}&x1={x1}&y1={y1}&width={width}&height={height}`

**参数说明：**

- `fileId`: PDF 文件在后端存储的唯一标识或访问地址。
- `page`: 目标页码（1-indexed）。
- `x1, y1`: 定位区域左上角的百分比坐标（0-100）。
- `width, height`: 定位区域的百分比宽度和高度（0-100）。

### 2. 坐标采集与同步

推荐使用百分比坐标系统（Scaled Coordinates）。如果后端（如 OCR 或 RAG）返回的是原始像素坐标，需根据 PDF 页面的实际尺寸（Page Size）转换为 0-100 的百分比：
`percentage = (pixel / pageSize) * 100`

### 3. 核心预览组件 (PdfLocater)

基于 `react-pdf-highlighter` 实现的页面流程：

1. **URL 解析**: 使用 `URLSearchParams` 从 `window.location` 中提取 `page`, `x1`, `y1` 等定位参数。
2. **构造 Highlight 对象**: 将提取的参数封装为插件所需的 `IHighlight` 格式。
3. **自动滚动定位**: 在 `PdfHighlighter` 加载完成后，通过 `scrollRef` 提供的 `scrollTo` 方法程序化触发滚动。

## 示例应用代码

查看 [PdfLocater.tsx](./components/PdfLocater.tsx) 获取组件模板实现。

## 注意事项

- **坐标精度**: 确保转换百分比时保留足够的小数位数（建议 2-4 位），以保证定位精准。
- **加载状态**: PDF 文件较大时加载较慢，组件已内置 `Skeleton` 骨架屏提升用户体验，并在 `Promise` 完成后再执行定位滚动。
- **跨域设置**: 如果 PDF 文件存储在不同域名下，需确保 OSS 或后端服务器正确配置了 CORS。
