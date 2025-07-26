import {FileProtectOutlined} from '@ant-design/icons';
import {DomEditor, IDomEditor} from '@wangeditor-next/editor';
import {Button, Form, Modal, Select} from 'antd';
import {FC, memo, useEffect, useMemo, useState} from 'react';
import {createPortal} from 'react-dom';
import {useEvent} from '@/utils/tools';
import {VariableElement} from '../elements/Variable/custom-types';
import VarLayer from '../VarLayer';
import styles from './index.module.less';
//import './registerMenu';

interface Props {
  editor: IDomEditor;
  onSubmit: (value: {type: string; stand: string}) => void;
}

const Component: FC<Props> = ({editor, onSubmit}) => {
  const [showModal, setShowModal] = useState(false);
  const [typeOptions, setTypeOptions] = useState<{label: string; value: string}[]>([{label: 'aaa', value: '111'}]);
  const [standOptions, setStandOptions] = useState<{label: string; value: string}[]>([{label: 'bbb', value: '222'}]);

  const onCancel = useEvent(() => {
    setShowModal(false);
  });

  const _onSubmit = useEvent((vals: any) => {
    onSubmit(vals);
    setShowModal(false);
  });

  useEffect(() => {}, []);

  return (
    <>
      <div className="w-e-bar-divider"></div>
      <Button disabled={editor.getConfig().readOnly} id="_ai_cont_button" className={styles.button} type="text" onClick={() => setShowModal(true)}>
        合同审查
      </Button>
      {showModal && (
        <Modal title="合同审查" width={400} open={true} footer={null} onCancel={onCancel}>
          <div className={styles.dialog}>
            <Form onFinish={_onSubmit}>
              <Form.Item label="合同类型" name="type" rules={[{required: true}]}>
                <Select options={typeOptions} />
              </Form.Item>
              <Form.Item label="审查立场" name="stand" rules={[{required: true}]}>
                <Select options={standOptions} />
              </Form.Item>
              <div className="footer">
                <Button htmlType="submit" type="primary">
                  开始审查
                </Button>
                <Button onClick={onCancel}>取消</Button>
              </div>
            </Form>
          </div>
        </Modal>
      )}
    </>
  );
};

export default memo(Component);
