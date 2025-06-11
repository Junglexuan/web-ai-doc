import {
  AlignLeftOutlined,
  CalendarOutlined,
  PictureOutlined,
  PlusCircleOutlined,
  QuestionCircleOutlined,
  ScanOutlined,
  SignatureOutlined,
} from '@ant-design/icons';
import {IDomEditor} from '@wangeditor-next/editor';
import {Button, Dropdown} from 'antd';
import {FC, memo, useMemo} from 'react';
import {createPortal} from 'react-dom';
import {VariableElement} from '../elements/Variable/custom-types';
import VarLayer from '../VarLayer';
import styles from './index.module.less';
//import './registerMenu';

interface LayerProps {
  editor: IDomEditor;
}

const VarPortal: FC<LayerProps> = ({editor}) => {
  return createPortal(<VarLayer editor={editor} />, document.body);
};

interface Props {
  editor: IDomEditor;
}

function insertVarByTpl(editor: IDomEditor, kind: string) {
  editor.focus();
  if (editor.selection) {
    let node: VariableElement | undefined;
    if (kind === 'date') {
      node = {type: 'variable', kind, source: '${DATE.NOW()}', info: '此时此刻', children: [{text: '$日期时间'}]};
    } else if (kind === 'sign') {
      node = {type: 'variable', kind, source: '${USER.CURRENT()}', info: '当前用户', children: [{text: '$用户署名'}]};
    } else if (kind === 'image') {
      node = {type: 'variable', kind, source: '${AI.IMAGE()}', info: '...', children: [{text: '$智能生图'}]};
    } else if (kind === 'ask') {
      node = {type: 'variable', kind, source: '${KNOWLEDGE.ASK()}', info: '...', children: [{text: '$知识库问答'}]};
    } else if (kind === 'write') {
      node = {type: 'variable', kind, source: '${AI.ASK()}', info: '...', children: [{text: '$AI写作'}]};
    } else if (kind === 'replace') {
      node = {type: 'variable', kind, source: '${DOC.REPLACE()}', info: '...', children: [{text: '$内容替换'}]};
    }
    if (node) {
      editor.insertNode(node);
      setTimeout(() => {
        const dom = editor.toDOMNode(node!);
        if (dom) {
          (dom.children[0] as any).click();
        }
      });
    }
  }
}

const Component: FC<Props> = ({editor}) => {
  const menuData = useMemo(() => {
    return {
      onClick: ({key}: {key: string}) => {
        insertVarByTpl(editor, key);
      },
      items: [
        {
          key: 'date',
          label: '日期时间',
          icon: <CalendarOutlined />,
        },
        {
          key: 'sign',
          label: '用户署名',
          icon: <SignatureOutlined />,
        },
        {
          key: 'write',
          label: 'AI写作',
          icon: <AlignLeftOutlined />,
        },
        {
          key: 'replace',
          label: '内容替换',
          icon: <ScanOutlined />,
        },
        {
          key: 'image',
          label: '智能生图',
          icon: <PictureOutlined />,
        },
        {
          key: 'ask',
          label: '知识库问答',
          icon: <QuestionCircleOutlined />,
        },
      ],
    };
  }, [editor]);

  return (
    <>
      <div className="w-e-bar-divider"></div>
      <Dropdown menu={menuData} trigger={['click']} align={{offset: [0, 5]}}>
        <Button disabled={editor.getConfig().readOnly} id="_ai_var_button" className={styles.button} type="text" icon={<PlusCircleOutlined />}>
          模版组件
        </Button>
      </Dropdown>
      <VarPortal editor={editor} />
    </>
  );
};

export default memo(Component);
