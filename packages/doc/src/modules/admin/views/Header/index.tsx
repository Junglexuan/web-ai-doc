import {Dispatch} from '@elux/react-web';
import {Dropdown, Space} from 'antd';
import {FC} from 'react';
import {GetActions, SitesUrl} from '@/Global';
import {CurUser} from '@/utils/base';
import request from '@/utils/request';
import UserCenterMenu from '../UserCenterMenu';
import styles from './index.module.less';

const {stage: stageActions} = GetActions('stage');

const Component: FC<{curUser: CurUser; dispatch: Dispatch}> = ({curUser, dispatch}) => {
  return (
    <div className={styles.root}>
      <div></div>
      <Space size="large" align="center">
        {/* <Badge count={5}>
          <BellOutlined style={{fontSize: '22px', position: 'relative', top: '3px'}} />
        </Badge> */}
        <Dropdown
          trigger={['click']}
          popupRender={() => (
            <UserCenterMenu
              username={curUser.nickName || curUser.username}
              logout={() => dispatch(stageActions.logout())}
              switchTenant={() => {
                request.get('/dream/pen/currentUser', {headers: {quiet: 1}}).finally(() => (location.href = SitesUrl.verse));
              }}
            />
          )}
        >
          <div className="avatar" />
        </Dropdown>
      </Space>
    </div>
  );
};

export default Component;
