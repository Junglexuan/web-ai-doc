import {
  CaretDownOutlined,
  CaretUpOutlined,
  ClockCircleOutlined,
  CloseCircleFilled,
  CloudUploadOutlined,
  DownOutlined,
  EditOutlined,
  FileOutlined,
  LeftOutlined,
  ProfileOutlined,
  ProjectOutlined,
  RocketOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {Dispatch, DocumentHead} from '@elux/react-web';
import {Button, Dropdown, Input, Modal, Popover, Progress, Table, Upload, UploadProps} from 'antd';
import {FC, memo, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import SupIcon from '@/assets/images/sup.png';
import UploadIcon from '@/assets/images/upload.png';
import LoadingPanel from '@/components/LoadingPanel';
import {GetActions, GetClientRouter, SiteInfo} from '@/Global';
import {downloadFile, getUploadProps, openDoc, replaceBaseUrl} from '@/utils/request';
import {message, useEvent} from '@/utils/tools';
import {DueDiligenceAPI} from '../../api';
import QuestionsFile from '../../components/QuestionsFile';
import TplSelect from '../../components/TplSelect';
import {DueConfigs, ItemDetail, StatusMap} from '../../entity';
import styles from './index.module.less';

const twoColors = {
  '0%': '#6C47EF',
  '100%': '#1B68FC',
};

interface Props {
  itemDetail: ItemDetail;
  dispatch: Dispatch;
}

const {dueDiligence: dueDiligenceActions} = GetActions('dueDiligence');

const Component: FC<Props> = ({itemDetail, dispatch}) => {
  console.log('itemDetail: Item=', itemDetail);
  const [configs, setConfigs] = useState<DueConfigs>();
  const [uploading, setUploading] = useState<'upload' | 'info' | ''>('');
  const [showSupplementary, setShowSupplementary] = useState(false);
  const supplementaryRef = useRef<any>(null);
  const [showRename, setShowRename] = useState('');
  const [showQuestionsFile, setShowQuestionsFile] = useState<{id: string; question: string; answer: string}[]>();
  const [isResourcesCollapsed, setIsResourcesCollapsed] = useState(false);
  const [isSupplementaryCollapsed, setIsSupplementaryCollapsed] = useState(false);
  const [isInterviewCollapsed, setIsInterviewCollapsed] = useState(false);

  const refreshPage = useCallback(() => {
    dispatch(dueDiligenceActions.fetchItem(itemDetail.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const uploadProps: UploadProps = useMemo(
    () =>
      getUploadProps(`/api/deal/upload/${itemDetail.id}`, {
        onProcess: () => setUploading('upload'),
        onSuccess: (file, res) => {
          setUploading('');
          refreshPage();
        },
        onError: () => setUploading(''),
      }),
    [itemDetail.id, refreshPage]
  );

  const onSupplementarySubmit = useEvent(() => {
    const text = supplementaryRef.current.resizableTextArea.textArea.value.trim();
    if (text) {
      DueDiligenceAPI.appendResource(itemDetail.id, text).then(() => {
        setShowSupplementary(false);
        refreshPage();
      });
    }
  });

  const onRebuildReport = useEvent(() => {
    DueDiligenceAPI.rebuildReport(itemDetail.id).then(() => {
      refreshPage();
      message.success('操作成功！');
    });
  });

  const onResetTemplate = useEvent((tpl: {id: string} | undefined) => {
    if (tpl?.id) {
      DueDiligenceAPI.resetTemplate(itemDetail.id, tpl.id).then(() => {
        refreshPage();
        message.success('操作成功！');
      });
    }
  });

  const onArchive = useEvent(() => {});

  const onRemoveResource = useEvent((id: string) => {
    DueDiligenceAPI.removeResourceFile(id).then(refreshPage);
  });

  const onRenameReport = useEvent((file: string, newName: string) => {
    DueDiligenceAPI.renameReport(itemDetail.id, file, newName).then(refreshPage);
    setShowRename('');
  });

  const onOpenInterviewFile = useEvent((file: {fileName: string; fileUrl: string; type: string}) => {
    if (file.type === 'wav') {
      window.open(file.fileUrl);
    } else if (file.type === 'list') {
      setShowQuestionsFile(file.fileUrl ? JSON.parse(file.fileUrl) : []);
    }
  });

  const onQuestionsFileChange = useEvent(() => {});

  const TableColumns = useMemo(
    () => [
      {
        title: '名称',
        dataIndex: 'fileName',
        key: 'fileName',
        width: 700,
        render: (txt: string, item: any) => (
          <div className="file-name" onClick={() => openDoc(item?.id, true)}>
            <span className={'g-doc-icon t-' + item?.type} />
            {txt}
          </div>
        ),
      },
      // {
      //   title: '文档字数',
      //   dataIndex: 'wordCount',
      //   key: 'wordCount',
      // },
      // {
      //   title: '所有者',
      //   dataIndex: 'address',
      //   key: 'address',
      // },
      {
        title: '最后修改时间',
        dataIndex: 'lastModifiedTime',
        key: 'lastModifiedTime',
      },
      {
        title: '操作',
        dataIndex: 'id',
        key: 'id',
        render: (txt: string, item: any) => (
          <div className="actions">
            <a onClick={onRebuildReport}>重新生成</a>
            <Popover
              trigger="click"
              destroyOnHidden
              open={showRename === (item?.id || txt)}
              onOpenChange={(open) => {
                setShowRename(open ? item.id : '');
              }}
              content={
                <Input
                  allowClear
                  style={{width: '200px'}}
                  defaultValue={item?.fileName}
                  onBlur={(e: any) => {
                    const value = e.target.value.trim();
                    if (value && value !== item?.fileName) {
                      onRenameReport(item.id, e.target.value);
                    }
                  }}
                  onKeyDown={(e: any) => {
                    if (e.key === 'Enter') {
                      const value = e.target.value.trim();
                      if (value && value !== item?.fileName) {
                        onRenameReport(item.id, e.target.value);
                      }
                    }
                  }}
                />
              }
            >
              <a>重命名</a>
            </Popover>
            <TplSelect list={configs!.template.list} value={{id: item?.id, name: item?.fileName}} onChange={onResetTemplate}>
              <a>更换模板</a>
            </TplSelect>
            <Dropdown
              menu={{
                onClick: ({key}: {key: string}) => {
                  downloadFile(replaceBaseUrl(`/api/deal/down?id=${item?.id}&type=${key === '下载Word' ? 'word' : 'pdf'}`), item?.fileName);
                },
                items: [
                  {
                    key: '下载Word',
                    label: '下载Word',
                  },
                  {
                    key: '下载PDF',
                    label: '下载PDF',
                  },
                ],
              }}
            >
              <a>
                更多 <DownOutlined style={{fontSize: 12}} />
              </a>
            </Dropdown>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [configs, showRename]
  );

  const TableSource = useMemo(() => {
    return [itemDetail.report];
  }, [itemDetail.report]);

  useEffect(() => {
    DueDiligenceAPI.getConfigs().then(setConfigs);
  }, []);

  if (!configs) {
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
        <div className="back">
          <LeftOutlined onClick={() => GetClientRouter().back(1)} />
          <a onClick={() => GetClientRouter().back(1)}>尽调管理</a>
          <span>/</span>
          <a>尽调详情</a>
        </div>
        <Button className="archiveBtn" onClick={onArchive} icon={<FileOutlined />} color="primary" variant="outlined">
          归档
        </Button>
      </div>
      <div className="cd">
        {/* <div className="title">{itemDetail.name}</div>
        <label>完成进度</label>
        <Progress percent={itemDetail.progress} strokeColor={twoColors} size={{height: 10}} showInfo={false} />
        <span>{`${itemDetail.progress}%`}</span> */}
        <div className="top">
          <div className="left">
            <img className="icon" src={itemDetail.logo} />
            <div className="cont">
              <div className="title">{itemDetail.name}</div>
              <div className="progress">
                <label className="label">完成进度</label>
                <div className="hor">
                  <Progress percent={itemDetail.progress} strokeColor={twoColors} size={{height: 10}} showInfo={false} />
                  <span>{`${itemDetail.progress}%`}</span>
                </div>
              </div>
            </div>
            <div className="mask">
              <Button type="primary" className="mask_btn" onClick={onRebuildReport}>
                立即生成
              </Button>
            </div>
          </div>
          <div className="center">
            <div className="top">
              <div className="title">报告详细信息</div>
              <div className="template">
                <ClockCircleOutlined />
                <span>最后修改时间：</span>
                <span>{itemDetail.report?.lastModifiedTime}</span>
              </div>
              <div className="template">
                <ProjectOutlined />
                <span>生成模板：</span>
                <span>{itemDetail.report?.fileName || ''}</span>
              </div>
              <div className="template">
                <ProfileOutlined />
                <span>报告字数：</span>
                <span>{`${itemDetail.report?.total || 0}字`}</span>
              </div>
              <div className="template">
                <UserOutlined />
                <span>报告所有人：</span>
                <span>{itemDetail.report?.owner || ''}</span>
              </div>
            </div>
            <div className="btns">
              <Button color="primary" variant="outlined" onClick={onRebuildReport} disabled={!itemDetail.report?.id}>
                重新生成
              </Button>
              <Button
                color="primary"
                variant="outlined"
                onClick={() =>
                  downloadFile(replaceBaseUrl(`/api/deal/down?id=${itemDetail.report?.id}&type=word`), itemDetail.report?.fileName || '')
                }
                disabled={!itemDetail.report?.id}
              >
                下载WORD
              </Button>
              <Button
                color="primary"
                variant="outlined"
                onClick={() => downloadFile(replaceBaseUrl(`/api/deal/down?id=${itemDetail.report?.id}&type=pdf`), itemDetail.report?.fileName || '')}
                disabled={!itemDetail.report?.id}
              >
                下载PDF
              </Button>
              <Button color="primary" variant="outlined" disabled={!itemDetail.report?.id}>
                历史记录
              </Button>
            </div>
          </div>
          <div className="right">
            <TplSelect
              list={configs!.template.list}
              value={{id: itemDetail.report?.id, name: itemDetail.report?.fileName}}
              onChange={onResetTemplate}
            >
              <Button color="primary" variant="outlined">
                更换模板
              </Button>
            </TplSelect>
          </div>
        </div>
      </div>
      {/* <div className="bd">
        <Table rowKey="id" dataSource={TableSource} columns={TableColumns} pagination={false} />
      </div> */}
      <div className="ft">
        <div className="head">
          <span className="title">尽调资料</span>
        </div>
        <div className="step">
          <div className="subject" onClick={() => setIsResourcesCollapsed(!isResourcesCollapsed)}>
            <div className="collapse-icon">{isResourcesCollapsed ? <CaretDownOutlined /> : <CaretUpOutlined />}</div>
            上传企业资料
          </div>
          <div className={`list ${isResourcesCollapsed ? 'collapsed' : ''}`}>
            {itemDetail.resources.map((item) => (
              <div key={item.id} className={styles.file}>
                <CloseCircleFilled className="close" onClick={() => onRemoveResource(item.id)} />
                <div className="g-doc-icon" />
                <div className="name" title={item.fileName} onClick={() => openDoc(item.id)}>
                  {item.fileName}
                </div>
                <div className="info">{item.lastModifiedTime}</div>
              </div>
            ))}
            <Upload showUploadList={false} {...uploadProps}>
              <div className={styles.fileUpload}>
                <img src={UploadIcon} alt="上传文件" />
                <span style={{color: '#2A62FA'}}>上传文件</span>
              </div>
            </Upload>
          </div>
        </div>
        <div className="step">
          <div className="subject" onClick={() => setIsSupplementaryCollapsed(!isSupplementaryCollapsed)}>
            <div className="collapse-icon">{isSupplementaryCollapsed ? <CaretDownOutlined /> : <CaretUpOutlined />}</div>
            补充企业资料
          </div>
          <div className={`list ${isSupplementaryCollapsed ? 'collapsed' : ''}`}>
            {itemDetail.supplementary.map((item) => (
              <div key={item.id} className={styles.file}>
                <CloseCircleFilled className="close" onClick={() => onRemoveResource(item.id)} />
                <div className="g-doc-icon" />
                <div className="name" title={item.fileName} onClick={() => openDoc(item.id)}>
                  {item.fileName}
                </div>
                <div className="info">{item.lastModifiedTime}</div>
              </div>
            ))}
            <div className={styles.fileUpload} onClick={() => setShowSupplementary(true)}>
              <img src={SupIcon} alt="补充信息" />
              <span style={{color: '#2A62FA'}}>补充信息</span>
            </div>
          </div>
        </div>
        <div className="step">
          <div className="subject" onClick={() => setIsInterviewCollapsed(!isInterviewCollapsed)}>
            <div className="collapse-icon">{isInterviewCollapsed ? <CaretDownOutlined /> : <CaretUpOutlined />}</div>
            访谈资料
          </div>
          <div className={`list ${isInterviewCollapsed ? 'collapsed' : ''}`}>
            {itemDetail.interviewInstList.map((item) => (
              <div key={item.id} className={styles.file}>
                <CloseCircleFilled className="close" onClick={() => onRemoveResource(item.id)} />
                <div className={'g-doc-icon ' + item.type} />
                <div className="name" title={item.fileName} onClick={() => onOpenInterviewFile(item)}>
                  {item.fileName}
                </div>
                <div className="info">{item.lastModifiedTime}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {showQuestionsFile && (
        <Modal title="问题清单" width={750} open={true} footer={null} onCancel={() => setShowQuestionsFile(undefined)}>
          <QuestionsFile value={showQuestionsFile} onChange={onQuestionsFileChange} />
        </Modal>
      )}
      {showSupplementary && (
        <Modal title="补充信息" width={650} open={true} footer={null} onCancel={() => setShowSupplementary(false)}>
          <div className={styles.info}>
            <div className="form">
              <Input.TextArea placeholder="输入补充信息..." rows={15} ref={supplementaryRef} />
            </div>
            <div className="actions">
              <Button type="primary" onClick={onSupplementarySubmit}>
                确认补充
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default memo(Component);
