import {CloseCircleFilled, CloudUploadOutlined, DownOutlined, EditOutlined, LeftOutlined} from '@ant-design/icons';
import {Dispatch, DocumentHead} from '@elux/react-web';
import {Button, Dropdown, Input, Modal, Popover, Progress, Table, Upload, UploadProps} from 'antd';
import {FC, memo, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import LoadingPanel from '@/components/LoadingPanel';
import {GetActions, GetClientRouter, SiteInfo} from '@/Global';
import {downloadFile, getUploadProps, openDoc, replaceBaseUrl} from '@/utils/request';
import {message, useEvent} from '@/utils/tools';
import {DueDiligenceAPI} from '../../api';
import QuestionsFile from '../../components/QuestionsFile';
import TplSelect from '../../components/TplSelect';
import {DueConfigs, ItemDetail} from '../../entity';
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
  const [configs, setConfigs] = useState<DueConfigs>();
  const [uploading, setUploading] = useState<'upload' | 'info' | ''>('');
  const [showSupplementary, setShowSupplementary] = useState(false);
  const supplementaryRef = useRef<any>(null);
  const [showRename, setShowRename] = useState('');
  const [showQuestionsFile, setShowQuestionsFile] = useState<{id: string; question: string; answer: string}[]>();

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
          <div className="file-name" onClick={() => openDoc(item.id, true)}>
            <span className={'g-doc-icon t-' + item.type} />
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
              open={showRename === item.id}
              onOpenChange={(open) => {
                setShowRename(open ? item.id : '');
              }}
              content={
                <Input
                  allowClear
                  style={{width: '200px'}}
                  defaultValue={item.fileName}
                  onBlur={(e: any) => {
                    const value = e.target.value.trim();
                    if (value && value !== item.fileName) {
                      onRenameReport(item.id, e.target.value);
                    }
                  }}
                  onKeyDown={(e: any) => {
                    if (e.key === 'Enter') {
                      const value = e.target.value.trim();
                      if (value && value !== item.fileName) {
                        onRenameReport(item.id, e.target.value);
                      }
                    }
                  }}
                />
              }
            >
              <a>重命名</a>
            </Popover>
            <TplSelect list={configs!.template.list} value={{id: item.id, name: item.fileName}} onChange={onResetTemplate}>
              <a>更换模板</a>
            </TplSelect>
            <Dropdown
              menu={{
                onClick: ({key}: {key: string}) => {
                  downloadFile(replaceBaseUrl(`/api/deal/down?id=${item.id}&type=${key === '下载Word' ? 'word' : 'pdf'}`), item.fileName);
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
        <LeftOutlined onClick={() => GetClientRouter().back(1)} />
        <a onClick={() => GetClientRouter().back(1)}>尽调管理</a>
        <span>/</span>
        <a>尽调详情</a>
      </div>
      <div className="cd">
        <div className="title">{itemDetail.name}</div>
        <label>完成进度</label>
        <Progress percent={itemDetail.progress} strokeColor={twoColors} size={{height: 10}} showInfo={false} />
        <span>{`${itemDetail.progress}%`}</span>
      </div>
      <div className="bd">
        <Table rowKey="id" dataSource={TableSource} columns={TableColumns} pagination={false} />
      </div>
      <div className="ft">
        <div className="head">
          <span className="title">尽调资料</span>
          <div className="actions">
            <Upload showUploadList={false} {...uploadProps}>
              <Button loading={uploading === 'upload'} icon={<CloudUploadOutlined />}>
                上传文档
              </Button>
            </Upload>
            <Button icon={<EditOutlined />} onClick={() => setShowSupplementary(true)}>
              补充信息
            </Button>
          </div>
        </div>
        <div className="step">
          <div className="subject">书面资料</div>
          <div className="list">
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
          </div>
        </div>
        <div className="step">
          <div className="subject">访谈资料</div>
          <div className="list">
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
