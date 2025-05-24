import {Button, Form, Input, Radio, Space} from 'antd';
import {FC, memo} from 'react';
import styles from './index.module.less';

const Component: FC<{
  data: {title: string; remark?: string; isShare?: boolean};
  onCancel: () => void;
  onSubmit: (data: {title: string; remark: string; isShare: boolean}) => void;
}> = ({data, onCancel, onSubmit}) => {
  const [form] = Form.useForm();

  return (
    <div className={styles.root}>
      <Form className="bd" labelCol={{span: 4}} wrapperCol={{span: 20}} initialValues={data} preserve={false} form={form} onFinish={onSubmit}>
        <Form.Item name="title" label="模版名称" rules={[{required: true, whitespace: true}]}>
          <Input />
        </Form.Item>
        <Form.Item name="remark" label="模版描述">
          <Input.TextArea />
        </Form.Item>
        <Form.Item name="isShare" label="应用范围">
          <Radio.Group
            options={[
              {value: false, label: '个人使用'},
              {value: true, label: '全员使用'},
            ]}
          />
        </Form.Item>
      </Form>
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
