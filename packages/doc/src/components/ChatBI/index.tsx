import {RenderChart} from '@binarysee/widgets';
import {snapdom} from '@zumer/snapdom';
import {FC, memo, useEffect, useRef, useState} from 'react';
import {replaceBaseUrl, uploadFile} from '@/utils/request';
// 必须引入样式文件
import '@binarysee/widgets/dist/widgets-component.css';
import styles from './index.module.less';

window.ChartBIView = {
  snapshot: () => Promise.resolve(''),
};

export interface Props {
  dsl?: any;
}

const Component: FC<Props> = ({dsl}) => {
  const rootRef = useRef<HTMLElement>(null);
  const [datasource, setDatasource] = useState<{dsl: any}>();

  useEffect(() => {
    window.ChartBIView.snapshot = async (data) => {
      setDatasource(data);
      return new Promise((resolve) => {
        setTimeout(async () => {
          // const result = await snapdom();
          const imgBlob = await snapdom.toBlob(rootRef.current!);
          const formData = new FormData();
          formData.append('file', imgBlob, 'snapshot.png');
          const {url} = await uploadFile('/dream/pen/upload/img', formData);
          resolve(url);
        }, 1000);
      });
    };
    return () => {
      window['ChartBIView'].snapshot = () => Promise.resolve('');
    };
  }, []);

  // const onPaginationChange = (page: number, pageSize: number) => {
  //   const visual = ansewerData.visual;
  //   const indicatorModelSql = ansewerData.indicatorModelSql;
  //   if (!visual) {
  //     return;
  //   }
  //   //  接口URL : `/brain/chatbi/0/widget/page`
  //   chatbiTablePagenationApi({
  //     pageNum: page,
  //     pageSize,
  //     robotId,
  //     ...visual,
  //     indicatorModelSql,
  //   }).then((res) => {});
  // };

  return (
    <div className={styles.root} ref={rootRef as any}>
      <RenderChart
        onPaginationChange={(page: number, pageSize: number) => {
          // 表格组件分页change方法，请求分页接口
          //onPaginationChange(page: number, pageSize: number)
        }}
        chartDsl={datasource?.dsl}
      />
    </div>
  );
};

export default memo(Component);
