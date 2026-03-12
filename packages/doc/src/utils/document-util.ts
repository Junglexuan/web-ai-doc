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

    // 默认尝试使用 100x100 的百分数系统 (Skill 推荐)
    // 但如果坐标点本身已经大于 100，则极有可能是原始像素坐标，此时需切换到真实的 PDF 尺寸系统
    const isPixelSystem = x1 > 100 || y1 > 100 || x2 > 100 || y2 > 100;

    let pageWidth = 100;
    let pageHeight = 100;

    if (isPixelSystem && pdfDocument && typeof pdfDocument.getPage === 'function') {
      try {
        const page = await pdfDocument.getPage(pageNumber);
        const viewport = page.getViewport({scale: 1.0});
        pageWidth = viewport.width;
        pageHeight = viewport.height;
        console.log(`[buildChunkHighlights] System detected: Pixel. Page ${pageNumber} size: ${pageWidth}x${pageHeight}`);
      } catch (err) {
        console.warn(`[buildChunkHighlights] getPage error`, err);
      }
    } else {
      console.log(`[buildChunkHighlights] System detected: Percentage (100x100).`);
    }

    console.log(`[buildChunkHighlights] Rect:`, {pageNumber, x1, y1, x2, y2, pageWidth, pageHeight});

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
        text: '',
      },
    });
  }

  return highlights;
};
