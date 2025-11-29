import {CheckOutlined, CloseCircleFilled, LeftOutlined} from '@ant-design/icons';
import {Dispatch, DocumentHead} from '@elux/react-web';
import {Button, Form, Progress, Steps, Table, Upload} from 'antd';
import {FC, memo, useCallback, useEffect, useMemo, useState} from 'react';
import LoadingPanel from '@/components/LoadingPanel';
import UploadButton from '@/components/UploadButton';
import {GetActions, GetClientRouter, SiteInfo} from '@/Global';
import {message, useEvent} from '@/utils/tools';
import {DueDiligenceAPI} from '../../api';
import Questions from '../../components/Questions';
import TplSelect from '../../components/TplSelect';
import {DueConfigs, DueSettings, ItemDetail, StatusMap} from '../../entity';
import styles from './index.module.less';

const twoColors = {
  '0%': '#6C47EF',
  '100%': '#1B68FC',
};

const TableColumns: any = [
  {
    title: '名称',
    dataIndex: 'fileName',
    key: 'fileName',
    width: 500,
    render: (txt: string, item: any) => (
      <div>
        <span className={'g-doc-icon t-' + item.type} />
        {txt}
      </div>
    ),
  },
  {
    title: '文档字数',
    dataIndex: 'wordCount',
    key: 'wordCount',
  },
  {
    title: '所有者',
    dataIndex: 'address',
    key: 'address',
  },
  {
    title: '最后修改时间',
    dataIndex: 'updateTime',
    key: 'updateTime',
  },
  {
    title: '操作',
    dataIndex: 'id',
    key: 'id',
    render: (txt: string, item: any) => (
      <div className="actions">
        <a>立即生成</a>
        <a>预览</a>
      </div>
    ),
  },
];

interface Props {
  itemDetail: ItemDetail;
  dispatch: Dispatch;
}

const {dueDiligence: dueDiligenceActions} = GetActions('dueDiligence');

const Component: FC<Props> = ({itemDetail, dispatch}) => {
  const [configs, setConfigs] = useState<DueConfigs>();
  const [settings, setSettings] = useState<DueSettings>();
  const [form] = Form.useForm();

  const onSubmit = useEvent((data: DueSettings) => {
    DueDiligenceAPI.updateConfig(data).then(() => {
      message.success('修改成功！');
    });
  });

  const refreshPage = useCallback(() => {
    dispatch(dueDiligenceActions.fetchItem(itemDetail.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const TableSource = useMemo(() => {
    return itemDetail.report ? [itemDetail.report] : [itemDetail.reportTemplate];
  }, [itemDetail.report, itemDetail.reportTemplate]);

  const onRemoveResource = useCallback(
    (id: string) => {
      DueDiligenceAPI.removeResourceFile(id).then(refreshPage);
    },
    [refreshPage]
  );

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
        <LeftOutlined />
        <a onClick={() => GetClientRouter().back(1)}>尽调管理</a>
        <span>/</span>
        <a>尽调详情</a>
      </div>
      <div className="cd">
        <div className="title">{itemDetail.name}</div>
        <div className={'status s' + itemDetail.status}>{StatusMap[itemDetail.status]}</div>
        <label>完成进度</label>
        <Progress percent={itemDetail.progress} strokeColor={twoColors} size={{height: 10}} showInfo={false} />
        <span>{`${itemDetail.progress}%`}</span>
      </div>
      <div className="bd">
        <Table rowKey="id" dataSource={TableSource} columns={TableColumns} pagination={false} />
      </div>
      <div className="ft">
        <div className="title">尽调资料</div>
        <div className="step step1 on">
          <div className="subject">
            准备阶段
            <span className="step-icon">
              <CheckOutlined />
            </span>
          </div>
          <div className="list">
            {itemDetail.resources.map((item) => (
              <div key={item.id} className={styles.file}>
                <CloseCircleFilled className="close" onClick={() => onRemoveResource(item.id)} />
                <div className="g-doc-icon" />
                <div className="name" title={item.fileName}>
                  {item.fileName}
                </div>
                <div className="info">{item.updateTime}</div>
              </div>
            ))}
            <Upload showUploadList={false}>
              <UploadButton />
            </Upload>
          </div>
        </div>
        <div className="step step2">
          <div className="subject">
            访谈阶段
            <span className="step-icon">
              <CheckOutlined />
            </span>
          </div>
          <div className="list"></div>
        </div>
        <div className="step step3">
          <div className="subject">
            完善阶段
            <span className="step-icon">
              <CheckOutlined />
            </span>
          </div>
          <div className="list"></div>
        </div>
        <div className="step step4">
          <div className="subject">
            结束尽调
            <span className="step-icon">
              <CheckOutlined />
            </span>
          </div>
          <div className="list">
            <Button variant="outlined" color="primary">
              结束尽调
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(Component);
