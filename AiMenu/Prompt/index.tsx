import {QuestionCircleFilled} from '@ant-design/icons';
import {FC, ReactNode, memo, useEffect, useState} from 'react';
import {createPortal} from 'react-dom';
import {useEvent} from '@/utils/tools';
import styles from './index.module.less';

interface Props {
  top: number;
  children: ReactNode;
  footer: ReactNode;
}

const Component: FC<Props> = ({top, children, footer}) => {
  return createPortal(
    <>
      <div className={styles.dialog} style={top < 0 ? {top: 'auto', bottom: -top} : {top, bottom: 'auto'}}>
        <div className="wrap">
          <div className={styles.content}>{children}</div>
          {footer && (
            <div className={styles.footer}>
              <div>{footer}</div>
              <div>
                <QuestionCircleFilled style={{color: '#aaa', cursor: 'pointer'}} />
              </div>
            </div>
          )}
        </div>
      </div>
      <div className={styles.mask}></div>
    </>,
    document.body
  );
};

export default memo(Component);
