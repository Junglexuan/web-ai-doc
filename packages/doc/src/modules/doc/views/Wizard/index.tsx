import {InfoCircleOutlined} from '@ant-design/icons';
import {Button, Form, Input, Modal, Select, Steps} from 'antd';
import {FC, memo, useMemo, useState} from 'react';
import {showMask, useEvent} from '@/utils/tools';
import KnowledgeSelect from '../Edit/KnowledgeSelect';
import styles from './index.module.less';

export interface WizardFormData {
  tplId: string;
  //type: string;
  fields: {name: string; label: string; value: string; holdplace: string}[];
  isContract?: boolean;
}

const FormLayout = {labelCol: {span: 5}, wrapperCol: {span: 16}};
const StepsItems = [{title: '关键信息'}, {title: '参考资料'}];
const StandpointOptions = [{value: '甲方'}, {value: '乙方'}, {value: '丙方'}];
interface Props {
  data: WizardFormData;
  inDialog?: boolean;
  onCancel: () => void;
  onSubmit: (tplId: string, fields: {[field: string]: string}, knowledges: string[], standpoint: string, isContract?: boolean) => void;
}

const Component: FC<Props> = ({data, inDialog, onCancel, onSubmit}) => {
  const [curStep, setCurStep] = useState(data.fields.length ? 0 : 1);
  const [fieldsValues, setFieldsValues] = useState<{[field: string]: string}>(() =>
    data.fields.reduce((obj, cur) => {
      obj[cur.name] = cur.value;
      return obj;
    }, {} as {[key: string]: string})
  );
  const [knowledges, setKnowledges] = useState<string>('');
  const [standpoint, setStandpoint] = useState<string[]>([StandpointOptions[0].value]);
  const [fieldsForm] = Form.useForm();

  const onFinish = useEvent((data: {[field: string]: string}) => {
    setFieldsValues(data);
    setCurStep(1);
  });

  const step0Form = useMemo(() => {
    if (curStep === 0) {
      return (
        <Form className="field-form" {...FormLayout} form={fieldsForm} colon={false} initialValues={fieldsValues} onFinish={onFinish}>
          {data.fields.length ? (
            data.fields.map((item) => (
              <Form.Item key={item.name} name={item.name} label={item.label} tooltip={{title: item.holdplace, icon: <InfoCircleOutlined />}}>
                <Input.TextArea rows={1} placeholder={item.holdplace} autoSize />
              </Form.Item>
            ))
          ) : (
            <div style={{textAlign: 'center'}}>- 无需填写关键信息 -</div>
          )}
        </Form>
      );
    }
    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [curStep]);

  const step1Form = useMemo(() => {
    if (curStep === 1) {
      return (
        <div className={styles.reference}>
          {data.isContract && (
            <div style={{marginBottom: '20px'}}>
              <label className="form-label">立场：</label>
              <Select
                placeholder="请选择或输入合同立场"
                mode="tags"
                maxCount={1}
                style={{width: '200px'}}
                options={StandpointOptions}
                value={standpoint}
                onChange={setStandpoint}
              />
            </div>
          )}
          <div>
            <label className="form-label">知识库：</label>
            <KnowledgeSelect<string> onChange={setKnowledges} />
          </div>
          <div className="tips">* 若无参考资料，可直接跳过...</div>
        </div>
      );
    }
    return null;
  }, [curStep, data.isContract, standpoint]);

  return (
    <Modal
      open={true}
      footer={null}
      onCancel={() => {
        console.log('!inDialog: ', !inDialog);
        !inDialog && showMask(false);
        onCancel();
      }}
      width={1200}
      centered
      rootClassName={inDialog ? 'g-dialog-no-mask' : undefined}
      title="使用模版"
      afterOpenChange={(open: boolean) => {
        console.log('!inDialog: ', !inDialog);
        !inDialog && showMask(open);
      }}
    >
      <div className={styles.root}>
        <div className="hd">
          <Steps className="steps" size="small" current={curStep} items={StepsItems} />
        </div>
        <div className="bd">
          {step0Form}
          {step1Form}
        </div>
        <div className="ft">
          {curStep === 0 ? (
            <Button type="primary" onClick={() => fieldsForm.submit()}>
              下一步
            </Button>
          ) : (
            <>
              <Button
                onClick={() => {
                  setCurStep(0);
                }}
              >
                上一步
              </Button>
              <Button
                type="primary"
                onClick={() => {
                  showMask(false);
                  onSubmit(data.tplId, fieldsValues, knowledges ? [knowledges] : [], standpoint[0], data.isContract);
                }}
              >
                生成文档
              </Button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default memo(Component);
