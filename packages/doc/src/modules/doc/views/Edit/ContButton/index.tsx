import {FileProtectOutlined} from '@ant-design/icons';
import {DomEditor, IDomEditor} from '@wangeditor-next/editor';
import {Button, Form, Modal, Select} from 'antd';
import {FC, memo, useEffect, useMemo, useState} from 'react';
import {createPortal} from 'react-dom';
import Inspect from '@/assets/images/Inspect';
import {useEvent} from '@/utils/tools';
import {DocAPI} from '../../../api';
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
  const [typeOptions, setTypeOptions] = useState<{label: string; value: string}[]>([]);

  const onCancel = useEvent(() => {
    setShowModal(false);
  });

  const _onSubmit = useEvent((vals: any) => {
    const {type, stand} = vals;
    onSubmit({type, stand: stand[0]});
    setShowModal(false);
  });

  useEffect(() => {
    DocAPI.getTplsOptions('conts').then((cates) => {
      setTypeOptions(cates);
    });
  }, []);

  return (
    <>
      <div className="w-e-bar-divider"></div>
      <Button
        disabled={editor.getConfig().readOnly}
        id="_ai_cont_button"
        icon={<Inspect />}
        className={styles.button}
        type="text"
        onClick={() => setShowModal(true)}
      >
        合同审查
      </Button>
      {showModal && (
        <Modal title="合同审查" width={400} open={true} footer={null} onCancel={onCancel}>
          <div className={styles.dialog}>
            <Form onFinish={_onSubmit}>
              <Form.Item label="合同类型" name="type" rules={[{required: true}]}>
                <Select options={typeOptions} placeholder="请选择合同类型" />
              </Form.Item>
              <Form.Item label="审查立场" name="stand" rules={[{required: true}]}>
                <Select placeholder="请选择或输入合同立场" mode="tags" maxCount={1} options={[{value: '甲方'}, {value: '乙方'}]} />
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
