import {Button, Form, Input, Space} from 'antd';
import {FC, memo} from 'react';
import styles from './index.module.less';

const Component: FC<{data: {title: string; remark?: string}; onCancel: () => void; onSubmit: (data: {title: string; remark: string}) => void}> = ({
  data,
  onCancel,
  onSubmit,
}) => {
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
