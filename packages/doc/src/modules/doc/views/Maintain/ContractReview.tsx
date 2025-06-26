import {Button, Select} from 'antd';
import {FC, memo, useState} from 'react';
import {useEvent} from '@/utils/tools';
import {DocAPI} from '../../api';
import {ListItem} from '../../entity';
import styles from './index.module.less';

const Component: FC<{
  cateOptions: {label: string; value: number}[];
  data: ListItem;
  onClose: () => void;
}> = ({cateOptions, data, onClose}) => {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<number>(0);
  const [result, setResult] = useState<
    {
      clauseExcerpt: string;
      issueDescription: string;
      issueType: string;
      suggestion: string;
    }[]
  >([]);

  const onReview = useEvent(() => {
    setLoading(true);
    DocAPI.contractReview(data.id, type)
      .then(setResult)
      .finally(() => setLoading(false));
  });
  return (
    <div className={styles.contractReview}>
      <div className="hd">
        <span>审查规则:</span>
        <Select options={cateOptions} placeholder="请选择..." onChange={setType}></Select>
        <Button loading={loading} type="primary" disabled={!type} onClick={onReview}>
          审查
        </Button>
      </div>
      <div className="bd">
        <ul>
          {result.map((item, index) => (
            <li key={index}>
              <div>{item.clauseExcerpt}</div>
              <div className="info">
                <span>{item.issueType}</span>
                <span>{item.issueDescription}</span>
              </div>
              <div className="suggestion">
                <em>建议：</em>
                {item.suggestion}
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="ft">
        <Button onClick={onClose}>确定</Button>
      </div>
    </div>
  );
};

export default memo(Component);
