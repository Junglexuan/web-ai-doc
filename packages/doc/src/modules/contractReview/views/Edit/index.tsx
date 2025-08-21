import {Button, Form, Input, Select, Space} from 'antd';
import {FC, memo} from 'react';
import {ListItem} from '../../entity';
import styles from './index.module.less';

const Component: FC<{
  cateOptions: {label: string; value: string}[];
  data: ListItem;
  onCancel: () => void;
  onSubmit: (data: ListItem) => void;
}> = ({cateOptions, data, onCancel, onSubmit}) => {
  const [form] = Form.useForm();

  return (
    <div className={styles.root}>
      <Form className="bd" labelCol={{span: 5}} wrapperCol={{span: 18}} initialValues={data} preserve={false} form={form} onFinish={onSubmit}>
        <Form.Item name="type" label="规则分类" rules={[{required: true}]}>
          <Select options={cateOptions} placeholder="请选择分类"></Select>
        </Form.Item>
        <Form.Item name="name" label="规则名称" rules={[{required: true, whitespace: true}]}>
          <Input maxLength={64} placeholder="必填，最大长度64个字符" />
        </Form.Item>
        <Form.Item name="des" label="规则描述" rules={[{required: true, whitespace: true}]}>
          <Input.TextArea maxLength={512} placeholder="必填，最大长度512个字符" rows={4} />
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
