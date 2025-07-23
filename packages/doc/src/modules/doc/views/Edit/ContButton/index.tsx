import {FileProtectOutlined} from '@ant-design/icons';
import {DomEditor, IDomEditor} from '@wangeditor-next/editor';
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
    const variable = DomEditor.getSelectedNodeByType(editor, 'variable');
    if (variable) {
      const path = [...DomEditor.findPath(editor, variable)];
      const last = path.pop();
      path.push(last! + 1);
      editor.select(path);
    }
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
  return (
    <>
      <div className="w-e-bar-divider"></div>
      <Button disabled={editor.getConfig().readOnly} id="_ai_cont_button" className={styles.button} type="text" icon={<FileProtectOutlined />}>
        合同审查
      </Button>
    </>
  );
};

export default memo(Component);
