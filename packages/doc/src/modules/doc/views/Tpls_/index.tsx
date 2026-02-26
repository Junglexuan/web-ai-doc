import {Dispatch} from '@elux/react-web';
import {FC, memo, useEffect, useLayoutEffect} from 'react';
import DialogPage from '@/components/DialogPage';
import {showMask} from '@/utils/tools';
import {ListItem, ListSearch, ListSummary} from '../../entity';
import Tpls from '../Tpls';
import styles from './index.module.less';

interface Props {
  dispatch: Dispatch;
  listSearch: ListSearch;
  list: ListItem[];
  listSummary: ListSummary;
}

const Component: FC<Props> = (props) => {
  useLayoutEffect(() => {
    showMask(true);
    return () => {
      showMask(false);
    };
  }, []);
  return (
    <DialogPage mask className={styles.dialog} showControls={false}>
      <div className={styles.root}>
        <Tpls {...props} inDialog />
      </div>
    </DialogPage>
  );
};

export default memo(Component);
