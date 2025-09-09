import {BellOutlined, LogoutOutlined, UserOutlined} from '@ant-design/icons';
import {Dispatch} from '@elux/react-web';
import {Avatar, Badge, Button, Dropdown, Space} from 'antd';
import {FC, useMemo} from 'react';
import {GetActions} from '@/Global';
import {CurUser} from '@/utils/base';
import {toUserCenter} from '@/utils/request';
import UserCenterMenu from '../UserCenterMenu';
import styles from './index.module.less';

const {stage: stageActions} = GetActions('stage');

const Component: FC<{curUser: CurUser; dispatch: Dispatch}> = ({curUser, dispatch}) => {
  const userMenu: any = useMemo(() => {
    return {
      items: [
        {
          key: 'g1',
          label: (
            <Button size="small" type="text" onClick={toUserCenter}>
              {curUser.username}
            </Button>
          ),
          type: 'group',
        },
        {
          type: 'divider',
        },
        {
          key: 'logout',
          label: (
            <Button size="small" type="link" icon={<LogoutOutlined />}>
              退出登录
            </Button>
          ),
        },
      ],
      onClick: ({key}: {key: string}) => {
        if (key === 'logout') {
          dispatch(stageActions.logout());
        }
      },
    };
  }, [curUser, dispatch]);

  return (
    <div className={styles.root}>
      <div></div>
      <Space size="large" align="center">
        {/* <Badge count={5}>
          <BellOutlined style={{fontSize: '22px', position: 'relative', top: '3px'}} />
        </Badge> */}
        <Dropdown trigger={['click']} popupRender={() => <UserCenterMenu logout={() => dispatch(stageActions.logout())} />}>
          <div className="avatar" />
        </Dropdown>
      </Space>
    </div>
  );
};

export default Component;
