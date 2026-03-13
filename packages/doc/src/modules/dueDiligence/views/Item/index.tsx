import {
  CaretDownOutlined,
  CaretRightOutlined,
  CaretUpOutlined,
  CheckCircleFilled,
  ClockCircleOutlined,
  CloseCircleFilled,
  CloudUploadOutlined,
  DownOutlined,
  EditOutlined,
  ExclamationCircleFilled,
  FileOutlined,
  LeftOutlined,
  ProfileOutlined,
  ProjectOutlined,
  RedoOutlined,
  RocketOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {Dispatch, DocumentHead} from '@elux/react-web';
import {Button, Dropdown, Input, Modal, Popover, Progress, Table, Tooltip, Upload, UploadProps} from 'antd';
import {FC, memo, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import CollectIcon from '@/assets/images/collect.png';
import InterviewIcon from '@/assets/images/interview.png';
import ReportIcon from '@/assets/images/report.png';
import ReviewIcon from '@/assets/images/review.png';
import SiteIcon from '@/assets/images/site.png';
import SupIcon from '@/assets/images/sup.png';
import UploadIcon from '@/assets/images/upload.png';
import AudioPlayerModal from '@/components/AudioPlayerModal';
import InterviewDetailModal from '@/components/InterviewDetailModal';
import LoadingPanel from '@/components/LoadingPanel';
import {GetActions, GetClientRouter, SiteInfo} from '@/Global';
import request, {downloadFile, downloadPdfFromWord, getUploadProps, openDoc, replaceBaseUrl} from '@/utils/request';
import {getToken, message, showMask, useEvent} from '@/utils/tools';
import {DueDiligenceAPI} from '../../api';
import QuestionsFile from '../../components/QuestionsFile';
import TplSelect from '../../components/TplSelect';
import {DealReportStatusEnum, DueConfigs, InterviewInstDetail, InterviewRecord, ItemDetail, StatusMap} from '../../entity';
import styles from './index.module.less';

const twoColors = {
  '0%': '#4f46e5',
  '100%': '#818cf8',
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
  const [editSupplementaryItem, setEditSupplementaryItem] = useState<{id: string; fileName: string; fileUrl?: string} | null>(null);
  const [showRename, setShowRename] = useState('');
  const [showQuestionsFile, setShowQuestionsFile] = useState<{id: string; question: string; answer: string}[]>();
  const [isResourcesCollapsed, setIsResourcesCollapsed] = useState(false); //上传企业资料
  const [isSupplementaryCollapsed, setIsSupplementaryCollapsed] = useState(false); //补充企业信息
  const [isInterviewCollapsed, setIsInterviewCollapsed] = useState(false);
  const [reportPolling, setReportPolling] = useState(false);
  const [isSummaryCollapsed, setIsSummaryCollapsed] = useState(true);
  const [hasSummaryMore, setHasSummaryMore] = useState(false);
  const summaryContentRef = useRef<HTMLDivElement>(null);
  const currentTemplateName = useMemo(() => {
    return configs?.template.list.find((t) => String(t.id) === String(itemDetail.templateId))?.title || '-';
  }, [configs, itemDetail.templateId]);

  const isReportGenerated = itemDetail.reportStatus === DealReportStatusEnum.REPORT_GENERATED;

  const [fileProgressMap, setFileProgressMap] = useState<Record<string, {progress: number; status: string}>>({});
  console.log('fileProgressMap', fileProgressMap);
  const [interviewList, setInterviewList] = useState<InterviewRecord[]>([]);
  const [interviewDetailModal, setInterviewDetailModal] = useState<{visible: boolean; record: InterviewInstDetail | null}>({
    visible: false,
    record: null,
  });

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
              const newMap = {...prev};
              let changed = false;
              data.files.forEach((f: any) => {
                if (!newMap[f.id] || newMap[f.id].progress !== f.progress || newMap[f.id].status !== String(f.status)) {
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

  const [supplementaryContent, setSupplementaryContent] = useState('');

  const [audioPlayer, setAudioPlayer] = useState<{visible: boolean; url: string; fileName: string}>({
    visible: false,
    url: '',
    fileName: '',
  });

  const isAudioFile = (name: string) => {
    return /\.(wav|mp3|m4a|aac|flac|amr|3gp|ogg)$/i.test(name);
  };

  const onFileClick = useEvent((e: React.MouseEvent<any>, item: {id: string; fileName: string; fileUrl: string; type?: string}) => {
    if (!e.currentTarget.contains(e.target as Node)) return;
    onPreviewResource(item);
  });

  const refreshPage = useCallback(() => {
    dispatch(dueDiligenceActions.fetchItem(itemDetail.id));
    if (itemDetail.id) {
      DueDiligenceAPI.queryInterviewInstListByPage(itemDetail.id).then(setInterviewList);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemDetail.id]);

  const uploadProps: UploadProps = useMemo(() => {
    const props = getUploadProps('/api/deal/upload', {
      onProcess: () => setUploading('upload'),
      data: {id: itemDetail.id},
      accept: '.docx,.pdf,.xlsx,.txt,.wav,.mp3,.m4a,.amr,.aac,.ogg,.flac,.png,.jpg,.jpeg',
    });

    const originalOnChange = props.onChange;
    props.onChange = (info: any) => {
      const {fileList} = info;
      const isAnyUploading = fileList.some((f: any) => f.status === 'uploading');
      if (isAnyUploading) {
        setUploading('upload');
      } else {
        const allFinished = fileList.every((f: any) => f.status === 'done' || f.status === 'error');
        if (allFinished) {
          setUploading('');
          refreshPage();
        }
      }
      originalOnChange?.(info);
    };
    return props;
  }, [itemDetail.id, refreshPage]);

  useEffect(() => {
    const checkOverflow = () => {
      if (summaryContentRef.current) {
        const element = summaryContentRef.current;
        // 存储当前样式以备还原
        const oldStyle = element.getAttribute('style') || '';

        // 强制进入单行显示模式进行测量
        element.style.display = '-webkit-box';
        element.style.webkitLineClamp = '1';
        element.style.webkitBoxOrient = 'vertical';
        element.style.maxHeight = 'none';
        element.style.overflow = 'hidden';

        // scrollHeight 是完整内容高度，clientHeight 是单行高度
        const isOverflow = element.scrollHeight > element.clientHeight + 4;
        setHasSummaryMore(isOverflow);

        // 还原原始样式
        element.setAttribute('style', oldStyle);
      }
    };

    // 延迟多次执行，确保在内容加载、字体渲染、容器宽度稳定后均能准确捕捉
    checkOverflow();
    const timers = [setTimeout(checkOverflow, 100), setTimeout(checkOverflow, 500), setTimeout(checkOverflow, 1000)];

    window.addEventListener('resize', checkOverflow);

    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener('resize', checkOverflow);
    };
  }, [itemDetail.dealSummary]);

  const onSupplementarySubmit = useEvent(() => {
    const text = supplementaryContent.trim();
    if (!text) {
      message.warning('请输入补充信息');
      return;
    }
    // 无论是新建还是编辑，都使用appendResource方法
    DueDiligenceAPI.appendResource(itemDetail.id, text).then(() => {
      onCloseSupplementaryModal();
      refreshPage();
    });
  });

  // 打开编辑补充信息模态框
  const onEditSupplementary = useEvent((e: React.MouseEvent<any>, item: {id: string; fileName: string; fileUrl?: string}) => {
    if (!e.currentTarget.contains(e.target as Node)) return;

    if (item.fileName && isAudioFile(item.fileName) && item.fileUrl) {
      showMask(true);
      setAudioPlayer({visible: true, url: replaceBaseUrl(item.fileUrl), fileName: item.fileName});
      return;
    }

    setEditSupplementaryItem(item);
    showMask(true);
    setShowSupplementary(true);
    setSupplementaryContent(''); // 开启时先清空上次内容，等待加载

    if (item.fileUrl) {
      // 请求 fileUrl 并在返回结果后填充弹窗
      fetch(item.fileUrl)
        .then((res) => res.text())
        .then((content) => {
          setSupplementaryContent(content);
        })
        .catch(() => {
          message.error('获取补充信息内容失败');
        });
    } else {
      setSupplementaryContent('');
    }
  });

  // 关闭模态框时重置编辑状态
  const onCloseSupplementaryModal = useEvent(() => {
    setShowSupplementary(false);
    setEditSupplementaryItem(null);
    setSupplementaryContent('');
    showMask(false);
  });

  const onRebuildReport = useEvent(() => {
    Modal.confirm({
      title: '确认生成报告？',
      centered: true,
      width: 480,
      okText: '确认',
      cancelText: '取消',
      afterOpenChange: (open) => showMask(open),
      content: (
        <div style={{color: 'rgba(0, 0, 0, 0.45)', fontSize: '14px', lineHeight: '1.6'}}>
          <p style={{marginBottom: '16px', color: 'rgba(0, 0, 0, 0.65)'}}>系统将根据当前尽调资料、访谈录音和报告模板生成尽调报告（由AI自动生成）</p>
          <p style={{fontSize: '13px'}}>
            小狸报告将使用通义千问 AI 技术为您处理音频图像和文件。点击确认即代表您授权我们将相关素材加密传输至 AI 服务商进行内容识别及报告生成
          </p>
        </div>
      ),
      onOk: () => {
        setReportPolling(true);
        DueDiligenceAPI.rebuildReport(itemDetail.id)
          .then(() => {
            refreshPage();
            message.success('报告生成任务已启动，请稍候...');
          })
          .catch(() => {
            setReportPolling(false);
          });
      },
    });
  });

  // 轮询报告状态
  useEffect(() => {
    let timer: any;
    // 当状态是生成中，或者用户点击了立即生成且此时reportPolling为true，则开启轮询
    if (reportPolling || itemDetail.reportStatus === DealReportStatusEnum.REPORT_GENERATING) {
      if (!reportPolling) setReportPolling(true);
      timer = setInterval(() => {
        DueDiligenceAPI.getItem(itemDetail.id).then((newDetail) => {
          dispatch(dueDiligenceActions.putCurrentItem(itemDetail.id, newDetail));
          // 如果后端返回的状态已生成或失败，则结束轮询
          if (newDetail.reportStatus === DealReportStatusEnum.REPORT_GENERATED || newDetail.reportStatus === DealReportStatusEnum.REPORT_FAILED) {
            setReportPolling(false);
            clearInterval(timer);
            if (newDetail.reportStatus === DealReportStatusEnum.REPORT_GENERATED) {
              message.success('报告已顺利生成！');
            } else {
              message.error('报告生成失败，请重试');
            }
          }
        });
      }, 3000);
    } else {
      setReportPolling(false);
    }
    return () => timer && clearInterval(timer);
  }, [itemDetail.id, itemDetail.reportStatus, dispatch, reportPolling]);

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
      title: '尽调归档',
      content: '请确认所有访谈工作已完成。归档后仅支持查看和导出报告，不再支持编辑。',
      okText: '确认归档',
      cancelText: '暂不归档',
      afterOpenChange: (open) => showMask(open),
      onOk: () => {
        // 调用实际的归档API
        DueDiligenceAPI.archiveItem(itemDetail.id).then(() => {
          message.success('归档成功！');
          // 返回列表页并切换到已归档标签
          const router = GetClientRouter();
          router.push({url: '/admin/dueDiligence/list/maintain?status=end'});
        });
      },
    });
  });

  const onRemoveResource = useEvent((id: string) => {
    Modal.confirm({
      title: '确认删除',
      centered: true,
      okText: '确认',
      cancelText: '取消',
      content: '确定要删除该资料吗？此操作无法撤销。',
      afterOpenChange: (open) => showMask(open),
      onOk: () => {
        DueDiligenceAPI.removeResourceFile(itemDetail.id, id).then(() => {
          message.success('删除成功！');
          if (editSupplementaryItem?.id === id) {
            onCloseSupplementaryModal();
          }
          refreshPage();
        });
      },
    });
  });

  const onRefreshSummary = useEvent(async () => {
    try {
      message.loading({content: '总结提炼中...', key: 'refreshSummary'});
      await DueDiligenceAPI.refreshSummary(itemDetail.id);
      message.success({content: '提炼完成', key: 'refreshSummary'});
      refreshPage();
    } catch (e: any) {
      // 错误已由 request 拦截器处理
    }
  });

  const onRenameReport = useEvent((fileId: string, fileName: string) => {
    const specialChars = /[<>?/\\|*]/;
    if (specialChars.test(fileName)) {
      message.error('名称不能包含特殊字符: <>?/|\\*');
      return;
    }
    if (/\.\./.test(fileName)) {
      message.error('名称不能包含连续的点');
      return;
    }
    DueDiligenceAPI.renameReport(itemDetail.id, fileId, fileName).then(refreshPage);
    setShowRename('');
  });

  const onReparseFile = useEvent((fileId: string) => {
    DueDiligenceAPI.reparseFile(itemDetail.id, fileId).then(() => {
      message.success('重新解析已触发');
      refreshPage();
    });
  });

  const onOpenInterviewDetail = useEvent((e: React.MouseEvent<any>, item: InterviewRecord) => {
    if (!e.currentTarget.contains(e.target as Node)) return;
    // 打开访谈详情弹框
    showMask(true);
    DueDiligenceAPI.getInterviewInstDetail(item.interviewInstId)
      .then((detail) => {
        setInterviewDetailModal({
          visible: true,
          record: {
            ...detail,
            interviewCust: detail.interviewCust || item.interviewCust,
            questionInstList:
              detail.questionInstList?.length > 0
                ? detail.questionInstList
                : (itemDetail.questionInfoList || []).map((q) => ({
                    id: q.id,
                    questionName: q.questionName,
                    questionAnswer: q.questionAnswer,
                    hitTime: q.hitTime,
                    CHECKED: q.CHECKED,
                  })),
          },
        });
      })
      .catch(() => {
        // 降级：若详情接口不可用，则用列表中已有信息构造 record 并打开
        setInterviewDetailModal({
          visible: true,
          record: {
            interviewInstId: item.interviewInstId,
            interviewInstTitle: item.interviewInstTitle || item.interviewCust || '访谈录音',
            interviewCust: item.interviewCust,
            lastModifiedTime: item.lastModifiedTime,
            recordFileInstVo: item.recordFileInstVo,
            interviewArticleUrl: item.interviewArticleUrl,
            questionInstList: (itemDetail.questionInfoList || []).map((q) => ({
              id: q.id,
              questionName: q.questionName,
              questionAnswer: q.questionAnswer,
              hitTime: q.hitTime,
              CHECKED: q.CHECKED,
            })),
          },
        });
      });
  });

  const onRenameInterview = useEvent((interviewInstId: string, newTitle: string, interviewCust: string) => {
    const specialChars = /[<>?/\\|*]/;
    if (specialChars.test(newTitle)) {
      message.error('名称不能包含特殊字符: <>?/|\\*');
      return;
    }
    if (/\.\./.test(newTitle)) {
      message.error('名称不能包含连续的点');
      return;
    }
    DueDiligenceAPI.updateInterviewInst({interviewInstId, interviewInstTitle: newTitle, interviewCust}).then(() => {
      message.success('重命名成功！');
      refreshPage();
    });
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

  const onPreviewResource = useEvent((item: {id: string; fileName: string; fileUrl: string}) => {
    if (item.fileName && isAudioFile(item.fileName)) {
      showMask(true);
      setAudioPlayer({visible: true, url: replaceBaseUrl(item.fileUrl), fileName: item.fileName});
      return;
    }
    DueDiligenceAPI.viewReportUrl(item.id, item.fileUrl).then((res) => {
      if (res.success && res.data) {
        window.open(res.data);
      } else {
        message.error(res.message || '获取预览地址失败');
      }
    });
  });

  const onOpenInterviewFile = useEvent((file: {fileName: string; fileUrl: string; type: string}) => {
    if (isAudioFile(file.fileName) || file.type === 'wav') {
      showMask(true);
      setAudioPlayer({visible: true, url: replaceBaseUrl(file.fileUrl), fileName: file.fileName});
    } else if (file.type === 'list') {
      showMask(true);
      setShowQuestionsFile(file.fileUrl ? JSON.parse(file.fileUrl) : []);
    }
  });

  const onQuestionsFileChange = useEvent(() => {
    // 预留更改回调
  });

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
                      onRenameReport(item.id, value);
                    }
                  }}
                  onChange={(e) => {
                    e.target.value = e.target.value.replace(/[<>?/\\|*]|\.\.|[\r\n]/g, '');
                  }}
                  onKeyDown={(e: any) => {
                    if (e.key === 'Enter') {
                      const value = e.target.value.trim();
                      if (value && value !== item?.fileName) {
                        onRenameReport(item.id, value);
                      }
                    }
                  }}
                />
              }
            >
              <a>重命名</a>
            </Popover>
            <TplSelect
              list={configs!.template.list}
              value={{id: itemDetail.templateId || '', name: item?.fileName}}
              onChange={onResetTemplate}
              disabled={itemDetail.status === '5' || reportPolling || itemDetail.reportStatus === DealReportStatusEnum.REPORT_GENERATING}
            >
              <a>更换模板</a>
            </TplSelect>
            <Dropdown
              menu={{
                onClick: ({key}: {key: string}) => {
                  if (key === '下载PDF') {
                    let name = item?.fileName || '';
                    name = name.replace(/\.docx?$/, '.pdf');
                    if (!name.endsWith('.pdf')) name += '.pdf';
                    downloadPdfFromWord(replaceBaseUrl(`/api/deal/down?id=${item?.id}&type=word`), name);
                  } else {
                    let name = item?.fileName || '';
                    name = name.replace(/\.pdf$/, '.docx');
                    if (!name.endsWith('.doc') && !name.endsWith('.docx')) name += '.docx';
                    downloadFile(replaceBaseUrl(`/api/deal/down?id=${item?.id}&type=word`), name);
                  }
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
    if (itemDetail.id) {
      DueDiligenceAPI.queryInterviewInstListByPage(itemDetail.id).then(setInterviewList);
    }
  }, [itemDetail.id]);

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
        <Button
          className="archiveBtn"
          onClick={onArchive}
          icon={<FileOutlined />}
          color="primary"
          variant="outlined"
          disabled={itemDetail.status === '5'}
        >
          {itemDetail.status === '5' ? '已归档' : '归档'}
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
        <div className="top">
          <div className="left">
            <img className="icon" src={itemDetail.logo} />
            <div className="cont">
              <div className="title">{itemDetail.name}</div>
            </div>
            <div
              className={styles.mask}
              style={{
                opacity: reportPolling ? 1 : undefined,
                pointerEvents: reportPolling || itemDetail.status === '5' ? 'auto' : undefined,
              }}
            >
              <Button
                type="primary"
                className={styles.mask_btn}
                onClick={onRebuildReport}
                loading={reportPolling}
                disabled={itemDetail.status === '5'}
              >
                {reportPolling ? '报告生成中...' : itemDetail.status === '5' ? '已归档' : itemDetail.report?.id ? '重新生成' : '立即生成'}
              </Button>
            </div>
          </div>
          <div className="center">
            <div className="top">
              <div className="title">报告详细信息</div>
              <div className="template">
                <ProfileOutlined />
                <span>当前使用模板：</span>
                <span>{currentTemplateName}</span>
              </div>
              <div className="template">
                <ProjectOutlined />
                <span>报告名称：</span>
                <span>{itemDetail.report?.fileName || ''}</span>
              </div>
            </div>
            <div className="btns">
              <Button color="primary" variant="outlined" onClick={onPreviewReport} disabled={!isReportGenerated || !itemDetail.report?.id}>
                在线预览
              </Button>
              <Button
                color="primary"
                variant="outlined"
                onClick={onEditReport}
                disabled={!isReportGenerated || !itemDetail.report?.id || itemDetail.status === '5'}
              >
                在线编辑
              </Button>
              <Button
                color="primary"
                variant="outlined"
                onClick={() => {
                  let name = itemDetail.report?.fileName || '';
                  name = name.replace(/\.pdf$/, '.docx');
                  if (!name.endsWith('.doc') && !name.endsWith('.docx')) name += '.docx';
                  downloadFile(replaceBaseUrl(`/api/deal/down?id=${itemDetail.report?.id}&type=word`), name);
                }}
                disabled={!isReportGenerated || !itemDetail.report?.id}
              >
                下载WORD
              </Button>
              <Button
                color="primary"
                variant="outlined"
                onClick={() => {
                  let name = itemDetail.report?.fileName || '';
                  name = name.replace(/\.docx?$/, '.pdf');
                  if (!name.endsWith('.pdf')) name += '.pdf';
                  downloadPdfFromWord(replaceBaseUrl(`/api/deal/down?id=${itemDetail.report?.id}&type=word`), name);
                }}
                disabled={!isReportGenerated || !itemDetail.report?.id}
              >
                下载PDF
              </Button>
            </div>
          </div>
          <div className="right">
            <TplSelect
              list={configs!.template.list}
              value={{id: itemDetail.templateId || '', name: itemDetail.report?.fileName || ''}}
              onChange={onResetTemplate}
              disabled={itemDetail.status === '5' || reportPolling || itemDetail.reportStatus === DealReportStatusEnum.REPORT_GENERATING}
            >
              <Button color="primary" variant="outlined">
                更换模板
              </Button>
            </TplSelect>
          </div>
        </div>

        <div className={styles.summaryWrap}>
          <div className="summary-hd">
            <div className="title-group">
              <span className="title">访谈小总结</span>
              <span className="tag">AI自动提炼，仅供参考</span>
              <Button
                type="text"
                size="small"
                icon={<RedoOutlined />}
                onClick={onRefreshSummary}
                className="action-btn"
                title="重新生成"
                style={{padding: 0, height: 'auto', marginLeft: 4}}
              />
              {hasSummaryMore && (
                <Button
                  type="text"
                  size="small"
                  icon={isSummaryCollapsed ? <CaretDownOutlined /> : <CaretUpOutlined />}
                  onClick={() => setIsSummaryCollapsed(!isSummaryCollapsed)}
                  className="expand-btn"
                  style={{padding: 0, height: 'auto', marginLeft: 12, color: '#6366f1'}}
                >
                  {isSummaryCollapsed ? '展开' : '收起'}
                </Button>
              )}
            </div>
          </div>
          <div className="summary-bd">
            <div
              ref={summaryContentRef}
              className="content"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: isSummaryCollapsed ? 1 : 'unset',
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                transition: 'all 0.3s',
              }}
            >
              {itemDetail.dealSummary || '暂无内容，请点击重新生成按钮进行提炼'}
            </div>
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
            <div className="collapse-icon">{isResourcesCollapsed ? <CaretRightOutlined /> : <CaretDownOutlined />}</div>
            文档资料
          </div>
          <div className={`${styles.list} ${isResourcesCollapsed ? styles.collapsed : ''}`}>
            {itemDetail.resources.map((item) => {
              const fileProgress = fileProgressMap[item.id];
              return (
                <div key={item.id} className={styles.file} onClick={(e) => onFileClick(e, item)}>
                  {itemDetail.status !== '5' && (
                    <CloseCircleFilled
                      className="close"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveResource(item.id);
                      }}
                    />
                  )}
                  <div className={`g-doc-icon t-${item.fileName?.split('.').pop()?.toLowerCase() || 'doc'}`} />
                  <div className={styles.nameWrap}>
                    <div className={styles.name} title={item.fileName}>
                      {item.fileName}
                    </div>
                    <Popover
                      trigger="click"
                      destroyOnHidden
                      open={showRename === item.id}
                      onOpenChange={(open) => setShowRename(open ? item.id : '')}
                      content={
                        <div onClick={(e) => e.stopPropagation()}>
                          <Input
                            allowClear
                            autoFocus
                            style={{width: '200px'}}
                            defaultValue={item.fileName}
                            onBlur={(e: any) => {
                              const value = e.target.value.trim();
                              if (value && value !== item.fileName) {
                                onRenameReport(item.id, value);
                              }
                            }}
                            onChange={(e) => {
                              e.target.value = e.target.value.replace(/[<>?/\\|*]|\.\.|[\r\n]/g, '');
                            }}
                            onKeyDown={(e: any) => {
                              if (e.key === 'Enter') {
                                const value = e.target.value.trim();
                                if (value && value !== item.fileName) {
                                  onRenameReport(item.id, value);
                                }
                              }
                            }}
                          />
                        </div>
                      }
                    >
                      {itemDetail.status !== '5' && (
                        <EditOutlined
                          className={styles.edit}
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        />
                      )}
                    </Popover>
                  </div>
                  <div className="info">{item.lastModifiedTime}</div>
                  {fileProgress && fileProgress.status !== '1' && (
                    <div
                      className="progress-wrap"
                      title={fileProgress.status === '3' ? '解析成功' : fileProgress.status === '4' ? '解析失败' : '解析中'}
                      style={{display: 'flex', alignItems: 'center', gap: 8}}
                    >
                      {fileProgress.status === '3' ? (
                        <CheckCircleFilled style={{color: '#10b981', fontSize: '20px'}} />
                      ) : fileProgress.status === '4' ? (
                        <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                          <ExclamationCircleFilled style={{color: '#f43f5e', fontSize: '20px'}} />
                          <Button
                            type="primary"
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              onReparseFile(item.id);
                            }}
                            style={{fontSize: '12px', height: '24px', padding: '0 8px', borderRadius: '4px'}}
                          >
                            重新解析
                          </Button>
                        </div>
                      ) : (
                        <Progress type="circle" percent={Math.round(fileProgress.progress * 100)} size={24} status="active" strokeColor={twoColors} />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            <Upload
              className={styles.uploadWrapper}
              showUploadList={false}
              multiple
              {...uploadProps}
              disabled={itemDetail.status === '5' || !!uploading}
            >
              <div className={`${styles.fileUpload} ${itemDetail.status === '5' || !!uploading ? styles.fileUploadDisabled : ''}`}>
                <img src={UploadIcon} alt="上传文件" />
                <div className={styles.uploadText}>
                  <span>{uploading ? '正在上传...' : '点击上传文件'}</span>
                  {!uploading && <p>支持 docx、pdf、xlsx、txt、音频及图片</p>}
                </div>
              </div>
            </Upload>
          </div>
        </div>
        <div className="step">
          <div className="subject" onClick={() => setIsSupplementaryCollapsed(!isSupplementaryCollapsed)}>
            <div className="collapse-icon">{isSupplementaryCollapsed ? <CaretRightOutlined /> : <CaretDownOutlined />}</div>
            文本资料
          </div>
          <div className={`${styles.list} ${isSupplementaryCollapsed ? styles.collapsed : ''}`}>
            {itemDetail.supplementary.map((item) => (
              <div key={item.id} className={styles.file} onClick={(e) => onEditSupplementary(e, item)}>
                {itemDetail.status !== '5' && (
                  <CloseCircleFilled
                    className="close"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveResource(item.id);
                    }}
                  />
                )}
                <div className={`g-doc-icon t-${item.fileName?.split('.').pop()?.toLowerCase() || 'doc'}`} />
                <div className={styles.nameWrap}>
                  <div className={styles.name} title={item.fileName}>
                    {item.fileName}
                  </div>
                </div>
                <div className="info">{item.lastModifiedTime}</div>
                {(() => {
                  const fileProgress = fileProgressMap[item.id];
                  if (fileProgress && fileProgress.status !== '1') {
                    return (
                      <div
                        className="progress-wrap"
                        title={fileProgress.status === '3' ? '解析成功' : fileProgress.status === '4' ? '解析失败' : '解析中'}
                        style={{display: 'flex', alignItems: 'center', gap: 8}}
                      >
                        {fileProgress.status === '3' ? (
                          <CheckCircleFilled style={{color: '#10b981', fontSize: '20px'}} />
                        ) : fileProgress.status === '4' ? (
                          <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                            <ExclamationCircleFilled style={{color: '#f43f5e', fontSize: '20px'}} />
                            <Button
                              type="primary"
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                onReparseFile(item.id);
                              }}
                              style={{fontSize: '12px', height: '24px', padding: '0 8px', borderRadius: '4px'}}
                            >
                              重新解析
                            </Button>
                          </div>
                        ) : (
                          <Progress
                            type="circle"
                            percent={Math.round(fileProgress.progress * 100)}
                            size={24}
                            status="active"
                            strokeColor={twoColors}
                          />
                        )}
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            ))}
            {itemDetail.supplementary.length === 0 && (
              <div
                className={`${styles.fileUpload} ${itemDetail.status === '5' ? styles.fileUploadDisabled : ''}`}
                onClick={() => itemDetail.status !== '5' && setShowSupplementary(true)}
              >
                <img src={SupIcon} alt="补充信息" />
                <span>补充信息</span>
              </div>
            )}
          </div>
        </div>
        <div className="step">
          <div className="subject" onClick={() => setIsInterviewCollapsed(!isInterviewCollapsed)}>
            <div className="collapse-icon">{isInterviewCollapsed ? <CaretRightOutlined /> : <CaretDownOutlined />}</div>
            访谈信息
          </div>
          <div className={`${styles.list} ${isInterviewCollapsed ? styles.collapsed : ''}`}>
            {interviewList.length > 0 ? (
              interviewList.map((item) => (
                <div key={item.interviewInstId} className={styles.file} onClick={(e) => onOpenInterviewDetail(e, item)}>
                  {(() => {
                    const fileName = item.interviewInstTitle || item.interviewCust || '';
                    const fileUrl = item.recordFileInstVo?.recordFileUrl || item.interviewArticleUrl || '';
                    const ext = (fileUrl || fileName).split('.').pop()?.toLowerCase() || 'wav';
                    return <div className={`g-doc-icon t-${ext} ${ext === 'wav' || ext === 'amr' ? 'wav' : ''}`} />;
                  })()}
                  <div className={styles.nameWrap}>
                    <div className={styles.name} title={item.interviewInstTitle || item.interviewCust || '访谈录音'}>
                      {item.interviewInstTitle || item.interviewCust || '访谈录音'}
                    </div>
                    <Popover
                      trigger="click"
                      destroyOnHidden
                      open={showRename === item.interviewInstId}
                      onOpenChange={(open) => setShowRename(open ? item.interviewInstId : '')}
                      content={
                        <div onClick={(e) => e.stopPropagation()}>
                          <Input
                            allowClear
                            autoFocus
                            style={{width: '200px'}}
                            defaultValue={item.interviewInstTitle || item.interviewCust}
                            onBlur={(e: any) => {
                              const value = e.target.value.trim();
                              if (value && value !== (item.interviewInstTitle || item.interviewCust)) {
                                onRenameInterview(item.interviewInstId, value, item.interviewCust);
                              }
                            }}
                            onChange={(e) => {
                              e.target.value = e.target.value.replace(/[<>?/\\|*]|\.\.|[\r\n]/g, '');
                            }}
                            onKeyDown={(e: any) => {
                              if (e.key === 'Enter') {
                                const value = e.target.value.trim();
                                if (value && value !== (item.interviewInstTitle || item.interviewCust)) {
                                  onRenameInterview(item.interviewInstId, value, item.interviewCust);
                                }
                              }
                            }}
                          />
                        </div>
                      }
                    >
                      {itemDetail.status !== '5' && (
                        <EditOutlined
                          className={styles.edit}
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        />
                      )}
                    </Popover>
                  </div>
                  <div className="info">{item.lastModifiedTime}</div>
                </div>
              ))
            ) : (
              <div className={styles.interviewPlaceholder}>
                <div className={styles.placeholderCard}>
                  <img src={InterviewIcon} alt="InterviewIcon" />
                  <div className={styles.text}>
                    {itemDetail.status === '5' ? '尽调已归档，当前没有访谈录音哦！' : '请前往移动端(小狸报告)访谈录音并生成纪要！'}
                  </div>
                </div>
              </div>
            )}
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
      <Modal
        title="问题清单"
        width={750}
        open={!!showQuestionsFile}
        footer={null}
        onCancel={() => {
          showMask(false);
          setShowQuestionsFile(undefined);
        }}
        afterOpenChange={(open: boolean) => {
          showMask(open);
        }}
      >
        <QuestionsFile value={showQuestionsFile!} onChange={onQuestionsFileChange} />
      </Modal>
      <Modal
        title="补充信息"
        width={650}
        open={showSupplementary}
        footer={null}
        onCancel={onCloseSupplementaryModal}
        afterOpenChange={(open: boolean) => {
          showMask(open);
        }}
      >
        <div className={styles.info}>
          <div className="form">
            <Input.TextArea
              placeholder={editSupplementaryItem ? '请修改补充的文本信息' : '请输入您需要补充的文本信息,AI将自动为您分析'}
              rows={15}
              value={supplementaryContent}
              onChange={(e) => setSupplementaryContent(e.target.value)}
            />
          </div>
          <div className="actions">
            <Button type="primary" onClick={onSupplementarySubmit}>
              {editSupplementaryItem ? '确认修改' : '确认补充'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* 访谈详情弹框 */}
      <InterviewDetailModal
        visible={interviewDetailModal.visible}
        record={interviewDetailModal.record}
        onClose={() => {
          showMask(false);
          setInterviewDetailModal({visible: false, record: null});
        }}
      />

      {/* 音频播放浮层 */}
      <AudioPlayerModal
        visible={audioPlayer.visible}
        audioUrl={audioPlayer.url}
        fileName={audioPlayer.fileName}
        onClose={() => {
          showMask(false);
          setAudioPlayer({...audioPlayer, visible: false});
        }}
      />
    </div>
  );
};

export default memo(Component);
