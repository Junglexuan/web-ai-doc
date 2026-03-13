import {LeftOutlined, RightOutlined} from '@ant-design/icons';
import {Button, Card, Skeleton, message} from 'antd';
import {FC, useEffect, useMemo, useState} from 'react';
import PdfLocater from '@/skill/pdf-highlighter/components/PdfLocater';
import {IReferenceChunk} from '@/utils/document-util';
import {DueDiligenceAPI} from '../../api';

const Trace: FC = () => {
  const [loading, setLoading] = useState(false);
  const [dataList, setDataList] = useState<any[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [docUrl, setDocUrl] = useState<string>('');
  const [collapsed, setCollapsed] = useState(false);

  const currentData = useMemo(() => dataList[activeIndex], [dataList, activeIndex]);

  useEffect(() => {
    setLoading(true);
    DueDiligenceAPI.getTraceInfo()
      .then((res) => {
        console.log('Trace API response:', res);
        if (res && res.data) {
          const list = Array.isArray(res.data) ? res.data : [res.data];
          setDataList(list);
          if (list.length === 0) {
            message.warning('返回数据为空');
          }
        } else {
          message.warning('返回数据为空');
        }
      })
      .catch((err) => {
        console.error(err);
        message.error('请求溯源数据失败');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!currentData) return;

    const fileId = currentData.fileId || currentData.knowledgeFileId;
    const initialUrl = currentData.fileUrl || currentData.url || currentData.docUrl;

    if (!initialUrl && fileId) {
      setDocUrl(''); // 重置 URL，显示加载状态
      DueDiligenceAPI.viewReportUrl(fileId, '').then((urlRes) => {
        if (urlRes.success && urlRes.data) {
          setDocUrl(urlRes.data);
        }
      });
    } else if (initialUrl) {
      let url = initialUrl;
      if (url && (url.includes(' ') || /[\u4e00-\u9fa5]/.test(url))) {
        const lastSlashIndex = url.lastIndexOf('/');
        const baseUrl = url.substring(0, lastSlashIndex + 1);
        const fileName = url.substring(lastSlashIndex + 1);
        url = baseUrl + encodeURIComponent(fileName);
      }
      setDocUrl(url);
    } else {
      setDocUrl('');
    }
  }, [currentData]);

  const chunk = useMemo<IReferenceChunk | undefined>(() => {
    if (!currentData || !currentData.positions) return undefined;

    let positions: number[][] = [];
    try {
      const posData = typeof currentData.positions === 'string' ? JSON.parse(currentData.positions) : currentData.positions;
      if (Array.isArray(posData)) {
        positions = posData.map((p: any) => {
          const x = p.x || p.x1 || 0;
          const y = p.y || p.y1 || 0;
          const w = p.width || 10;
          const h = p.height || 10;
          const page = p.page || p.pageNumber || 1;
          return [page, x, x + w, y, y + h];
        });
      }
    } catch (e) {
      console.error('Parse positions error:', e);
    }

    return {
      id: String(currentData.id || currentData.chunkId || 'trace-chunk'),
      document_id: String(currentData.fileId || currentData.knowledgeFileId || ''),
      content: currentData.fileName || currentData.matchValue || '',
      positions,
    };
  }, [currentData]);

  return (
    <div style={{width: '100%', height: '100%', background: '#f8fafc', padding: '24px 32px', display: 'flex', flexDirection: 'column'}}>
      <div
        style={{
          flex: 1,
          position: 'relative',
          background: '#fff',
          borderRadius: 12,
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        }}
      >
        {!loading && !docUrl ? (
          <div style={{paddingTop: 100, textAlign: 'center', color: '#64748b'}}>
            <Skeleton active paragraph={{rows: 4}} style={{maxWidth: 400, margin: '0 auto'}} />
            <div style={{marginTop: 24}}>正在加载溯源文档...</div>
          </div>
        ) : (
          <PdfLocater apiLoading={loading} url={docUrl} title={currentData?.fileName || currentData?.matchValue || '文档预览'} chunk={chunk} />
        )}
      </div>

      {/* 右侧预览区 */}
      <div style={{flex: 1, position: 'relative', height: '100%', minWidth: 0, display: 'flex', flexDirection: 'column'}}>
        {collapsed && (
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 10,
              zIndex: 100,
              background: '#fff',
              border: '1px solid #d9d9d9',
              borderLeft: 'none',
              borderRadius: '0 4px 4px 0',
              padding: '8px 4px',
              cursor: 'pointer',
              boxShadow: '2px 2px 8px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onClick={() => setCollapsed(false)}
            title="展开目录"
          >
            <RightOutlined style={{fontSize: 14, color: '#1890ff'}} />
          </div>
        )}

        <div style={{flex: 1, position: 'relative'}}>
          {!loading && !docUrl ? (
            <div style={{paddingTop: 100, textAlign: 'center', color: '#999', width: '100%'}}>
              {dataList.length > 0 ? '正在加载文档预览...' : '暂无文档数据以供预览。'}
            </div>
          ) : (
            <PdfLocater
              apiLoading={loading || (!docUrl && !!currentData)}
              url={docUrl}
              title={currentData?.fileName || currentData?.matchValue || '文档预览'}
              chunk={chunk}
              headerStyle={collapsed ? {padding: '0 46px'} : undefined}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Trace;
