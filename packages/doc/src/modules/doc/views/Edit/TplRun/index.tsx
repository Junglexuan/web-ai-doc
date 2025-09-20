import {CaretRightOutlined} from '@ant-design/icons';
import {Button} from 'antd';
import {FC, memo, useState} from 'react';
import Wizard, {WizardFormData} from '@/modules/doc/views/Wizard';
import {openArticle, useEvent} from '@/utils/tools';
import {DocAPI} from '../../../api';
//import './registerMenu';

interface Props {
  tpl: {id: string; format?: string};
  // onSubmit: (value: {type: string; stand: string}) => void;
}

const Component: FC<Props> = ({tpl}) => {
  const [wizardData, setWizardData] = useState<WizardFormData>();

  const onCreateByTpl = useEvent((tplId: string, fields?: {[field: string]: string}) => {
    if (tpl.format === '2') {
      alert('生成word文档');
    } else {
      DocAPI.createSnapshot({tplId}, 'doc').then(async ({id}) => {
        window.sessionStorage.setItem('__temp_tpl__', JSON.stringify({id: tplId, fields}));
        openArticle(`/admin/doc/item/edit/${id}?&tpl=${tplId}&preview=1&__c=_dialog`);
      });
    }
  });

  const onApplyTpl = useEvent((tplId: string) => {
    DocAPI.getTplFields(tplId).then((fields) => {
      if (fields.length) {
        setWizardData({tplId, fields});
      } else {
        onCreateByTpl(tplId);
      }
    });
  });

  const onWizardSubmit = useEvent((tplId: string, fields: {[field: string]: string}) => {
    setWizardData(undefined);
    onCreateByTpl(tplId, fields);
  });

  return (
    <>
      <Button
        size="small"
        variant="outlined"
        color="primary"
        style={{marginLeft: '10px'}}
        icon={<CaretRightOutlined style={{marginRight: '-5px'}} />}
        onClick={() => onApplyTpl(tpl.id)}
      >
        试运行
      </Button>
      {wizardData && <Wizard data={wizardData} onCancel={() => setWizardData(undefined)} onSubmit={onWizardSubmit} />}
    </>
  );
};

export default memo(Component);
