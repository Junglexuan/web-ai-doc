import {Card, Skeleton, message} from 'antd';
import {FC, useEffect, useMemo, useState} from 'react';
import PdfLocater from '@/skill/pdf-highlighter/components/PdfLocater';
import {IReferenceChunk} from '@/utils/document-util';
import {DueDiligenceAPI} from '../../api';

const Trace: FC = () => {
  const [loading, setLoading] = useState(false);
  const [docUrl, setDocUrl] = useState<string>('');
  const [params, setParams] = useState<any>(null);

  useEffect(() => {
    setLoading(true);
    DueDiligenceAPI.getTraceInfo()
      .then((res) => {
        console.log('Trace API response:', res);

        // res.data contains the list or object
        if (res && res.data) {
          let data = res.data;
          // If response is a list, take the first item
          if (Array.isArray(data)) {
            data = data[0] || {};
          }

          if (!data.id && !data.knowledgeId) {
            message.warning('返回数据为空');
            return;
          }

          const fileId = data.fileId || data.knowledgeFileId;
          const initialUrl = data.fileUrl || data.url || data.docUrl;

          if (!initialUrl && fileId) {
            DueDiligenceAPI.viewReportUrl(fileId, '').then((urlRes) => {
              if (urlRes.success && urlRes.data) {
                setDocUrl(urlRes.data);
              }
            });
          } else if (initialUrl) {
            let url = initialUrl;
            // Encode URL if it contains special characters
            if (url && (url.includes(' ') || /[\u4e00-\u9fa5]/.test(url))) {
              const lastSlashIndex = url.lastIndexOf('/');
              const baseUrl = url.substring(0, lastSlashIndex + 1);
              const fileName = url.substring(lastSlashIndex + 1);
              url = baseUrl + encodeURIComponent(fileName);
            }
            setDocUrl(url);
          }
          setParams({...data, fileId});
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

  const chunk = useMemo<IReferenceChunk | undefined>(() => {
    if (!params || !params.positions) {
      console.log('No positions found in params');
      return undefined;
    }

    let positions: number[][] = [];
    try {
      const posData = typeof params.positions === 'string' ? JSON.parse(params.positions) : params.positions;
      console.log('Parsed posData:', posData);
      if (Array.isArray(posData)) {
        positions = posData.map((p: any) => {
          const x = p.x || p.x1 || 0;
          const y = p.y || p.y1 || 0;
          // Ensure non-zero width/height to avoid property definition errors
          const w = p.width || 10;
          const h = p.height || 10;
          const page = p.page || p.pageNumber || 1;
          return [page, x, x + w, y, y + h];
        });
      }
    } catch (e) {
      console.error('Parse positions error:', e);
    }

    console.log('Final chunk positions:', positions);

    return {
      id: String(params.id || params.chunkId || 'trace-chunk'),
      document_id: String(params.fileId || ''),
      content: params.fileName || params.matchValue || '',
      positions,
    };
  }, [params]);

  return (
    <div style={{width: '100%', height: '100%', background: '#fff', display: 'flex', flexDirection: 'column'}}>
      <div style={{flex: 1, position: 'relative'}}>
        {!loading && !docUrl ? (
          <div style={{paddingTop: 20, textAlign: 'center'}}>暂无文档数据以供预览。</div>
        ) : (
          <PdfLocater apiLoading={loading} url={docUrl} title={params?.fileName || '文档预览'} chunk={chunk} />
        )}
      </div>
    </div>
  );
};

export default Trace;
