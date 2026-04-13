import {LeftOutlined, RightOutlined} from '@ant-design/icons';
import {Button, Skeleton, message} from 'antd';
import {FC, useCallback, useEffect, useMemo, useState} from 'react';
import {SiteInfo, useRouter} from '@/Global';
import PdfLocater from '@/skills/pdf-highlighter/components/PdfLocater';
import {IReferenceChunk} from '@/utils/document-util';
import {useEvent, useThrottleEvent} from '@/utils/tools';
import {DueDiligenceAPI} from '../../api';
import styles from './index.module.less';

/** 从 URL 解析 query（兼容 hash 路由 #/path?k=v 与 search ?k=v） */
function getTraceQuery(): Record<string, string> {
  const hash = window.location.hash || '';
  const search = window.location.search || '';
  const queryString = hash.includes('?') ? hash.split('?')[1] || '' : search.replace(/^\?/, '');
  const params = new URLSearchParams(queryString);
  const out: Record<string, string> = {};
  params.forEach((v, k) => {
    out[k] = v;
  });
  return out;
}

const Trace: FC = () => {
  const [loading, setLoading] = useState(false);
  const [dataList, setDataList] = useState<any[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [docUrl, setDocUrl] = useState<string>('');
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const onSelectItem = useThrottleEvent((index: number) => {
    setActiveIndex(index);
  }, 300);

  const onToggleCollapse = useThrottleEvent((val: boolean) => {
    setCollapsed(val);
  }, 300);
  const currentData = useMemo(() => dataList[activeIndex], [dataList, activeIndex]);

  useEffect(() => {
    setLoading(true);
    // 参数优先从 URL 取：reportId、fieldId；matchKey 优先 URL，无则用 fieldId 对应
    const query = router?.location?.searchQuery ? {...router.location.searchQuery} : getTraceQuery();
    const reportId = query.reportId || '2032031389993414657';
    const fieldId = query.fieldId || '';
    const matchKey = query.matchKey || fieldId || 'company';
    const apiParams: Record<string, string> = {
      reportId,
      matchKey,
    };
    if (fieldId) apiParams.fieldId = fieldId;

    DueDiligenceAPI.getTraceInfo(apiParams)
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
  }, [router.location.searchQuery]);

  useEffect(() => {
    if (!currentData) return;

    const fileId = currentData.fileId || currentData.knowledgeFileId;
    const initialUrl = currentData.fileUrl || currentData.url || currentData.docUrl;

    if (!initialUrl && fileId) {
      setDocUrl('');
      DueDiligenceAPI.viewReportUrl(fileId, '')
        .then((urlRes) => {
          if (urlRes.success && urlRes.data) {
            setDocUrl(urlRes.data);
          } else {
            message.error(urlRes.message || '获取文档预览地址失败');
            setDocUrl('ERROR'); // 设置一个标记值以停止加载状态
          }
        })
        .catch(() => {
          message.error('获取文档预览地址失败');
          setDocUrl('ERROR');
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
    <div className={styles.traceContainer}>
      {/* 左侧目录 */}
      <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`} style={{width: 320}}>
        <div className="summary-hd">
          <div className={styles.header}>
            <span className={styles.title}>溯源目录</span>
          </div>
        </div>

        <div className={styles.listWrapper}>
          {loading ? (
            <Skeleton active paragraph={{rows: 8}} />
          ) : (
            dataList.map((item, index) => (
              <div key={index} className={`${styles.traceItem} ${activeIndex === index ? styles.active : ''}`} onClick={() => onSelectItem(index)}>
                <div className={styles.itemTitle}>{item.fileName || item.matchValue || `溯源结果 ${index + 1}`}</div>
                <div className={styles.itemDesc}>{item.fileId ? `文件ID: ${item.fileId}` : '在线文档'}</div>
              </div>
            ))
          )}
        </div>

        <div className={styles.footer}>
          <Button icon={<LeftOutlined />} type="text" onClick={() => onToggleCollapse(true)}>
            收起目录
          </Button>
        </div>
      </aside>

      {/* 展开触发器 (当侧边栏收起时显示) */}
      {collapsed && (
        <div className={styles.collapseTrigger} onClick={() => onToggleCollapse(false)}>
          <RightOutlined />
        </div>
      )}

      {/* 右侧主预览区 */}
      <main className={styles.mainContent}>
        {!loading && !docUrl && !!currentData ? (
          <div style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc'}}>
            <div style={{textAlign: 'center', color: '#64748b'}}>
              <Skeleton active paragraph={{rows: 15}} style={{width: 800, background: '#fff', padding: 40}} />
              <div style={{marginTop: 20}}>正在获取文档加载地址...</div>
            </div>
          </div>
        ) : (
          <PdfLocater
            apiLoading={loading || (!docUrl && !!currentData)}
            url={docUrl}
            title={currentData?.fileName || currentData?.matchValue || '文档预览'}
            chunk={chunk}
            headerStyle={collapsed ? {paddingLeft: 46} : undefined}
            backUrl={SiteInfo.traceBackUrl}
            backLabel="返回小狸报告"
          />
        )}
      </main>
    </div>
  );
};

export default Trace;
