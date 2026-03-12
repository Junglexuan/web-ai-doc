import {Skeleton} from 'antd';
import * as pdfjs from 'pdfjs-dist';
import React, {useEffect, useMemo, useRef, useState} from 'react';
// @ts-ignore
// eslint-disable-next-line import/no-extraneous-dependencies
import {Highlight, PdfHighlighter, PdfLoader} from 'react-pdf-highlighter';
import {IReferenceChunk, buildChunkHighlights} from '../../../utils/document-util';
import styles from './PdfLocater.module.less';

// @ts-ignore
if (pdfjs.GlobalWorkerOptions) {
  // @ts-ignore
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js`;
}

/**
 * URL 参数解析工具
 * 支持格式: ?fileId=xxx&page=1&x1=10&y1=20&width=30&height=5
 */
const getQueryParams = (
  search: string
): {
  fileId: string;
  page: number;
  x1: number;
  y1: number;
  width: number;
  height: number;
} => {
  const queryString = search.includes('?') ? search.split('?')[1] : '';
  const params = new URLSearchParams(queryString);
  const getNum = (key: string, def: string): number => parseFloat(params.get(key) || def);
  return {
    fileId: params.get('fileId') || '',
    page: Math.max(1, parseInt(params.get('page') || '1', 10)),
    x1: getNum('x1', '0'),
    y1: getNum('y1', '0'),
    width: getNum('width', '0'),
    height: getNum('height', '0'),
  };
};

interface IProps {
  url?: string; // 如果已知则传入，否则通过 URL 参数解析
  title?: string;
  chunk?: IReferenceChunk; // 从组件上游传入的 Chunk 对象用于定位高亮
  apiLoading?: boolean; // 新增：来自上游 API 的加载状态
  headerStyle?: React.CSSProperties; // 新增：自定义头部样式
}

/**
 * 内置的 Pdf 渲染和定位层
 * 负责接收 PdfDocument 实例与 chunk 数据并异步计算高亮区域
 */
const PdfViewerRenderer = ({pdfDocument, chunk, fallbackHighlights}: {pdfDocument: any; chunk?: IReferenceChunk; fallbackHighlights: any[]}) => {
  const [highlights, setHighlights] = useState<any[]>([]);
  const scrollRef = useRef<(highlight: any) => void>(() => {
    /* ignore initialization */
  });
  const [loaded, setLoaded] = useState(false);

  // 初始化构造高亮区域
  useEffect(() => {
    let isMounted = true;
    if (chunk) {
      // 依赖 document-util.ts 转换 chunk -> IHighlight 格式
      buildChunkHighlights(chunk, pdfDocument).then((res) => {
        if (isMounted) {
          setHighlights(res);
        }
      });
    } else if (fallbackHighlights.length > 0) {
      setHighlights(fallbackHighlights);
    }
    return () => {
      isMounted = false;
    };
  }, [chunk, pdfDocument, fallbackHighlights]);

  // 获取 PdfHighlighter 提供的 scrollTo 函数
  const handleScrollToHighlight = (scrollTo: (h: any) => void) => {
    scrollRef.current = scrollTo;
    setLoaded(true);
  };

  // 启动自动滚动逻辑
  useEffect(() => {
    if (highlights.length > 0 && loaded) {
      console.log('Attempting to scroll to first highlight:', highlights[0]);
      const timer = setTimeout(() => {
        if (typeof scrollRef.current === 'function') {
          try {
            scrollRef.current(highlights[0]);
            console.log('Scroll executed');
          } catch (e) {
            console.error('Scroll to highlight failed:', e);
          }
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [highlights, loaded]);

  return (
    // @ts-ignore
    <PdfHighlighter
      pdfDocument={pdfDocument}
      enableAreaSelection={(event: any) => event.altKey}
      onScrollChange={() => {
        /* ignore */
      }}
      onSelectionFinished={() => null}
      scrollRef={handleScrollToHighlight}
      highlights={highlights}
      highlightTransform={(
        highlight: any,
        index: number,
        setTip: any,
        hideTip: any,
        viewportToScaled: any,
        screenshot: any,
        isScrolledTo: boolean
      ) => <Highlight key={index} isScrolledTo={isScrolledTo} position={highlight.position} comment={highlight.comment} />}
    />
  );
};

/**
 * 带有“跳转定位”功能的 PDF 预览页面组件
 * 根据需求文档分析重构，支持解析 chunk.positions 并结合实际 PDF 尺寸定位
 */
const PdfLocater: React.FC<IProps> = ({url: propUrl, title = '文档预览', chunk, apiLoading, headerStyle}) => {
  const params = useMemo(() => getQueryParams(window.location.hash || window.location.search), []);
  const pdfUrl = propUrl || (params.fileId ? `/api/pdf/fetch?id=${params.fileId}` : '');

  const fallbackHighlights = useMemo(() => {
    // ... (same as before)
    if (params.fileId && params.page && !chunk) {
      return [
        {
          id: 'locator-target',
          position: {
            boundingRect: {
              x1: params.x1,
              y1: params.y1,
              x2: params.x1 + params.width,
              y2: params.x1 + params.height,
              width: 100,
              height: 100,
            },
            rects: [
              {
                x1: params.x1,
                y1: params.y1,
                x2: params.x1 + params.width,
                y2: params.y1 + params.height,
                width: 100,
                height: 100,
              },
            ],
            pageNumber: params.page,
          },
          comment: {text: ''},
        },
      ];
    }
    return [];
  }, [params, chunk]);

  const showLoader = apiLoading || !pdfUrl;

  return (
    <div className={styles.pdfPreviewerContainer}>
      {/* 顶部状态栏 始终显示，避免点击退出中断 */}
      <header className="header" style={headerStyle}>
        <span className="title">{title}</span>
      </header>

      {/* PDF 内容区 */}
      <main className="viewerWrapper">
        {showLoader ? (
          <div style={{display: 'flex', justifyContent: 'center', background: '#f5f5f5', width: '100%', height: '100%'}}>
            <Skeleton active paragraph={{rows: 25}} style={{padding: '40px', background: '#fff', width: '800px', marginTop: '20px'}} />
          </div>
        ) : (
          <PdfLoader
            url={pdfUrl}
            beforeLoad={
              <div style={{display: 'flex', justifyContent: 'center', background: '#f5f5f5', width: '100%', height: '100%'}}>
                <Skeleton active paragraph={{rows: 25}} style={{padding: '40px', background: '#fff', width: '800px', marginTop: '20px'}} />
              </div>
            }
            errorMessage={<div style={{padding: '20px'}}>无法加载文档，请检查链接或文件状态。 URL: {pdfUrl}</div>}
          >
            {(pdfDocument: any) => <PdfViewerRenderer pdfDocument={pdfDocument} chunk={chunk} fallbackHighlights={fallbackHighlights} />}
          </PdfLoader>
        )}
      </main>
    </div>
  );
};

export default PdfLocater;
