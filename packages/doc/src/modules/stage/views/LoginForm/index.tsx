import {LockOutlined, UserOutlined} from '@ant-design/icons';
import {Dispatch, Link, exportView} from '@elux/react-web';
import {Button, Checkbox, Form, Input} from 'antd';
import {FC, useCallback} from 'react';
import DialogPage from '@/components/DialogPage';
import {GetActions} from '@/Global';
import {getFormDecorators} from '@/utils/tools';
import {LoginParams} from '../../entity';
import styles from './index.module.less';

type HFormData = Required<LoginParams>;

const initialValues: Partial<HFormData> = {
  username: 'agency6user',
  password: '123456',
  keep: true,
};

const fromDecorators = getFormDecorators<HFormData>({
  username: {rules: [{required: true, message: '请输入用户名!', whitespace: true}]},
  password: {rules: [{required: true, message: '请输入密码!', whitespace: true}]},
  keep: {valuePropName: 'checked'},
});

const {stage: stageActions} = GetActions('stage');

const Component: FC<{dispatch: Dispatch}> = ({dispatch}) => {
  const [form] = Form.useForm();
  const onSubmit = useCallback(
    (values: HFormData) => {
      dispatch(stageActions.login(values));
    },
    [dispatch]
  );

  return (
    <DialogPage maskClosable={false} mask={true} showControls={false}>
      <div className={`${styles.root} g-dialog-content`}>
        <h3 className="title">用户登录</h3>
        <Form form={form} onFinish={onSubmit} initialValues={initialValues}>
          <Form.Item {...fromDecorators.username}>
            <Input allowClear prefix={<UserOutlined />} placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item {...fromDecorators.password}>
            <Input.Password prefix={<LockOutlined />} placeholder="请输入密码" />
          </Form.Item>
          <Form.Item style={{marginBottom: 10}}>
            <Form.Item {...fromDecorators.keep} noStyle>
              <Checkbox>记住登录</Checkbox>
            </Form.Item>
            <Link className="btn-forgot" to={`/stage/forgetPassword`} action="push" target="page">
              忘记密码？
            </Link>
          </Form.Item>
          <Form.Item>
            <div className="g-full-actions">
              <Button type="primary" htmlType="submit">
                登录
              </Button>
            </div>
          </Form.Item>
        </Form>
      </div>
    </DialogPage>
  );
};

export default exportView(Component);
