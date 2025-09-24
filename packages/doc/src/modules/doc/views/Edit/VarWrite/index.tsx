import {IEditorConfig, IToolbarConfig} from '@wangeditor-next/editor';
import {Editor, Toolbar} from '@wangeditor-next/editor-for-react';
import {Button, Checkbox, Input, InputNumber} from 'antd';
import {FC, memo, useState} from 'react';
import {message, useEvent} from '@/utils/tools';
import {VariableElement} from '../elements/Variable/custom-types';
import ModelSelect from '../ModelSelect';
import styles from './index.module.less';
import type {IDomEditor} from '@wangeditor-next/editor';

const defaultConfig: Partial<IEditorConfig> = {
  scroll: false,
  hoverbarKeys: {
    text: {
      menuKeys: ['color', 'bgColor', 'bold', 'underline', 'through', 'italic', '|', 'clearStyle'],
    },
    line: {
      menuKeys: ['lineColor', 'lineWeight'],
    },
  },
};
const toolbarConfig: Partial<IToolbarConfig> = {
  toolbarKeys: [
    'headerSelect',
    'color',
    {
      key: 'group-more-style',
      title: '更多',
      iconSvg:
        '<svg viewBox="0 0 1024 1024"><path d="M707.872 484.64A254.88 254.88 0 0 0 768 320c0-141.152-114.848-256-256-256H192v896h384c141.152 0 256-114.848 256-256a256.096 256.096 0 0 0-124.128-219.36zM384 192h101.504c55.968 0 101.504 57.408 101.504 128s-45.536 128-101.504 128H384V192z m159.008 640H384v-256h159.008c58.464 0 106.016 57.408 106.016 128s-47.552 128-106.016 128z"></path></svg>',
      menuKeys: ['bold', 'underline', 'through', 'italic', 'sup', 'sub'], //, 'code'
    },
    'fontSize',
    'lineHeight',
    {
      key: 'group-justify',
      title: '对齐',
      iconSvg:
        '<svg viewBox="0 0 1024 1024"><path d="M768 793.6v102.4H51.2v-102.4h716.8z m204.8-230.4v102.4H51.2v-102.4h921.6z m-204.8-230.4v102.4H51.2v-102.4h716.8zM972.8 102.4v102.4H51.2V102.4h921.6z"></path></svg>',
      menuKeys: ['justifyLeft', 'justifyRight', 'justifyCenter', 'justifyJustify'],
    },
    'bulletedList',
    'numberedList',
    'line',
    'undo',
    'redo',
  ],
  // insertKeys: {
  //   index: 32,
  //   keys: ['_ai', '_outline'],
  // },
  // excludeKeys: ['fullScreen'],
};

export type DataSource = {
  field: string;
  prompt: string;
  remark?: string;
  demo?: string;
  model?: string;
  size?: number;
};

const TPL = '${AI.ASK(***)}';

const defaultDataSource: DataSource = {field: '', prompt: ''};

function matchValue(code: string): DataSource | undefined {
  const arr = code.match(/ASK\((.+)\)\}$/) || [];
  let args = arr[1]?.slice(1, -1) || '';
  if (args) {
    args = decodeURI(args);
    let value: any;
    try {
      value = JSON.parse(args);
    } catch (error) {
      value = undefined;
    }
    return value;
  }
  return undefined;
}

function formatValue(data: DataSource): string {
  if (data) {
    const value = JSON.stringify(data);
    return TPL.replace('(***)', `('${encodeURI(value)}')`);
  }
  return '';
}

interface Props {
  onCancel: () => void;
  onSubmit: (elem: VariableElement, update: Partial<VariableElement>) => void;
  elem: VariableElement;
}

const Component: FC<Props> = ({onSubmit, onCancel, elem}) => {
  const [dataSource, setDataSource] = useState(() => matchValue(elem.source) || defaultDataSource);
  const [editable, setEditable] = useState(elem.editable);
  const [editor, setEditor] = useState<IDomEditor>();

  const onCreated = useEvent((editor: IDomEditor) => {
    setEditor(editor);
    //editor.setHtml(source.html);
    //setTimeout(() => (window['tools'] = DomEditor.getToolbar(editor)));
  });

  const onEditorChange = useEvent((editor: IDomEditor) => {
    setDataSource({...dataSource, demo: editor.getHtml()});
  });

  const onOk = useEvent(() => {
    if (dataSource.prompt && dataSource.field) {
      onSubmit(elem, {source: formatValue(dataSource), info: dataSource.prompt, field: dataSource.field, editable});
    } else {
      message.error('请输入名称和AI提示词...');
    }
  });

  return (
    <div className={styles.root}>
      <h3 className="title">AI写作</h3>
      <Checkbox className="allowInput" checked={editable} onChange={(e) => setEditable(e.target.checked)}>
        用户可修改
      </Checkbox>
      <div className="hd">
        <div className="formItem">
          <div className="label">
            <em>*</em>
            <span>名称:</span>
          </div>
          <Input
            className="input"
            placeholder="给本词条取个标识名称..."
            value={dataSource.field}
            maxLength={15}
            onChange={(e) => setDataSource({...dataSource, field: e.target.value.trim()})}
          />
        </div>
        <div className="formItem">
          <div className="label">描述:</div>
          <Input
            className="input"
            placeholder="描述该词条的作用..."
            value={dataSource.remark}
            maxLength={50}
            onChange={(e) => setDataSource({...dataSource, remark: e.target.value.trim()})}
          />
        </div>
        <div className="inlineLayout">
          <div className="formItem">
            <div className="label">AI模型:</div>
            <ModelSelect value={dataSource.model} onChange={(e) => setDataSource({...dataSource, model: e})} />
          </div>
          <div className="formItem">
            <div className="label">字数限制:</div>
            <InputNumber min={1} value={dataSource.size} onChange={(e) => setDataSource({...dataSource, size: e || undefined})} />
          </div>
        </div>
      </div>
      <div className="bd">
        <div className="formPanel">
          <div className="label">
            <em>*</em>
            <span>AI提示词:</span>
          </div>
          <Input.TextArea
            placeholder="请输入AI提示词..."
            value={dataSource.prompt}
            rows={4}
            onChange={(e) => setDataSource({...dataSource, prompt: e.target.value})}
          />
        </div>
        <div className="formPanel">
          <div className="label">参考样例:</div>
          <div className="editor-bar">{editor && <Toolbar editor={editor} defaultConfig={toolbarConfig} mode="default" className="tools" />}</div>
          <div className="editor-text">
            <Editor defaultConfig={defaultConfig} onCreated={onCreated} defaultHtml={dataSource.demo} onChange={onEditorChange} mode="default" />
          </div>
        </div>
      </div>
      <div className="dialogFooter">
        <Button size="small" type="primary" onClick={onOk}>
          确定
        </Button>
        {/* <Button size="small" onClick={onOk}>
          格式
        </Button> */}
        <Button size="small" onClick={onCancel}>
          取消
        </Button>
      </div>
    </div>
  );
};

export default memo(Component);
