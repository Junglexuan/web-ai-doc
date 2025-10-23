import {InfoCircleOutlined} from '@ant-design/icons';
import {Button, Form, FormInstance, Input, Modal, Select, Steps} from 'antd';
import {FC, memo, useMemo, useRef, useState} from 'react';
import RadioCard from '@/components/RadioCard';
import {message, useEvent} from '@/utils/tools';
import DocAPI from '../../api';
import KnowledgeSelect from '../Edit/KnowledgeSelect';
import styles from './index.module.less';

export interface WizardFormData {
  tplId: string;
  type?: string;
  fields?: {name: string; label: string; value: string; holdplace: string}[];
  kind?: 'conts' | 'docs';
}

const FormLayout = {labelCol: {span: 5}, wrapperCol: {span: 18}};

interface Props {
  tplsOptions?: {value: string; label: string; children: {value: string; label: string}[]}[];
  data: WizardFormData;
  onCancel: () => void;
  onSubmit: (tplId: string, fields: {[field: string]: string}, knowledges: string[]) => void;
  onPriview?: (tplId: string) => void;
  kind?: 'conts' | 'docs';
}

const Component: FC<Props> = ({tplsOptions = [], data, onCancel, onSubmit, onPriview, kind}) => {
  const [curType, setCurType] = useState(() => tplsOptions.find((item) => item.value === data.type));
  const [curTplId, setCurTplId] = useState(data.tplId);
  const [curTplFields, setCurTplFields] = useState<{name: string; label: string; value: string; holdplace: string}[] | undefined>(data.fields);
  const [fieldsValues, setFieldsValues] = useState<{[field: string]: string}>({});
  const [knowledges, setKnowledges] = useState<string>('');
  const [curStep, setCurStep] = useState(!curTplFields ? 0 : curTplFields.length ? 1 : 2);
  const fieldsFormRef = useRef<FormInstance>();
  const [step0Able] = useState(!data.fields);

  const [StepsItems] = useState([{title: kind === 'conts' ? '合同场景' : '写作场景'}, {title: '关键信息'}, {title: '参考资料'}]);

  const onTypeChange = useEvent((type: string) => {
    const item = tplsOptions.find((item) => item.value === type);
    if (item) {
      setCurType(item);
      if (kind !== 'conts') {
        setCurTplId(item.children[0]?.value || '');
      } else {
        setCurTplId('');
      }
      setCurTplFields(undefined);
    }
  });

  const onNext = useEvent(() => {
    if (curStep === 1) {
      fieldsFormRef.current?.submit();
    } else if (curStep === 2) {
      onSubmit(curTplId, fieldsValues, [knowledges]);
    } else {
      if (!curTplId) {
        message.error('请选择合同立场');
        return;
      }
      DocAPI.getTplFields(curTplId, kind).then((tplFields) => {
        setCurStep(1);
        setFieldsValues({});
        setCurTplFields(tplFields);
      });
    }
  });

  const onFinish = useEvent((data: {[field: string]: string}) => {
    setFieldsValues(data);
    setCurStep(2);
  });

  const onPrev = useEvent(() => {
    if (curStep === 1) {
      setCurStep(0);
      setFieldsValues({});
      setCurTplFields(undefined);
    } else if (curStep === 2) {
      setCurStep(1);
    }
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

  const onBeforePreview = useEvent(() => {
    const tplId = kind === 'conts' ? curType?.value : curTplId;
    if (tplId && onPriview) {
      onPriview(tplId);
    }
  });

  return (
    <Modal open={true} footer={null} onCancel={onCancel} width={800} maskClosable={false} title={kind === 'conts' ? '起草合同' : '起草公文'}>
      <div className={styles.root}>
        <div className="hd">
          {step0Able ? (
            <Steps className="steps" size="small" current={curStep} items={StepsItems} />
          ) : (
            <Steps className="steps" size="small" current={curStep - 1} items={StepsItems.slice(1)} />
          )}
        </div>
        <div className="bd">
          {curStep === 0 && curType && (
            <div>
              <div className="form-item">
                <label>分类</label>
                <RadioCard options={tplsOptions} value={curType.value} onChange={onTypeChange} />
              </div>
              {kind === 'conts' ? (
                <div className="form-item">
                  <label>立场</label>
                  <Select
                    placeholder="请选择或输入合同立场"
                    mode="tags"
                    maxCount={1}
                    style={{width: '200px'}}
                    options={[{value: '甲方'}, {value: '乙方'}]}
                    value={curTplId ? [curTplId.split(',')[1]] : []}
                    onChange={(val) => setCurTplId(val[0] ? `${curType.value},${val[0]}` : '')}
                  />
                </div>
              ) : (
                <div className="form-item">
                  <label>类型</label>
                  <RadioCard options={curType.children} value={curTplId} onChange={setCurTplId} />
                </div>
              )}
            </div>
          )}
          {curStep === 1 && curTplFields && (
            <Form className="field-form" {...FormLayout} ref={fieldsFormRef as any} colon={false} initialValues={fieldsValues} onFinish={onFinish}>
              {curTplFields.map((item) => (
                <Form.Item key={item.name} name={item.name} label={item.label} tooltip={{title: item.holdplace, icon: <InfoCircleOutlined />}}>
                  <Input.TextArea rows={1} placeholder={item.holdplace} defaultValue={item.value} autoSize />
                </Form.Item>
              ))}
            </Form>
          )}
          {curStep === 2 && (
            <div className={styles.reference}>
              <div>
                <label>知识库：</label>
                <KnowledgeSelect<string> onChange={setKnowledges} />
              </div>
              <div className="tips">* 若无参考资料，可直接跳过...</div>
            </div>
          )}
        </div>
        <div className="ft">
          {curStep === 0 && <Button onClick={onBeforePreview}>预览</Button>}
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
