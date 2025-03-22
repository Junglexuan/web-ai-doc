import {BellOutlined, UserOutlined} from '@ant-design/icons';
import {Avatar, Badge, Space} from 'antd';
import {FC} from 'react';
import styles from './index.module.less';

const Component: FC<{}> = () => {
  return (
    <div className={styles.root}>
      <div></div>
      <Space size="large" align="center">
        <Badge count={5}>
          <BellOutlined style={{fontSize: '22px'}} />
        </Badge>
        <Avatar icon={<UserOutlined />} />
      </Space>
    </div>
  );
};

export default Component;
