import {PlusOutlined} from '@ant-design/icons';
import {Button, Select} from 'antd';
import {FC, memo, useRef} from 'react';
import DeleteIcon from '@/assets/images/Delete';
import BlurInput from '@/components/BlurInput';
import {useEvent} from '@/utils/tools';
import {DueConfigs} from '../../entity';
import styles from './index.module.less';

const Component: FC<{
  configs: DueConfigs['questions'];
  value?: {tpl: string; list: {id: string; questionName: string}[]};
  onChange?: (value: {tpl: string; list: {id: string; questionName: string}[]}) => void;
}> = ({configs, value = {tpl: '', list: []}, onChange}) => {
  const uid = useRef(0);
  const uidMap = useRef(new Map<any, number>());

  const onCreate = useEvent(() => {
    onChange?.({...value, list: [...value.list, {id: '', questionName: ''}]});
  });

  const onDel = useEvent((index: number) => {
    onChange?.({
      ...value,
      list: value.list.filter((item, i) => {
        if (i === index) {
          uidMap.current.delete(item);
          return false;
        } else {
          return true;
        }
      }),
    });
  });

  const onLabelChange = useEvent((text: string, index: number) => {
    const list = value.list.map((item, i) => {
      if (i === index) {
        uidMap.current.delete(item);
        return {...item, questionName: text};
      } else {
        return item;
      }
    });
    onChange?.({...value, list});
  });

  const onTplChange = useEvent((tpl: string) => {
    onChange?.({tpl, list: configs.tpls.find((item) => item.value === tpl)?.list || []});
  });

  return (
    <div className={styles.root}>
      <Select options={configs.tpls} value={value!.tpl} onChange={onTplChange} />
      <div className="list">
        {value.list.length
          ? value.list.map((item, index) => {
              let key = uidMap.current.get(item);
              if (!key) {
                key = ++uid.current;
                uidMap.current.set(item, key);
              }
              return (
                <div className="form-item" key={key}>
                  <label>{`问题${index + 1}:`}</label>
                  <BlurInput value={item.questionName} onChange={(val) => onLabelChange(val || '', index)} />
                  <DeleteIcon className="btn-del" onClick={() => onDel(index)} />
                </div>
              );
            })
          : null}
        <div className="form-item">
          <label></label>
          <Button className="btn-create" type="dashed" icon={<PlusOutlined />} onClick={onCreate}>
            添加问题
          </Button>
        </div>
      </div>
    </div>
  );
};

export default memo(Component);
