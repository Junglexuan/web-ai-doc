import {Button, Form, FormInstance, Input, Modal, Steps} from 'antd';
import {FC, memo, useMemo, useRef, useState} from 'react';
import RadioCard from '@/components/RadioCard';
import {useEvent} from '@/utils/tools';
import DocAPI from '../../api';
import styles from './index.module.less';

export interface WizardFormData {
  tplId: string;
  type?: string;
  fields?: {name: string; label: string; value: string}[];
  kind?: 'conts' | 'docs';
}

const FormLayout = {labelCol: {span: 3}, wrapperCol: {span: 20}};

interface Props {
  tplsOptions?: {value: string; label: string; children: {value: string; label: string}[]}[];
  data: WizardFormData;
  onCancel: () => void;
  onsubmit: (data: {__tplId: string; [field: string]: string}) => void;
  kind?: 'conts' | 'docs';
}

const Component: FC<Props> = ({tplsOptions = [], data, onCancel, onsubmit, kind}) => {
  const [curType, setCurType] = useState(() => tplsOptions.find((item) => item.value === data.type));
  const [curTplId, setCurTplId] = useState(data.tplId);
  const [curTplFields, setCurTplFields] = useState<{name: string; label: string; value: string}[] | undefined>(data.fields);
  const [fieldsValues, setFieldsValues] = useState<{[name: string]: string}>({__tplId: data.tplId});
  const [curStep, setCurStep] = useState(curTplFields ? 1 : 0);
  const fieldsFormRef = useRef<FormInstance>();
  const [step0Able] = useState(!data.fields);

  const [StepsItems] = useState(kind === 'conts' ? [{title: '合同场景'}, {title: '关键信息'}] : [{title: '写作场景'}, {title: '关键信息'}]);

  const onTypeChange = useEvent((type: string) => {
    const item = tplsOptions.find((item) => item.value === type);
    if (item) {
      setCurType(item);
      setCurTplId(item.children[0]?.value || '');
      setCurTplFields(undefined);
    }
  });

  const onNext = useEvent(() => {
    if (curStep === 1) {
      fieldsFormRef.current?.submit();
    } else {
      DocAPI.getTplFields(curTplId, kind).then((tplFields) => {
        setCurStep(1);
        setFieldsValues({__tplId: curTplId});
        setCurTplFields(tplFields);
      });
    }
  });

  const onPrev = useEvent(() => {
    setCurStep(curStep - 1);
    setFieldsValues({});
    setCurTplFields(undefined);
  });

  const showPrev = useMemo(() => {
    if (curStep > 1) {
      return <Button onClick={onPrev}>上一步</Button>;
    }
    if (curStep === 1 && step0Able) {
      return <Button onClick={onPrev}>上一步</Button>;
    }
    return null;
  }, [curStep, onPrev, step0Able]);

  // const onFieldsValueChange = useEvent((changed: ) => {
  //   if (changed.type) {
  //     form.setFieldValue('__tplId', curType.children[0].value);
  //     setTplList(curType.children);
  //   }
  // });

  return (
    <Modal open={true} footer={null} onCancel={onCancel} width={800} maskClosable={false} title={kind === 'conts' ? '起草合同' : '起草公文'}>
      <div className={styles.root}>
        <div className="hd">
          {step0Able ? (
            <Steps className="steps" size="small" current={curStep} items={StepsItems} />
          ) : (
            <div className="steps" style={{width: 'auto', lineHeight: '30px', backgroundColor: '#f7f7f7', textAlign: 'center', fontWeight: 'bold'}}>
              关键信息
            </div>
          )}
        </div>
        <div className="bd">
          {curStep === 0 && curType && (
            <div>
              <div className="form-item">
                <label>分类</label>
                <RadioCard options={tplsOptions} value={curType.value} onChange={onTypeChange} />
              </div>
              <div className="form-item">
                <label>{kind === 'conts' ? '立场' : '类型'}</label>
                <RadioCard options={curType.children} value={curTplId} onChange={setCurTplId} />
              </div>
            </div>
          )}
          {curStep === 1 && curTplFields && (
            <Form {...FormLayout} ref={fieldsFormRef as any} colon={false} initialValues={fieldsValues} onFinish={onsubmit}>
              <Form.Item name="__tplId" hidden>
                <Input />
              </Form.Item>
              {curTplFields.map((item) => (
                <Form.Item key={item.name} name={item.name} label={item.label}>
                  <Input.TextArea rows={1} placeholder={item.value} autoSize />
                </Form.Item>
              ))}
            </Form>
          )}
        </div>
        <div className="ft">
          {showPrev}
          <Button type="primary" onClick={onNext}>
            下一步
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default memo(Component);
