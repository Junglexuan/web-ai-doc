import {QuestionCircleFilled} from '@ant-design/icons';
import {DocumentHead} from '@elux/react-web';
import {Button, Checkbox, Form, Select, Tooltip} from 'antd';
import {FC, memo, useEffect, useState} from 'react';
import LoadingPanel from '@/components/LoadingPanel';
import {SiteInfo} from '@/Global';
import {message, useEvent} from '@/utils/tools';
import {DueDiligenceAPI} from '../../api';
import Questions from '../../components/Questions';
import TplSelect from '../../components/TplSelect';
import {DueConfigs, DueSettings, ItemDetail} from '../../entity';
import styles from './index.module.less';

interface Props {
  itemDetail: ItemDetail;
}

const Component: FC<Props> = ({itemDetail}) => {
  const [configs, setConfigs] = useState<DueConfigs>();
  const [settings, setSettings] = useState<DueSettings>();
  const [form] = Form.useForm();

  const onSubmit = useEvent((data: DueSettings) => {
    DueDiligenceAPI.updateConfig(data).then(() => {
      message.success('修改成功！');
    });
  });

  useEffect(() => {
    DueDiligenceAPI.getConfigs().then((configs) => {
      setConfigs(configs);
      const {autoCreateFinalSheets, questions, template} = configs;
      setSettings({
        role: configs.roles.selected,
        questions: {
          tpl: questions.selected,
          list: questions.tpls.find((item) => item.value === questions.selected)?.list || [],
        },
        template: template.selected,
        autoCreateFinalSheets,
      });
    });
  }, []);

  if (!configs || !settings) {
    return (
      <div className={styles.root}>
        <LoadingPanel />
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <DocumentHead title={'尽调管理-' + SiteInfo.name} />
      <div className="hd">
        <h1>尽调设置</h1>
      </div>
      <div className="cd"></div>
      <div className="bd">fdsfsd</div>
    </div>
  );
};

export default memo(Component);
