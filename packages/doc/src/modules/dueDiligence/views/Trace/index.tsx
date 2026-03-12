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
    <div style={{width: '100%', height: '100%', background: '#fff', display: 'flex', position: 'relative'}}>
      {/* 左侧目录 */}
      <div
        style={{
          width: collapsed ? 0 : 300,
          borderRight: collapsed ? 'none' : '1px solid #f0f0f0',
          height: '100%',
          overflow: collapsed ? 'hidden' : 'auto',
          padding: collapsed ? 0 : '16px',
          background: '#fafafa',
          transition: 'all 0.3s ease-in-out',
          position: 'relative',
        }}
      >
        {!collapsed && (
          <>
            <div
              style={{
                fontWeight: 'bold',
                marginBottom: 20,
                fontSize: 16,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                color: '#333',
              }}
            >
              <span>溯源目录 ({dataList.length})</span>
              <LeftOutlined
                style={{cursor: 'pointer', fontSize: 14, color: '#999', padding: '4px', borderRadius: '4px', background: '#eee'}}
                onClick={() => setCollapsed(true)}
              />
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
              {dataList.map((item, index) => (
                <div
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  style={{
                    padding: '12px',
                    borderRadius: 8,
                    cursor: 'pointer',
                    background: activeIndex === index ? '#e6f7ff' : '#fff',
                    border: `1px solid ${activeIndex === index ? '#91d5ff' : '#d9d9d9'}`,
                    transition: 'all 0.2s',
                    boxShadow: activeIndex === index ? '0 2px 8px rgba(24,144,255,0.15)' : 'none',
                  }}
                >
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: activeIndex === index ? 600 : 400,
                      color: activeIndex === index ? '#1890ff' : '#333',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={item.matchValue || item.fileName || `结果 ${index + 1}`}
                  >
                    {item.matchValue || item.fileName || `结果 ${index + 1}`}
                  </div>
                  <div style={{fontSize: 12, color: '#999', marginTop: 6, display: 'flex', justifyContent: 'space-between'}}>
                    <span>
                      页码:{' '}
                      {(() => {
                        try {
                          const p = typeof item.positions === 'string' ? JSON.parse(item.positions) : item.positions;
                          return Array.isArray(p) ? p[0]?.page || 1 : 1;
                        } catch (e) {
                          return 1;
                        }
                      })()}
                    </span>
                    {activeIndex === index && <span style={{color: '#52c41a', fontSize: 12}}>当前查看</span>}
                  </div>
                </div>
              ))}
            </div>
          </>
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
