import {CloseOutlined, PicRightOutlined} from '@ant-design/icons';
import {Boot, IButtonMenu, IDomEditor, SlateNode} from '@wangeditor-next/editor';
import {Button} from 'antd';
import {FC, ReactNode, memo, useEffect, useMemo, useRef, useState} from 'react';
import {useEvent} from '@/utils/tools';
import styles from './index.module.less';
interface Props {
  editor: IDomEditor;
}

const Component: FC<Props> = ({editor}) => {
  const [show, setShow] = useState(false);
  const [headers, setHeaders] = useState<{id: string; type: string; text: string}[]>([]);

  useEffect(() => {
    editor.on('change', () => {
      const headers = editor.getElemsByTypePrefix('header') || [];
      setHeaders(
        headers.map((header: any) => {
          const text = SlateNode.string(header);
          const {id, type} = header;
          return {id, type, text};
        })
      );
    });
  }, [editor]);
  return (
    <>
      <div className={styles.panel + (show ? ' on' : '')}>
        <div className="hd">
          <span>大纲</span>
          <Button size="small" icon={<CloseOutlined />} type="text" onClick={() => setShow(!show)} />
        </div>
        <div className="bd">
          <ul>
            {headers.map((item) => {
              return (
                <li key={item.id} id={item.id} data-type={item.type}>
                  {item.text}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <Button className={styles.button + (show ? ' on' : '')} icon={<PicRightOutlined />} type="text" onClick={() => setShow(!show)} />
    </>
  );
};

export default memo(Component);
