import {PlusOutlined} from '@ant-design/icons';
import {Button, Select} from 'antd';
import {FC, memo, useRef} from 'react';
import DeleteIcon from '@/assets/images/Delete';
import BlurInput from '@/components/BlurInput';
import {useEvent} from '@/utils/tools';
import styles from './index.module.less';

const Component: FC<{
  value: {id: string; question: string; answer: string}[];
  onChange: (value: {id: string; question: string; answer: string}[]) => void;
}> = ({value, onChange}) => {
  const uid = useRef(0);
  const uidMap = useRef(new Map<any, number>());

  const onCreate = useEvent(() => {
    onChange([...value, {id: '', question: '', answer: ''}]);
  });

  const onDel = useEvent((index: number) => {
    onChange(
      value.filter((item, i) => {
        if (i === index) {
          uidMap.current.delete(item);
          return false;
        } else {
          return true;
        }
      })
    );
  });

  const onQuestionChange = useEvent((question: string, index: number) => {
    onChange(
      value.map((item, i) => {
        if (i === index) {
          uidMap.current.delete(item);
          return {...item, question};
        } else {
          return item;
        }
      })
    );
  });

  const onAnswerChange = useEvent((answer: string, index: number) => {
    onChange(
      value.map((item, i) => {
        if (i === index) {
          uidMap.current.delete(item);
          return {...item, answer};
        } else {
          return item;
        }
      })
    );
  });

  return (
    <div className={styles.root}>
      <div className="list">
        {value.length
          ? value.map((item, index) => {
              let key = uidMap.current.get(item);
              if (!key) {
                key = ++uid.current;
                uidMap.current.set(item, key);
              }
              return (
                <div className="form-item" key={key}>
                  <div className="title">{`问题${index + 1}:`}</div>
                  <BlurInput value={item.question} maxLength={100} onChange={(val) => onQuestionChange(val || '', index)} />
                  <div className="title">{`回答:`}</div>
                  <div>{item.answer || '　'}</div>
                  <DeleteIcon className="btn-del" onClick={() => onDel(index)} />
                </div>
              );
            })
          : null}
        <div className="form-item">
          <Button className="btn-create" type="dashed" icon={<PlusOutlined />} onClick={onCreate}>
            添加问题
          </Button>
        </div>
      </div>
    </div>
  );
};

export default memo(Component);
