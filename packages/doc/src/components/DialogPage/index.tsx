import {ArrowLeftOutlined, CaretLeftOutlined, CaretRightOutlined, CloseOutlined, ReloadOutlined} from '@ant-design/icons';
import {DocumentHead, Link} from '@elux/react-web';
import {Tooltip} from 'antd';
import {FC, ReactNode, useMemo, useState} from 'react';
import {useEvent} from '@/utils/tools';
import styles from './index.module.less';

export interface Props {
  className?: string;
  title?: string;
  subject?: string;
  children?: ReactNode;
  brand?: ReactNode;
  showClose?: boolean;
  showControls?: boolean;
  maskClosable?: boolean;
  mask?: boolean;
  size?: 'max' | 'auto';
  minSize?: (number | string)[];
  backOverflowRedirect?: string;
}

const Component: FC<Props> = (props) => {
  const {className = '', title, subject, brand, children, showClose = true, maskClosable = true, mask, backOverflowRedirect, minSize = []} = props;
  const showControls = props.showControls !== undefined ? props.showControls : !brand;
  const showResize = minSize[0];
  const [size, setSize] = useState(props.size || 'auto');
  const toggleSize = useEvent(() => {
    setSize(size === 'auto' ? 'max' : 'auto');
  });
  const style = {};
  if (minSize[0] && size === 'auto') {
    style['width'] = typeof minSize[0] === 'number' ? minSize[0] + 'px' : minSize[0];
  }
  if (minSize[1] && size === 'auto') {
    style['height'] = typeof minSize[1] === 'number' ? minSize[1] + 'px' : minSize[1];
  }

  const controls = useMemo(() => {
    return showControls ? (
      <div className="control">
        <Tooltip title="后退">
          <Link to={1} action="back" target="page" overflowRedirect={backOverflowRedirect}>
            <ArrowLeftOutlined />
          </Link>
        </Tooltip>
        <Tooltip title="刷新">
          <Link to={0} action="back" refresh>
            <ReloadOutlined />
          </Link>
        </Tooltip>
        <Tooltip title="关闭">
          <Link to={1} action="back" target="window" overflowRedirect={backOverflowRedirect}>
            <CloseOutlined />
          </Link>
        </Tooltip>
      </div>
    ) : showClose ? (
      <Link className="close" to={1} action="back" target="window" overflowRedirect={backOverflowRedirect}>
        <CloseOutlined />
      </Link>
    ) : null;
  }, [backOverflowRedirect, showControls, showClose]);

  const resize = useMemo(() => {
    return showResize ? (
      <div className="resize">
        <div className="btn" onClick={toggleSize}>
          <CaretLeftOutlined />
          <CaretRightOutlined />
        </div>
      </div>
    ) : null;
  }, [showResize, toggleSize]);

  return (
    <>
      <div className={`${styles.root} ${brand ? 'show-brand' : ''} size-${size} ${className}`} style={style}>
        {title && <DocumentHead title={title} />}
        {resize}
        {controls}
        {brand}
        <div className="content">
          {subject && <h2 className="subject">{subject}</h2>}
          {children}
        </div>
      </div>
      <Link
        disabled={!maskClosable}
        className={`${styles.mask} ${!mask ? 'no-mask' : ''}`}
        to={1}
        action="back"
        target="window"
        overflowRedirect={backOverflowRedirect}
      ></Link>
    </>
  );
};

export default Component;
