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
import CollectIcon from '@/assets/images/collect.png';
import InterviewIcon from '@/assets/images/interview.png';
import ReportIcon from '@/assets/images/report.png';
import ReviewIcon from '@/assets/images/review.png';
import SiteIcon from '@/assets/images/site.png';
import SupIcon from '@/assets/images/sup.png';
import UploadIcon from '@/assets/images/upload.png';
import LoadingPanel from '@/components/LoadingPanel';
import {GetActions, GetClientRouter, SiteInfo, ApiBaseUrl} from '@/Global';
import {downloadFile, getUploadProps, replaceBaseUrl} from '@/utils/request';
import {message, showMask, useEvent, getToken} from '@/utils/tools';
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
  const [editSupplementaryItem, setEditSupplementaryItem] = useState<{id: string; fileName: string} | null>(null);
  const supplementaryRef = useRef<any>(null);
  const [showRename, setShowRename] = useState('');
  const [showQuestionsFile, setShowQuestionsFile] = useState<{id: string; question: string; answer: string}[]>();
  const [isResourcesCollapsed, setIsResourcesCollapsed] = useState(false); //上传企业资料
  const [isSupplementaryCollapsed, setIsSupplementaryCollapsed] = useState(false); //补充企业信息
  const [isInterviewCollapsed, setIsInterviewCollapsed] = useState(false);
  
  const [fileProgressMap, setFileProgressMap] = useState<Record<string, {progress: number; status: string}>>({});

  useEffect(() => {
    if (!itemDetail.id) return;
    const token = getToken();
    
    // 使用 replaceBaseUrl 获取包含正确环境配置的 websocket 路径，如 ws://113.44.121.105/report/ws/connect
    let wsUrl = replaceBaseUrl(`/ws/connect?dealInstId=${itemDetail.id}&token=${token}`);
    
    // 如果没有被替换（比如本地没有配置 /ws/ 前缀），则根据当前协议补全为绝对路径
    if (wsUrl.startsWith('/')) {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      wsUrl = `${protocol}//${host}${wsUrl}`;
    }

    let ws: WebSocket;
    let pingInterval: any;

    try {
      ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        pingInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send('ping');
          }
        }, 15000);
      };

      ws.onmessage = (event) => {
        if (event.data === 'pong') return;
        try {
          const data = JSON.parse(event.data);
          if (data.event === 'DEAL_FILE_PROGRESS' && data.files) {
            setFileProgressMap((prev) => {
              const newMap = { ...prev };
              let changed = false;
              data.files.forEach((f: any) => {
                if (
                  !newMap[f.id] ||
                  newMap[f.id].progress !== f.progress ||
                  newMap[f.id].status !== String(f.status)
                ) {
                  newMap[f.id] = {
                    progress: f.progress || 0,
                    status: String(f.status),
                  };
                  changed = true;
                }
              });
              return changed ? newMap : prev;
            });
          }
        } catch (e) {
          // ignore parse error
        }
      };

      ws.onclose = () => clearInterval(pingInterval);
      ws.onerror = () => clearInterval(pingInterval);
    } catch (e) {
      console.error('Failed to connect parsing WS:', e);
    }

    return () => {
      if (pingInterval) clearInterval(pingInterval);
      if (ws) ws.close();
    };
  }, [itemDetail.id]);

  const refreshPage = useCallback(() => {
    dispatch(dueDiligenceActions.fetchItem(itemDetail.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const uploadProps: UploadProps = useMemo(
    () =>
      getUploadProps('/api/deal/upload', {
        onProcess: () => setUploading('upload'),
        onSuccess: () => {
          setUploading('');
          refreshPage();
        },
        onError: () => setUploading(''),
        data: {id: itemDetail.id},
      }),
    [itemDetail.id, refreshPage]
  );

  const onSupplementarySubmit = useEvent(() => {
    const text = supplementaryRef.current.resizableTextArea.textArea.value.trim();
    if (text) {
      // 无论是新建还是编辑，都使用appendResource方法
      DueDiligenceAPI.appendResource(itemDetail.id, text).then(() => {
        setShowSupplementary(false);
        setEditSupplementaryItem(null);
        refreshPage();
      });
    }
  });

  // 打开编辑补充信息模态框
  const onEditSupplementary = useEvent((item: {id: string; fileName: string}) => {
    setEditSupplementaryItem(item);
    //TODO 获取文件内容
    DueDiligenceAPI.getResourceContent(item.id)
      .then((content: string) => {
        setShowSupplementary(true);
        // 延迟设置内容，确保DOM已渲染
        setTimeout(() => {
          if (supplementaryRef.current) {
            supplementaryRef.current.resizableTextArea.textArea.value = content;
          }
        }, 100);
      })
      .catch(() => {
        // 如果获取内容失败，使用文件名作为内容
        setShowSupplementary(true);
        setTimeout(() => {
          if (supplementaryRef.current) {
            supplementaryRef.current.resizableTextArea.textArea.value = item.fileName;
          }
        }, 100);
      });
  });

  // 关闭模态框时重置编辑状态
  const onCloseSupplementaryModal = useEvent(() => {
    setShowSupplementary(false);
    setEditSupplementaryItem(null);
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

  const onArchive = useEvent(() => {
    Modal.confirm({
      title: '记录归档',
      content: '是否确认对此次尽调记录进行归档？归档后本条尽调记录将被移动到"已归档"文件夹。',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        // 调用实际的归档API
        DueDiligenceAPI.archiveItem(itemDetail.id)
          .then(() => {
            message.success('归档成功！');
            // 返回列表页并切换到已归档标签
            const router = GetClientRouter();
            router.back(1);
            // 等待页面加载后再切换标签
            setTimeout(() => {
              // 触发切换到已归档状态
              dispatch(dueDiligenceActions.fetchList({status: 'end'}));
            }, 100);
          })
          .catch(() => {
            message.error('归档失败，请重试');
          });
      },
    });
  });

  const onRemoveResource = useEvent((id: string) => {
    DueDiligenceAPI.removeResourceFile(itemDetail.id, id).then(() => {
      message.success('删除成功！');
      refreshPage();
    });
  });

  const onRenameReport = useEvent((file: string, newName: string) => {
    DueDiligenceAPI.renameReport(itemDetail.id, file, newName).then(refreshPage);
    setShowRename('');
  });

  const onPreviewReport = useEvent(() => {
    if (itemDetail.report?.id) {
      DueDiligenceAPI.viewReportUrl(itemDetail.report.id, itemDetail.report.fileUrl).then((res) => {
        if (res.success && res.data) {
          window.open(res.data);
        } else {
          message.error(res.message || '获取预览地址失败');
        }
      });
    }
  });

  const onEditReport = useEvent(() => {
    if (itemDetail.report?.id) {
      DueDiligenceAPI.editReportUrl(itemDetail.report.id).then((res) => {
        if (res.success && res.data) {
          window.open(res.data);
        } else {
          message.error(res.message || '获取编辑地址失败');
        }
      });
    }
  });

  const onPreviewResource = useEvent((item: {id: string; fileUrl: string}) => {
    DueDiligenceAPI.viewReportUrl(item.id, item.fileUrl).then((res) => {
      if (res.success && res.data) {
        window.open(res.data);
      } else {
        message.error(res.message || '获取预览地址失败');
      }
    });
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
          <div className="file-name" onClick={() => onEditReport()}>
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
      <div className="process">
        <div className="title">尽调流程</div>
        <div className="box">
          <img src={CollectIcon} alt="CollectIcon" />
          <div className="row">
            <span className="title">收集企业资料</span>
            <span className="desc">快速上传或填基本信息</span>
          </div>
        </div>
        <div className="box">
          <img src={ReviewIcon} alt="CollectIcon" />
          <div className="row">
            <span className="title">AI智能审查</span>
            <span className="desc">自动分析资料识别访谈中重点</span>
          </div>
        </div>
        <div className="box">
          <img src={SiteIcon} alt="CollectIcon" />
          <div className="row">
            <span className="title">进行现场访谈</span>
            <span className="desc">高效访谈实时记录完整信息</span>
          </div>
        </div>
        <div className="box">
          <img src={ReportIcon} alt="CollectIcon" />
          <div className="row">
            <span className="title">生成专业报告</span>
            <span className="desc">自动整合内容生成报告</span>
          </div>
        </div>
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
              <Button color="primary" variant="outlined" onClick={onPreviewReport} disabled={!itemDetail.report?.id}>
                在线预览
              </Button>
              <Button color="primary" variant="outlined" onClick={onEditReport} disabled={!itemDetail.report?.id}>
                在线编辑
              </Button>
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
            {itemDetail.resources.map((item) => {
              const fileProgress = fileProgressMap[item.id];
              return (
                <div key={item.id} className={styles.file}>
                  <CloseCircleFilled className="close" onClick={() => onRemoveResource(item.id)} />
                  <div className="g-doc-icon" />
                  <div className="name" title={item.fileName} onClick={() => onPreviewResource(item)}>
                    {item.fileName}
                  </div>
                  <div className="info">{item.lastModifiedTime}</div>
                  {fileProgress && fileProgress.status !== '1' && (
                    <div className="progress-wrap" title={`解析状态: ${fileProgress.status === '3' ? '成功' : fileProgress.status === '4' ? '失败' : '解析中'}`}>
                      <Progress
                        type="circle"
                        percent={fileProgress.status === '3' ? 100 : Math.round(fileProgress.progress * 100)}
                        size={30}
                        status={fileProgress.status === '4' ? 'exception' : fileProgress.status === '3' ? 'success' : 'active'}
                      />
                    </div>
                  )}
                </div>
              );
            })}
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
                <div className="name" title={item.fileName} onClick={() => onEditSupplementary(item)}>
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
            现场访谈尽调
          </div>
          <div className={`interview ${isInterviewCollapsed ? 'collapsed' : ''}`}>
            <img src={InterviewIcon} alt="InterviewIcon" width={134} />
            <span className="text">请前往移动端(小狸AI)访谈录音并生成纪要！</span>
            {/* {itemDetail.interviewInstList.map((item) => (
              <div key={item.id} className={styles.file}>
                <CloseCircleFilled className="close" onClick={() => onRemoveResource(item.id)} />
                <div className={'g-doc-icon ' + item.type} />
                <div className="name" title={item.fileName} onClick={() => onOpenInterviewFile(item)}>
                  {item.fileName}
                </div>
                <div className="info">{item.lastModifiedTime}</div>
              </div>
            ))} */}
          </div>
        </div>
        {/* <div className="step">
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
        </div> */}
      </div>
      {showQuestionsFile && (
        <Modal title="问题清单" width={750} open={true} footer={null} onCancel={() => setShowQuestionsFile(undefined)}>
          <QuestionsFile value={showQuestionsFile} onChange={onQuestionsFileChange} />
        </Modal>
      )}
      {showSupplementary && (
        // <Modal title={editSupplementaryItem ? '编辑补充信息' : '补充信息'} width={650} open={true} footer={null} onCancel={onCloseSupplementaryModal}>
        <Modal
          title="补充信息"
          width={650}
          open={true}
          footer={null}
          onCancel={() => {
            setShowSupplementary(false);
            showMask(false);
          }}
          afterOpenChange={(open: boolean) => {
            showMask(open);
          }}
        >
          <div className={styles.info}>
            <div className="form">
              <Input.TextArea
                placeholder={editSupplementaryItem ? '请修改补充的文本信息' : '请输入您需要补充的文本信息,AI将自动为您分析'}
                rows={15}
                ref={supplementaryRef}
                defaultValue={editSupplementaryItem ? editSupplementaryItem.fileName : ''}
              />
            </div>
            <div className="actions">
              <Button type="primary" onClick={onSupplementarySubmit}>
                {editSupplementaryItem ? '确认修改' : '确认补充'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default memo(Component);
