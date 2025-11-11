import {Button, Cascader, Form, Input, Radio, Space} from 'antd';
import {FC, memo} from 'react';
import styles from './index.module.less';

const Component: FC<{
  data: {title: string; remark?: string; isShare?: number};
  cateOptions: {
    value: string;
    label: string;
  }[];
  onCancel: () => void;
  onSubmit: (data: {title: string; remark: string; isShare: number; categoryIds: string[]}) => void;
}> = ({data, cateOptions, onCancel, onSubmit}) => {
  const [form] = Form.useForm();

  return (
    <div className={styles.edit}>
      <Form className="bd" labelCol={{span: 5}} wrapperCol={{span: 18}} initialValues={data} preserve={false} form={form} onFinish={onSubmit}>
        <Form.Item name="title" label="模版名称" rules={[{required: true}]}>
          <Input />
        </Form.Item>
        <Form.Item name="categoryIds" label="场景类型" rules={[{required: true}]}>
          <Cascader options={cateOptions} />
        </Form.Item>
        <Form.Item name="remark" label="模版描述">
          <Input.TextArea />
        </Form.Item>
        <Form.Item name="isShare" label="应用范围">
          <Radio.Group
            options={[
              {value: 0, label: '个人使用'},
              {value: 1, label: '全员使用'},
              {value: 2, label: '网络公开'},
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
