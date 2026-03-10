export interface IReferenceChunk {
  id: string;
  document_id: string;
  content: string;
  image_id?: string;
  positions: number[][]; // [[page, x1, x2, y1, y2], ...]
  doc_type?: string;
}

/**
 * 将后端返回的 chunk.positions 转换为 react-pdf-highlighter 所需的 Highlight 格式
 * 并在需要时利用 PDF 文档真实的宽高进行坐标系校准
 */
export const buildChunkHighlights = async (chunk: IReferenceChunk | undefined, pdfDocument: any): Promise<any[]> => {
  const highlights: any[] = [];

  if (!chunk || !chunk.positions || !Array.isArray(chunk.positions) || chunk.positions.length === 0) {
    return highlights;
  }

  for (let i = 0; i < chunk.positions.length; i++) {
    const pos = chunk.positions[i];
    // 预期格式: [pageNumber, x1, x2, y1, y2]
    const pageNumber = pos[0];
    const x1 = pos[1];
    const x2 = pos[2];
    const y1 = pos[3];
    const y2 = pos[4];

    let pageWidth = 100;
    let pageHeight = 100;

    // 尝试获取实际页面的宽高达成校准
    if (pdfDocument && typeof pdfDocument.getPage === 'function') {
      try {
        const page = await pdfDocument.getPage(pageNumber);
        // 通过 scale: 1 获取原始逻辑尺寸
        const viewport = page.getViewport({scale: 1.0});
        pageWidth = viewport.width;
        pageHeight = viewport.height;
      } catch (err) {
        console.warn(`[buildChunkHighlights] getPage error for page ${pageNumber}`, err);
      }
    }

    highlights.push({
      id: `${chunk.id || 'chunk'}-${i}`,
      position: {
        boundingRect: {
          x1,
          y1,
          x2,
          y2,
          width: pageWidth,
          height: pageHeight,
        },
        rects: [
          {
            x1,
            y1,
            x2,
            y2,
            width: pageWidth,
            height: pageHeight,
          },
        ],
        pageNumber,
      },
      comment: {
        text: '引用来源片段',
        emoji: '📍',
      },
    });
  }

  return highlights;
};
