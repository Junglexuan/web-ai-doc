import {Card, Spin, message} from 'antd';
import {FC, useEffect, useState} from 'react';
import {DueDiligenceAPI} from '../../api';

const Trace: FC = () => {
  const [loading, setLoading] = useState(false);
  const [docUrl, setDocUrl] = useState<string>('');
  const [params, setParams] = useState<any>(null);

  useEffect(() => {
    setLoading(true);
    DueDiligenceAPI.getTraceInfo()
      .then((res) => {
        // Here we just safely assume the structure according to the request
        console.log('Trace API response:', res);

        // Usually res contains things like url, chunk details, position...
        // Let's dump it first and maybe use some defaults if present
        if (res && res.data) {
          const data = Array.isArray(res.data) ? res.data[0] : res.data;

          if (data) {
            const url = data.url || data.docUrl || data.fileUrl;
            setDocUrl(url);
            setParams(data);
          } else {
            message.warning('返回数据为空');
          }
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

  return (
    <div style={{width: '100%', height: '100%', background: '#fff', display: 'flex', flexDirection: 'column'}}>
      <div>
        <h2>测试溯源</h2>
        {params && (
          <Card title="API 返回数据详情">
            <pre style={{maxHeight: 200, overflow: 'auto'}}>{JSON.stringify(params, null, 2)}</pre>
          </Card>
        )}
      </div>

      <div style={{flex: 1, position: 'relative', borderTop: '1px solid #eee'}}>
        {loading ? (
          <div style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}}>
            <Spin tip="加载中..." />
          </div>
        ) : docUrl ? (
          <div style={{width: '100%', height: '100%', overflow: 'hidden'}}>
            <iframe src={docUrl} style={{width: '100%', height: '100%', border: 'none'}} />
          </div>
        ) : (
          <div style={{paddingTop: 20}}>暂无文档数据以供预览。</div>
        )}
      </div>
    </div>
  );
};

export default Trace;
