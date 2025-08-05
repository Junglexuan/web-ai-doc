import {CloseOutlined} from '@ant-design/icons';
import {IDomEditor, SlateNode} from '@wangeditor-next/editor';
import {Button} from 'antd';
import {FC, memo, useEffect, useState} from 'react';
import {useEvent} from '@/utils/tools';
import styles from './index.module.less';
interface Props {
  editor: IDomEditor;
}

const Component: FC<Props> = ({editor}) => {
  const [show, setShow] = useState(false);
  const [headers, setHeaders] = useState<{id: string; type: string; text: string}[]>([]);

  const onClick = useEvent((e: any) => {
    if (e.target.tagName !== 'LI') return;
    e.preventDefault();
    const id = e.target.getAttribute('data-id');
    const dom = document.getElementById(id);
    if (dom) {
      dom.scrollIntoView();
    }
    //editor.scrollToElem(id);
  });

  const onDocChange = useEvent(() => {
    if (!show) {
      return;
    }
    const headers = editor.getElemsByTypePrefix('header') || [];
    setHeaders(
      headers.map((header: any) => {
        const text = SlateNode.string(header);
        const {id, type} = header;
        return {id, type, text};
      })
    );
  });

  useEffect(() => {
    onDocChange();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  useEffect(() => {
    editor.on('change', onDocChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <span className="btn outline" onClick={() => setShow(!show)} />
      {/* <div className={styles.mask + (show ? ' on' : '')} onClick={() => setShow(!show)}></div> */}
      <div className={styles.panel + (show ? ' on' : '')}>
        <div className="hd">
          <span>大纲</span>
          <Button size="small" icon={<CloseOutlined />} type="text" onClick={() => setShow(!show)} />
        </div>
        <div className="bd">
          <ul onClick={onClick}>
            {headers.map((item) => {
              return (
                <li key={item.id} data-id={item.id} data-type={item.type}>
                  {item.text}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </>
  );
};

export default memo(Component);
