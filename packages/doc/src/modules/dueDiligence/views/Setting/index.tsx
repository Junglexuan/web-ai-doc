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
import {DueConfigs, DueSettings} from '../../entity';
import styles from './index.module.less';

interface Props {}

const Component: FC<Props> = () => {
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
      <DocumentHead title={'尽调设置-' + SiteInfo.name} />
      <div className="hd">
        <h1>尽调设置</h1>
      </div>
      <div className="cd"></div>
      <div className="bd">
        <Form layout="vertical" preserve={false} form={form} initialValues={settings} onFinish={onSubmit}>
          <Form.Item name="role" label="常用角色">
            <Select options={configs.roles.list} />
          </Form.Item>
          <Form.Item label="常用尽调报告模板" name="template">
            <TplSelect list={configs.template.list} />
          </Form.Item>
          <Form.Item label="常用问题清单" name="questions">
            <Questions configs={configs.questions} />
          </Form.Item>
          {/* <Form.Item name="autoCreateFinalSheets" label={null} valuePropName="checked">
            <Checkbox>
              <div className="auto-create">
                <span>自动生成流动资金贷款测算表</span>
                <Tooltip title="勾选后，在您每次上传新资料时系统将为您自动生成新的测算表">
                  <QuestionCircleFilled style={{color: '#D9D9D9', marginLeft: '3px'}} />
                </Tooltip>
              </div>
            </Checkbox>
          </Form.Item> */}
        </Form>
        <div className="actions">
          <Button type="primary" onClick={() => form.submit()}>
            确定
          </Button>
        </div>
      </div>
    </div>
  );
};

export default memo(Component);
