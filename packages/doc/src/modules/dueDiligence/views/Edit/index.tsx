import {DownOutlined, QuestionCircleFilled, UpOutlined} from '@ant-design/icons';
import {Button, Checkbox, Form, Input, Space, Tooltip} from 'antd';
import {FC, memo, useState} from 'react';
import DocUploads from '../../components/DocUploads';
import IconSelect from '../../components/IconSelect';
import Questions from '../../components/Questions';
import TplSelect from '../../components/TplSelect';
import {DueConfigs, ListItem} from '../../entity';
import styles from './index.module.less';

const Component: FC<{
  configs: DueConfigs;
  data: ListItem;
  onCancel: () => void;
  onSubmit: (data: ListItem) => void;
}> = ({configs, data, onCancel, onSubmit}) => {
  console.log(data);
  const [form] = Form.useForm();
  const [setting, setSetting] = useState(false);

  return (
    <div className={styles.root}>
      <div className="bd">
        <Form labelCol={{span: 5}} wrapperCol={{span: 18}} initialValues={data} preserve={false} form={form} onFinish={onSubmit}>
          <Form.Item name="name" label="尽调对象" rules={[{required: true}]}>
            <Input maxLength={64} placeholder="必填，最大长度64个字符" />
          </Form.Item>
          <Form.Item name="logo" label="项目图标">
            <IconSelect />
          </Form.Item>
          <Form.Item name="pathList" label="尽调资料" help={<div style={{margin: '5px 0 15px'}}>支持上传doc、docx、xlsx、pdf格式的文档</div>}>
            <DocUploads />
          </Form.Item>
          {!setting && (
            <Form.Item label={null}>
              <Button
                className="more"
                iconPosition="end"
                variant="outlined"
                color="primary"
                onClick={() => setSetting(!setting)}
                icon={<DownOutlined />}
              >
                更多配置
              </Button>
            </Form.Item>
          )}
          {setting && (
            <>
              <Form.Item label="问题清单" name="questions">
                <Questions configs={configs.questions} />
              </Form.Item>
              <Form.Item name="template" label="尽调模板">
                <TplSelect list={configs.template.list} />
              </Form.Item>
              <Form.Item name="autoCreateFinalSheets" label={null} valuePropName="checked">
                <Checkbox>
                  <div className="auto-create">
                    <span>自动生成流动资金贷款测算表</span>
                    <Tooltip title="勾选后，在您每次上传新资料时系统将为您自动生成新的测算表">
                      <QuestionCircleFilled style={{color: '#D9D9D9', marginLeft: '3px'}} />
                    </Tooltip>
                  </div>
                </Checkbox>
              </Form.Item>
            </>
          )}
          {setting && (
            <Form.Item label={null}>
              <Button
                className="more"
                iconPosition="end"
                variant="outlined"
                color="primary"
                onClick={() => setSetting(!setting)}
                icon={<UpOutlined />}
              >
                收起配置
              </Button>
            </Form.Item>
          )}
        </Form>
      </div>
      <div className="ft">
        <Space>
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" onClick={() => form.submit()}>
            提交
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default memo(Component);
