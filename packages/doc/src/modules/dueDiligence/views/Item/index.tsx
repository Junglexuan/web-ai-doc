import {
  ApiOutlined,
  BankOutlined,
  CaretDownOutlined,
  CaretRightOutlined,
  CaretUpOutlined,
  CheckCircleFilled,
  CheckCircleOutlined,
  CheckOutlined,
  ClockCircleOutlined,
  CloseCircleFilled,
  CloseOutlined,
  CloudUploadOutlined,
  DownOutlined,
  EditOutlined,
  ExclamationCircleFilled,
  ExclamationCircleOutlined,
  EyeOutlined,
  FileAddOutlined,
  FileOutlined,
  FolderOpenOutlined,
  InfoCircleOutlined,
  LeftOutlined,
  LoadingOutlined,
  PlusOutlined,
  ProfileOutlined,
  ProjectOutlined,
  RedoOutlined,
  ReloadOutlined,
  RightOutlined,
  RocketOutlined,
  SafetyCertificateOutlined,
  SwapOutlined,
  SyncOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import {Dispatch, DocumentHead} from '@elux/react-web';
import {Button, Dropdown, Input, List, Modal, Popover, Progress, Table, Tooltip, Upload, UploadProps, notification} from 'antd';
import classNames from 'classnames';
import dayjs from 'dayjs';
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
import request, {downloadFile, downloadPdfFromWord, getUploadProps, replaceBaseUrl} from '@/utils/request';
import {getToken, message, showMask, useEvent, useThrottleEvent} from '@/utils/tools';
import {DueDiligenceAPI} from '../../api';
import QuestionsFile from '../../components/QuestionsFile';
import TplSelect from '../../components/TplSelect';
import {
  DealMaterialTagDef,
  DealReportStatusEnum,
  DealResourceFile,
  DealResourceNode,
  DueConfigs,
  InterviewInstDetail,
  InterviewRecord,
  ItemDetail,
  StatusMap,
} from '../../entity';
import Edit from '../Edit';
import _styles from './index.module.less';
const styles: any = _styles;

const twoColors = {
  '0%': '#4f46e5',
  '100%': '#818cf8',
};

const ROOT_FOLDER_ID = '__resource_root__';
const ROOT_FOLDER_NAME = '文档目录';
const MAX_RESOURCE_UPLOAD_SIZE = 120 * 1024 * 1024;
const RESOURCE_ACCEPT = '.docx,.xls,.pdf,.xlsx,.txt,.wav,.mp3,.m4a,.amr,.aac,.ogg,.flac,.png,.jpg,.jpeg';
const SCRAPING_NOTIFICATION_KEY = 'due-diligence-scraping-success';

const sanitizeNodeName = (value: string) => value.replace(/[<>?/\\|*]|\.\.|[\r\n]/g, '').trim();

const hasEnterpriseBasicInfo = (data: any): boolean => {
  const result = data?.result;
  if (!result || typeof result !== 'object') {
    return false;
  }
  return Object.values(result).some((value) => {
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    if (value && typeof value === 'object') {
      return Object.keys(value).length > 0;
    }
    return value !== undefined && value !== null && String(value).trim() !== '';
  });
};

const collectFolderIds = (nodes: DealResourceNode[] = [], result: Set<string> = new Set()) => {
  nodes.forEach((node) => {
    if (node.nodeType === 'folder') {
      result.add(String(node.id));
      collectFolderIds(node.children || [], result);
    }
  });
  return result;
};

const buildFolderNodeMap = (rootNode: DealResourceNode) => {
  const map = new Map<string, DealResourceNode>();
  const walk = (node: DealResourceNode) => {
    if (node.nodeType !== 'folder') {
      return;
    }
    map.set(String(node.id), node);
    (node.children || []).forEach(walk);
  };
  walk(rootNode);
  return map;
};

/*
const buildFolderPathMap = (rootNode: DealResourceNode) => {
  const map = new Map<string, string>([[ROOT_FOLDER_ID, '根目录']]);
  const walk = (nodes: DealResourceNode[], parentPath: string) => {
    nodes.forEach((node) => {
      if (node.nodeType !== 'folder') {
        return;
      }
      const currentPath = `${parentPath} / ${node.name}`;
      map.set(String(node.id), currentPath);
      walk(node.children || [], currentPath);
    });
  };
  walk(rootNode.children || [], '根目录');
  return map;
};

*/

const buildResourceFolderPathMap = (rootNode: DealResourceNode) => {
  const map = new Map<string, string>([[ROOT_FOLDER_ID, ROOT_FOLDER_NAME]]);
  const walk = (nodes: DealResourceNode[], parentPath: string) => {
    nodes.forEach((node) => {
      if (node.nodeType !== 'folder') {
        return;
      }
      const currentPath = `${parentPath} / ${node.name}`;
      map.set(String(node.id), currentPath);
      walk(node.children || [], currentPath);
    });
  };
  walk(rootNode.children || [], ROOT_FOLDER_NAME);
  return map;
};

const isFolderNode = (node: DealResourceNode) => node.nodeType === 'folder';
const isFileNode = (node: DealResourceNode) => node.nodeType === 'file';

interface Props {
  itemDetail: ItemDetail;
  dispatch: Dispatch;
}

const {dueDiligence: dueDiligenceActions} = GetActions('dueDiligence');

const Component: FC<Props> = ({itemDetail, dispatch}) => {
  useEffect(() => {
    console.log('itemDetail: Item=', itemDetail);
  }, [itemDetail.id, itemDetail.status, itemDetail.reportStatus]); // 仅在关键核心字段变化时打印，减少噪音
  const [configs, setConfigs] = useState<DueConfigs>();
  const [uploading, setUploading] = useState<'upload' | 'info' | ''>('');
  const [showSupplementary, setShowSupplementary] = useState(false);
  const [editSupplementaryItem, setEditSupplementaryItem] = useState<{id: string; fileName: string; fileUrl?: string} | null>(null);
  const [scrapingStatus, setScrapingStatus] = useState<'ready' | 'loading' | 'completed'>('ready');
  const [renameFileModal, setRenameFileModal] = useState<any>(null);
  const [renameFileName, setRenameFileName] = useState('');
  const [showRename, setShowRename] = useState('');
  const [showQuestionsFile, setShowQuestionsFile] = useState<{id: string; question: string; answer: string}[]>();
  const [isResourcesCollapsed, setIsResourcesCollapsed] = useState(false); //上传企业资料
  const [isSupplementaryCollapsed, setIsSupplementaryCollapsed] = useState(false); //补充企业信息
  const [isInterviewCollapsed, setIsInterviewCollapsed] = useState(false);
  const [isQuestionListCollapsed, setIsQuestionListCollapsed] = useState(false); //访谈问题清单
  const [questionList, setQuestionList] = useState<
    {id: string; title: string; desc: string; status: string; isManual?: boolean; questionType?: string; answerTime?: string}[]
  >([]);
  const [reportPolling, setReportPolling] = useState(false);
  useEffect(() => {
    // 初始化：如果进入页面时报告状态就是 “生成中”，则开启 Loading
    if (itemDetail.reportStatus === DealReportStatusEnum.REPORT_GENERATING) {
      setReportPolling(true);
    }
  }, []); // 仅在 mount 时执行一次

  const [isSummaryCollapsed, setIsSummaryCollapsed] = useState(true);
  const [isQuestionModalVisible, setIsQuestionModalVisible] = useState(false);
  const [allQuestionsTemplates, setAllQuestionsTemplates] = useState<any[]>([]);
  const [switchingQuestion, setSwitchingQuestion] = useState(false);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [newQuestionValue, setNewQuestionValue] = useState('');
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editingQuestionValue, setEditingQuestionValue] = useState('');
  const [hasSummaryMore, setHasSummaryMore] = useState(false);
  const [showScrapingResultModal, setShowScrapingResultModal] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [aiInsightStatus, setAiInsightStatus] = useState<'idle' | 'loading' | 'completed'>('idle');
  const [aiInsightProgress, setAiInsightProgress] = useState(0);
  const [showAiInsightView, setShowAiInsightView] = useState(false);
  const [aiInsightList, setAiInsightList] = useState<any[]>([]);
  const [selectedAiKeys, setSelectedAiKeys] = useState<string[]>([]);
  const [enterpriseInfo, setEnterpriseInfo] = useState<any>(null);
  const [isEnterpriseLoading, setIsEnterpriseLoading] = useState(false);
  const [enterpriseInfoChecked, setEnterpriseInfoChecked] = useState(false);
  const [hasExistingEnterpriseInfo, setHasExistingEnterpriseInfo] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState(ROOT_FOLDER_ID);
  const [selectedResourceId, setSelectedResourceId] = useState('');
  const [expandedFolderIds, setExpandedFolderIds] = useState<string[]>([ROOT_FOLDER_ID]);
  const [folderModal, setFolderModal] = useState<{mode: 'create' | 'rename'; folderId?: string; parentId?: string} | null>(null);
  const [folderNameValue, setFolderNameValue] = useState('');
  const [folderSubmitting, setFolderSubmitting] = useState(false);
  const needsAiRefreshRef = useRef(true); // 标记是否需要刷新 AI 洞察列表
  const shouldAutoScrapeOnEntryRef = useRef(new URLSearchParams(window.location.search).get('autoScrape') === '1');
  const summaryContentRef = useRef<HTMLDivElement>(null);
  const fileUploadInputRef = useRef<HTMLInputElement>(null);
  const folderUploadInputRef = useRef<HTMLInputElement>(null);
  const detailRef = useRef(itemDetail);
  detailRef.current = itemDetail;
  const currentTemplateName = useMemo(() => {
    return configs?.template.list.find((t) => String(t.id) === String(itemDetail.templateId))?.title || '-';
  }, [configs, itemDetail.templateId]);
  const currentQuestionListName = useMemo(() => {
    // 优先从列表中查找
    const matched = allQuestionsTemplates.find((t) => String(t.id) === String(itemDetail.questionId));
    if (matched) return matched.templateName;
    // 如果列表还没加载出来，尝试从 questionInfoList 的上下文中寻找（如果后端有返回的话）
    return '-';
  }, [allQuestionsTemplates, itemDetail.questionId]);
  const resourceRootNode = useMemo<DealResourceNode>(
    () => ({
      id: ROOT_FOLDER_ID,
      nodeType: 'folder',
      name: ROOT_FOLDER_NAME,
      parentId: null,
      hasChildren: !!itemDetail.resourceTree?.length,
      children: itemDetail.resourceTree || [],
    }),
    [itemDetail.resourceTree]
  );
  const resourceFolderMap = useMemo(() => buildFolderNodeMap(resourceRootNode), [resourceRootNode]);
  const resourceFolderPathMap = useMemo(() => buildResourceFolderPathMap(resourceRootNode), [resourceRootNode]);
  const resourceFileMap = useMemo(() => {
    return new Map<string, DealResourceFile>((itemDetail.resources || []).map((item) => [String(item.id), item]));
  }, [itemDetail.resources]);
  const selectedFolderNode = resourceFolderMap.get(selectedFolderId) || resourceRootNode;
  const selectedFolderChildren = selectedFolderNode.children || [];
  const selectedFolderDirectories = useMemo(() => selectedFolderChildren.filter(isFolderNode), [selectedFolderChildren]);
  const selectedFolderFiles = useMemo(() => {
    return selectedFolderChildren.filter(isFileNode).map((node) => {
      const matchedFile = resourceFileMap.get(String(node.id));
      return {
        id: String(node.id),
        fileName: matchedFile?.fileName || node.name,
        fileUrl: matchedFile?.fileUrl || node.fileUrl || '',
        type: matchedFile?.type || node.type || '',
        lastModifiedTime: matchedFile?.lastModifiedTime || '',
        fileTags: matchedFile?.fileTags || node.fileTags,
        tagIds: matchedFile?.tagIds || node.tagIds,
        tags: matchedFile?.tags || node.tags,
        folderId: matchedFile?.folderId || node.folderId,
        parseStatus: matchedFile?.parseStatus || node.parseStatus,
        progress: matchedFile?.progress ?? node.progress ?? 0,
      };
    });
  }, [resourceFileMap, selectedFolderChildren]);
  const selectedFolderPath = resourceFolderPathMap.get(selectedFolderId) || ROOT_FOLDER_NAME;
  const selectedResourceFile = useMemo(() => {
    if (selectedResourceId) {
      return selectedFolderFiles.find((item) => String(item.id) === String(selectedResourceId));
    }
    return selectedFolderFiles[0];
  }, [selectedFolderFiles, selectedResourceId]);
  const canEditResources = itemDetail.status !== '5';
  const canUploadIntoFolder = canEditResources && !!selectedFolderNode;
  const hasAnyResourceContent = useMemo(() => {
    return (resourceRootNode.children || []).length > 0 || (itemDetail.resources || []).length > 0;
  }, [itemDetail.resources, resourceRootNode.children]);

  const isReportGenerated = itemDetail.reportStatus === DealReportStatusEnum.REPORT_GENERATED;
  const isAIInsightDisabled = useMemo(() => {
    return !itemDetail.creditCode && (itemDetail.resources || []).length === 0 && (itemDetail.supplementary || []).length === 0;
  }, [itemDetail.creditCode, itemDetail.resources, itemDetail.supplementary]);

  const [fileProgressMap, setFileProgressMap] = useState<Record<string, {progress: number; status: string}>>({});
  console.log('fileProgressMap', fileProgressMap);
  const [interviewList, setInterviewList] = useState<InterviewRecord[]>([]);
  const [resourceTagDefinitions, setResourceTagDefinitions] = useState<DealMaterialTagDef[]>([]);
  const [interviewDetailModal, setInterviewDetailModal] = useState<{visible: boolean; record: InterviewInstDetail | null}>({
    visible: false,
    record: null,
  });

  const refreshPage = useCallback(() => {
    dispatch(dueDiligenceActions.fetchItem(itemDetail.id));
    if (itemDetail.id) {
      DueDiligenceAPI.queryInterviewInstListByPage(itemDetail.id).then(setInterviewList);
      DueDiligenceAPI.getTemplateInfoList(itemDetail.id).then((list) => {
        setAllQuestionsTemplates(list || []);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemDetail.id]);

  useEffect(() => {
    if (folderUploadInputRef.current) {
      const input = folderUploadInputRef.current as HTMLInputElement & {webkitdirectory?: boolean; directory?: boolean};
      input.webkitdirectory = true;
      input.directory = true;
      input.setAttribute('webkitdirectory', '');
      input.setAttribute('directory', '');
      input.removeAttribute('accept');
    }
  }, []);

  useEffect(() => {
    const folderIds = collectFolderIds(itemDetail.resourceTree || []);
    setExpandedFolderIds((prev) => {
      const nextExpandedIds = new Set<string>([ROOT_FOLDER_ID, ...prev.filter((id) => id === ROOT_FOLDER_ID || folderIds.has(id))]);
      folderIds.forEach((id) => nextExpandedIds.add(id));
      return Array.from(nextExpandedIds);
    });
    if (selectedFolderId !== ROOT_FOLDER_ID && !folderIds.has(selectedFolderId)) {
      setSelectedFolderId(ROOT_FOLDER_ID);
    }
  }, [itemDetail.resourceTree, selectedFolderId]);

  useEffect(() => {
    if (!selectedFolderFiles.length) {
      if (selectedResourceId) {
        setSelectedResourceId('');
      }
      return;
    }
    const existsInCurrentFolder = selectedFolderFiles.some((item) => String(item.id) === String(selectedResourceId));
    if (!selectedResourceId || !existsInCurrentFolder) {
      setSelectedResourceId(selectedFolderFiles[0].id);
    }
  }, [selectedFolderFiles, selectedResourceId]);

  useEffect(() => {
    console.log(enterpriseInfo, 'enterpriseInfoxxx===');
  }, [enterpriseInfo]);

  useEffect(() => {
    // 如果已有补充数据，说明之前抓取过，同步状态为已完成
    if (scrapingStatus === 'ready' && (itemDetail.supplementary || []).length > 0) {
      setScrapingStatus('completed');
    }
  }, [itemDetail.supplementary, scrapingStatus]);

  useEffect(() => {
    let canceled = false;
    setEnterpriseInfoChecked(false);
    setHasExistingEnterpriseInfo(false);
    if (!itemDetail.id || !itemDetail.companyName) {
      setEnterpriseInfoChecked(true);
      return;
    }
    DueDiligenceAPI.getEnterpriseBasicInfo(itemDetail.id)
      .then((data) => {
        if (canceled) {
          return;
        }
        const exists = hasEnterpriseBasicInfo(data);
        setHasExistingEnterpriseInfo(exists);
        if (exists) {
          setScrapingStatus('completed');
        }
      })
      .catch(() => {
        if (!canceled) {
          setHasExistingEnterpriseInfo(false);
        }
      })
      .finally(() => {
        if (!canceled) {
          setEnterpriseInfoChecked(true);
        }
      });
    return () => {
      canceled = true;
    };
  }, [itemDetail.id, itemDetail.companyName]);

  useEffect(() => {
    // 只有填写了企业名称才自动抓取数据
    if (showScrapingResultModal && itemDetail.id && itemDetail.companyName) {
      setIsEnterpriseLoading(true);
      DueDiligenceAPI.getEnterpriseBasicInfo(itemDetail.id)
        .then(setEnterpriseInfo)
        .finally(() => setIsEnterpriseLoading(false));
    }
  }, [showScrapingResultModal, itemDetail.id, itemDetail.companyName]);

  useEffect(() => {
    if (itemDetail.questionInfoList) {
      // 将后端字段映射到 UI 使用的字段格式
      const mappedList = (itemDetail.questionInfoList || []).map((q) => ({
        id: q.id || '',
        title: q.questionName || '',
        desc: q.questionAnswer || '',
        status: q.CHECKED ? 'covered' : 'uncovered', // 优先根据 CHECKED 字段判定状态
        questionType: q.questionType !== undefined ? String(q.questionType) : undefined,
        answerTime: q.questionAnswerTime || '',
      }));
      setQuestionList(mappedList);
    }
  }, [itemDetail.questionInfoList]);

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

  // 新增：报告状态 WebSocket 实时获取
  useEffect(() => {
    if (!itemDetail.id) return;
    const token = getToken();
    let wsUrl = replaceBaseUrl(`/ws/report-status?dealInstId=${itemDetail.id}&token=${token}`);
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
          // 如果后端在推送中直接带了状态，则根据状态处理
          if (data.reportStatus) {
            const prevStatus = detailRef.current.reportStatus;
            if (prevStatus !== data.reportStatus) {
              // 状态改变，记录并处理
              if (data.reportStatus === DealReportStatusEnum.REPORT_GENERATED || data.reportStatus === DealReportStatusEnum.REPORT_FAILED) {
                setReportPolling(false);
                dispatch(dueDiligenceActions.putCurrentItem(detailRef.current.id, {...detailRef.current, reportStatus: data.reportStatus}));
                refreshPage();
              } else if (data.reportStatus === DealReportStatusEnum.REPORT_GENERATING) {
                setReportPolling(true);
                dispatch(dueDiligenceActions.putCurrentItem(detailRef.current.id, {...detailRef.current, reportStatus: data.reportStatus}));
              }
            }
          }
        } catch (e) {
          // ignore parse error
        }
      };
      ws.onclose = () => clearInterval(pingInterval);
      ws.onerror = () => clearInterval(pingInterval);
    } catch (e) {
      console.error('Failed to connect report status WS:', e);
    }

    return () => {
      if (pingInterval) clearInterval(pingInterval);
      if (ws) ws.close();
    };
  }, [itemDetail.id, refreshPage, dispatch]);

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
    setSelectedResourceId(item.id);
  });

  const uploadProps: UploadProps = useMemo(() => {
    const props = getUploadProps('/api/deal/upload', {
      onProcess: () => setUploading('upload'),
      data: {id: itemDetail.id},
      accept: '.docx,.xls,.pdf,.xlsx,.txt,.wav,.mp3,.m4a,.amr,.aac,.ogg,.flac,.png,.jpg,.jpeg',
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

    props.beforeUpload = (file, fileList) => {
      // 检查当前选中的所有文件总大小 (120MB = 120 * 1024 * 1024 bytes)
      const totalSize = fileList.reduce((acc, f) => acc + (f.size || 0), 0);
      const isLt120M = totalSize < 120 * 1024 * 1024;
      if (!isLt120M) {
        // 多个文件时只在处理第一个文件时提示一次
        if (file === fileList[0]) {
          message.error('所选文件（或文件夹）总大小不能超过 120MB');
        }
        return Upload.LIST_IGNORE;
      }
      return true;
    };

    return props;
  }, [itemDetail.id, refreshPage]);

  const ensureFolderSelected = useCallback(() => {
    if (!selectedFolderNode) {
      message.warning('请先选择目录');
      return false;
    }
    return true;
  }, [selectedFolderNode]);

  const validateUploadBatch = useCallback((files: File[]) => {
    const totalSize = files.reduce((total, file) => total + (file.size || 0), 0);
    if (totalSize >= MAX_RESOURCE_UPLOAD_SIZE) {
      message.error('所选文件或文件夹总大小不能超过 120MB');
      return false;
    }
    return true;
  }, []);

  const submitFolderUpload = useThrottleEvent(async (files: File[], relativePaths?: string[]) => {
    if (!ensureFolderSelected()) {
      return;
    }
    if (!files.length || !validateUploadBatch(files)) {
      return;
    }
    try {
      setUploading('upload');
      await DueDiligenceAPI.uploadFolder(itemDetail.id, files, selectedFolderId === ROOT_FOLDER_ID ? undefined : selectedFolderId, relativePaths);
      message.success(relativePaths?.length ? '文件夹上传成功' : '文件上传成功');
      refreshPage();
    } finally {
      setUploading('');
    }
  });

  const onSelectLocalFiles = useEvent((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []) as File[];
    event.target.value = '';
    submitFolderUpload(files);
  });

  const onSelectLocalFolder = useEvent((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []) as File[];
    const relativePaths = files.map((file) => ((file as File & {webkitRelativePath?: string}).webkitRelativePath || file.name).replace(/\\/g, '/'));
    event.target.value = '';
    submitFolderUpload(files, relativePaths);
  });

  const onTriggerFileUpload = useEvent(() => {
    if (!ensureFolderSelected()) {
      return;
    }
    fileUploadInputRef.current?.click();
  });

  const onTriggerFolderUpload = useEvent(() => {
    if (!ensureFolderSelected()) {
      return;
    }
    const input = folderUploadInputRef.current as (HTMLInputElement & {webkitdirectory?: boolean; directory?: boolean}) | null;
    if (!input) {
      return;
    }
    input.webkitdirectory = true;
    input.directory = true;
    input.setAttribute('webkitdirectory', '');
    input.setAttribute('directory', '');
    input.removeAttribute('accept');
    input.value = '';
    input.click();
  });

  const onEditSubmit = useThrottleEvent((data: any) => {
    // 基础变更对象，始终包含 ID
    const formData: any = {id: itemDetail.id};

    // 遍历提交的数据，只提取发生变更的字段
    Object.keys(data).forEach((key) => {
      const newVal = data[key];
      const oldVal = (itemDetail as any)[key];

      // 如果是 ID 相关的字段，或者 creditCode（信用代码通常也是数字/字母混合），统一转成字符串比较
      if (['templateId', 'questionId', 'id', 'creditCode'].includes(key)) {
        // 关键：将所有空值（null, undefined, ""）统一视为相同，避免 "" !== undefined 的情况
        const sNew = newVal === null || newVal === undefined ? '' : String(newVal).trim();
        const sOld = oldVal === null || oldVal === undefined ? '' : String(oldVal).trim();

        if (sNew !== sOld && newVal !== undefined) {
          formData[key] = sNew;
        }
        return;
      }

      // 针对普通文本字段，也进行空值归一化处理
      if (!['questions', 'pathList', 'template', 'companyName'].includes(key)) {
        const normalizedNew = newVal || '';
        const normalizedOld = oldVal || '';
        if (normalizedNew !== normalizedOld) {
          formData[key] = newVal;
        }
        return;
      }

      // 特殊处理 companyName
      if (key === 'companyName' && newVal !== oldVal) {
        formData[key] = newVal;
      }
    });

    const isCompanyNameChanged = !!formData.companyName && formData.companyName !== itemDetail.companyName;

    // 如果更改了 templateId，则确保同步更新关联的 questionId
    if (formData.templateId && configs) {
      const selectedTpl = configs.template.list.find((t) => String(t.id) === String(formData.templateId));
      if (selectedTpl?.questionId) {
        formData.questionId = String(selectedTpl.questionId);
      }
    }

    DueDiligenceAPI.createItem(formData).then(() => {
      setIsEditModalVisible(false);
      refreshPage(); // 先刷新页面，让名称等基本信息立即更新

      if (isCompanyNameChanged && itemDetail.id) {
        // 清除旧的 AI 洞察
        DueDiligenceAPI.clearAiInsight(itemDetail.id).catch((err) => {
          console.error('Failed to clear AI Insight:', err);
        });

        // 企业名称变更后，重新触发数据抓取；按钮进入 loading 态
        setScrapingStatus('loading');
        DueDiligenceAPI.syncEnterprise(itemDetail.id)
          .then(() => {
            setScrapingStatus('completed');
            refreshPage(); // 抓取完成后再次刷新获取最新数据
          })
          .catch(() => {
            setScrapingStatus('ready');
            message.error('企业数据抓取失败，请稍后重试');
          });
      }
    });
  });

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

  const onSupplementarySubmit = useThrottleEvent(() => {
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

  const onRebuildReport = useThrottleEvent(() => {
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
            // refreshPage();
            message.success('报告生成任务已启动，请稍候...');
          })
          .catch(() => {
            setReportPolling(false);
          });
      },
    });
  });

  const onShowScrapingSuccess = useThrottleEvent(() => {
    notification.open({
      key: SCRAPING_NOTIFICATION_KEY,
      message: null,
      description: (
        <div className={styles.scrapingNotification}>
          <div className="hd">
            <div className="icon-wrap">
              <ThunderboltOutlined />
            </div>
            <div className="title-wrap">
              <div className="title">企业数据抓取已完成!</div>
            </div>
          </div>
          <div className="bd">
            系统已为您抓取该企业的全网数据并提炼深度线索，<span className="highlight">发现多项重要异常特征</span>，建议立即查看。
          </div>
          <div className="ft">
            <Button
              type="primary"
              block
              style={{height: 40, borderRadius: 14, fontSize: 14, fontWeight: 700}}
              onClick={() => {
                notification.destroy(SCRAPING_NOTIFICATION_KEY);
                setShowScrapingResultModal(true);
              }}
            >
              立即查看数据结果
            </Button>
          </div>
        </div>
      ),
      placement: 'bottomRight',
      duration: 0,
      className: styles.customNotification,
      style: {
        width: 360,
        borderRadius: 20,
        padding: 0,
      },
      closeIcon: (
        <div style={{background: '#f1f5f9', borderRadius: '50%', padding: 4, display: 'flex'}}>
          <CloseOutlined style={{fontSize: 14, color: '#94a3b8'}} />
        </div>
      ),
    });
  });

  useEffect(() => {
    return () => {
      notification.destroy(SCRAPING_NOTIFICATION_KEY);
    };
  }, []);

  const executeScraping = useCallback(() => {
    if (!itemDetail.companyName) return; // 安全防御：没有企业名称不执行抓取
    setScrapingStatus('loading');
    DueDiligenceAPI.syncEnterprise(itemDetail.id)
      .then(() => {
        setScrapingStatus('completed');
        onShowScrapingSuccess();
        refreshPage(); // 抓取完成后刷新页面获取最新数据
      })
      .catch(() => {
        setScrapingStatus('ready');
        message.error('企业数据抓取失败，请稍后重试');
      });
  }, [itemDetail.id, itemDetail.companyName, onShowScrapingSuccess, refreshPage]);

  const onStartScraping = useThrottleEvent(() => {
    // 如果没有企业名称，引导去编辑页面填写
    if (!itemDetail.companyName) {
      message.warning('请先完善企业名称后再进行数据抓取');
      setIsEditModalVisible(true);
      return;
    }

    Modal.confirm({
      centered: true,
      width: 480,
      icon: null,
      className: styles.scrapingModal,
      content: (
        <div className={styles.modalContent}>
          <div className="icon-header">
            <ClockCircleOutlined />
          </div>
          <div className="title">确认开始企业数据抓取？</div>
          <div className="info-box">
            <div className="item">
              <ThunderboltOutlined className="lightning" />
              <span>系统将启动全网数据抓取引擎，深度检索工商、司法、舆情及行业研报。</span>
            </div>
          </div>
        </div>
      ),
      okText: (
        <span>
          立即开始分析 <ThunderboltOutlined style={{marginLeft: 4}} />
        </span>
      ),
      cancelText: '取消',
      okButtonProps: {
        className: styles.modalOkBtn,
      },
      cancelButtonProps: {
        className: styles.modalCancelBtn,
      },
      onOk: () => {
        executeScraping();
      },
      afterOpenChange: (open) => showMask(open),
    });
  });

  const lastAttemptedId = useRef<string | null>(null);
  const clearAutoScrapeQuery = useCallback(() => {
    if (!shouldAutoScrapeOnEntryRef.current) {
      return;
    }
    shouldAutoScrapeOnEntryRef.current = false;
    const {pathname, hash} = window.location;
    window.history.replaceState(window.history.state, '', `${pathname}${hash || ''}`);
  }, []);

  useEffect(() => {
    if (shouldAutoScrapeOnEntryRef.current && enterpriseInfoChecked && itemDetail.id && itemDetail.companyName && scrapingStatus === 'ready') {
      if (hasExistingEnterpriseInfo) {
        clearAutoScrapeQuery();
        return;
      }
      if (lastAttemptedId.current !== itemDetail.id) {
        lastAttemptedId.current = itemDetail.id;
        clearAutoScrapeQuery();
        executeScraping();
      }
    }
  }, [
    clearAutoScrapeQuery,
    enterpriseInfoChecked,
    executeScraping,
    hasExistingEnterpriseInfo,
    itemDetail.companyName,
    itemDetail.id,
    scrapingStatus,
  ]);

  useEffect(() => {
    // 自动抓取逻辑：仅当填写了企业名称，且后端确认还没有抓取结果时，进入页面后自动启动静默抓取
    const hasEnterpriseName = !!itemDetail.companyName;

    if (
      !shouldAutoScrapeOnEntryRef.current &&
      enterpriseInfoChecked &&
      hasEnterpriseName &&
      !hasExistingEnterpriseInfo &&
      scrapingStatus === 'ready' &&
      lastAttemptedId.current !== itemDetail.id
    ) {
      lastAttemptedId.current = itemDetail.id;
      const timer = setTimeout(() => {
        executeScraping();
      }, 1000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [enterpriseInfoChecked, hasExistingEnterpriseInfo, itemDetail.id, itemDetail.companyName, scrapingStatus, executeScraping]);

  const onShowAIInsightSuccess = useThrottleEvent((count: number) => {
    notification.open({
      message: null,
      description: (
        <div className={styles.aiInsightNotification}>
          <div className={styles.iconWrap}>
            <RocketOutlined />
          </div>
          <div className={styles.rightContent}>
            <div className={styles.title}>AI洞察已生成完成</div>
            <div className={styles.bd}>已生成 {count} 个补充问题，可直接导入访谈问题清单。</div>
            <div className={styles.ft}>
              <Button
                type="primary"
                className={styles.primaryBtn}
                onClick={() => {
                  notification.destroy();
                  setShowAiInsightView(true);
                }}
              >
                查看 AI洞察
              </Button>
              <Button className={styles.secondaryBtn} onClick={() => notification.destroy()}>
                稍后处理
              </Button>
            </div>
          </div>
        </div>
      ),
      placement: 'bottomRight',
      duration: 3,
      className: styles.customNotification,
      style: {
        width: 360,
        borderRadius: 20,
        padding: 0,
      },
    });
  });

  const executeAiInsight = useCallback(
    (regenerate: boolean = false) => {
      setAiInsightStatus('loading');
      setAiInsightProgress(0);
      // 模拟进度条，但同时发起真实请求
      const timer = setInterval(() => {
        setAiInsightProgress((prev) => (prev >= 90 ? 90 : prev + 10));
      }, 300);

      DueDiligenceAPI.aiInsight(itemDetail.id, regenerate)
        .then((list) => {
          clearInterval(timer);
          setAiInsightProgress(100);
          setAiInsightList(list || []);
          setSelectedAiKeys((list || []).map((item) => item.id)); // 默认全选
          setAiInsightStatus('completed');
          onShowAIInsightSuccess((list || []).length);
        })
        .catch(() => {
          clearInterval(timer);
          setAiInsightStatus('idle');
          message.error('AI洞察生成失败，请稍后重试');
        });
    },
    [itemDetail.id, onShowAIInsightSuccess]
  );

  const onImportAiQuestions = useThrottleEvent(async () => {
    if (selectedAiKeys.length === 0) {
      message.warning('请选择要导入的问题');
      return;
    }

    const questionsToImport = aiInsightList.filter((q) => selectedAiKeys.includes(q.id));

    try {
      await DueDiligenceAPI.acceptAiInsight(itemDetail.id, questionsToImport);
      message.success(`成功导入 ${questionsToImport.length} 条问题`);
      needsAiRefreshRef.current = true; // 导入成功后标记需要重新拉取
      setShowAiInsightView(false);
      refreshPage();
    } catch (e: any) {
      message.error('导入失败：' + (e.message || '未知错误'));
    }
  });

  const onQuestionListAction = (action: string) => {
    switch (action) {
      case 'ai':
        if (aiInsightStatus !== 'completed' || needsAiRefreshRef.current) {
          executeAiInsight(false);
          needsAiRefreshRef.current = false;
        }
        setShowAiInsightView(true);
        break;
      case 'switch':
        setIsQuestionModalVisible(true);
        DueDiligenceAPI.getTemplateInfoList(itemDetail.id).then((list) => {
          setAllQuestionsTemplates(list || []);
        });
        break;
      case 'add':
        setIsAddingQuestion((prev) => !prev);
        break;
      default:
        break;
    }
  };

  const onConfirmAddQuestion = useEvent(async () => {
    const val = newQuestionValue.trim();
    if (!val) {
      setIsAddingQuestion(false);
      setNewQuestionValue('');
      return;
    }

    // 构造新问题对象（契合后端需要的字段格式，不传 id 交由后端生成）
    const newQ = {
      questionName: val,
      questionAnswer: '',
      CHECKED: false,
      isManual: true, // 标记为手动添加
      questionType: '3',
    };

    // 构造全量上传列表
    const payloadList = [newQ, ...(itemDetail.questionInfoList || [])];

    try {
      await DueDiligenceAPI.updateQuestionList({
        id: itemDetail.id,
        questionId: itemDetail.questionId,
        questionInfoList: payloadList,
      });
      message.success('问题添加成功');
      setNewQuestionValue('');
      setIsAddingQuestion(false);
      // 调用接口保存成功后，再刷新页面取最新数据
      refreshPage();
    } catch (e: any) {
      console.error(e);
      message.error(e?.message || '问题添加失败，请重试');
    }
  });

  const onCancelAddQuestion = useEvent(() => {
    setNewQuestionValue('');
    setIsAddingQuestion(false);
  });

  const onSelectQuestionTemplate = (tplId: string) => {
    setSwitchingQuestion(true);
    // 更新当前尽调实例关联的问题清单 ID
    // 使用 forceQuestionId 强制传递，以区分普通的编辑场景
    DueDiligenceAPI.createItem({
      id: itemDetail.id,
      forceQuestionId: tplId,
    } as any)
      .then(() => {
        message.success('切换清单成功');
        setIsQuestionModalVisible(false);
        refreshPage();
      })
      .finally(() => {
        setSwitchingQuestion(false);
      });
  };

  const onConfirmSelectQuestionTemplate = useEvent((tplId: string, templateName: string) => {
    Modal.confirm({
      title: '确认切换问题清单',
      content: `切换后将使用“${templateName || '该问题清单'}”作为当前访谈问题清单，且会清空当前已生成的问题与相关数据，是否继续？`,
      cancelText: '取消',
      okText: '确认切换',
      centered: true,
      onOk: () => {
        onSelectQuestionTemplate(tplId);
      },
      afterOpenChange(open: boolean) {
        showMask(open);
      },
    });
  });

  const onConfirmEditQuestion = useEvent(async (id: string) => {
    const val = editingQuestionValue.trim();
    if (!val || !itemDetail.questionInfoList) {
      setEditingQuestionId(null);
      return;
    }

    const payloadList = itemDetail.questionInfoList.map((q) => {
      if (String(q.id) === String(id)) {
        return {...q, questionName: val};
      }
      return q;
    });

    try {
      await DueDiligenceAPI.updateQuestionList({
        id: itemDetail.id,
        questionId: itemDetail.questionId,
        questionInfoList: payloadList,
      });
      message.success('更新成功');
      setEditingQuestionId(null);
      refreshPage();
    } catch (e: any) {
      console.error(e);
      message.error(e?.message || '更新失败');
    }
  });

  const onDeleteQuestion = useEvent((id: string) => {
    Modal.confirm({
      title: '删除确认',
      content: '确定要删除这条访谈问题吗？删除后不可恢复。',
      okText: '删除',
      okButtonProps: {danger: true},
      cancelText: '取消',
      centered: true,
      onOk: async () => {
        if (!itemDetail.questionInfoList) return;
        const payloadList = itemDetail.questionInfoList.filter((q) => String(q.id) !== String(id));

        try {
          await DueDiligenceAPI.updateQuestionList({
            id: itemDetail.id,
            questionId: itemDetail.questionId,
            questionInfoList: payloadList,
          });
          message.success('删除成功');
          refreshPage();
        } catch (e: any) {
          console.error(e);
          message.error(e?.message || '删除失败');
        }
      },
    });
  });

  const onResetTemplate = useThrottleEvent((tpl: {id: string} | undefined) => {
    if (tpl?.id) {
      DueDiligenceAPI.resetTemplate(itemDetail.id, tpl.id).then(() => {
        refreshPage();
        message.success('操作成功！');
      });
    }
  });

  const onArchive = useThrottleEvent(() => {
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

  const onRemoveResource = useThrottleEvent((id: string) => {
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

  const toggleFolderExpanded = useEvent((folderId: string) => {
    setExpandedFolderIds((prev) => {
      if (prev.includes(folderId)) {
        return prev.filter((id) => id !== folderId);
      }
      return [...prev, folderId];
    });
  });

  const openCreateFolderModal = useEvent((parentId?: string) => {
    if (!canEditResources) {
      return;
    }
    setFolderModal({mode: 'create', parentId});
    setFolderNameValue('');
  });

  const openRenameFolderModal = useEvent((folder: DealResourceNode) => {
    if (!canEditResources || folder.id === ROOT_FOLDER_ID) {
      return;
    }
    setFolderModal({mode: 'rename', folderId: String(folder.id)});
    setFolderNameValue(folder.name || '');
  });

  const closeFolderModal = useEvent(() => {
    setFolderModal(null);
    setFolderNameValue('');
    setFolderSubmitting(false);
  });

  const onSubmitFolderModal = useThrottleEvent(async () => {
    if (!folderModal) {
      return;
    }
    const nextFolderName = sanitizeNodeName(folderNameValue);
    if (!nextFolderName) {
      message.warning('请输入目录名称');
      return;
    }
    try {
      setFolderSubmitting(true);
      if (folderModal.mode === 'create') {
        await DueDiligenceAPI.createFolder(
          itemDetail.id,
          nextFolderName,
          folderModal.parentId && folderModal.parentId !== ROOT_FOLDER_ID ? folderModal.parentId : undefined
        );
        message.success('目录创建成功');
      } else if (folderModal.folderId) {
        await DueDiligenceAPI.renameFolder(itemDetail.id, folderModal.folderId, nextFolderName);
        message.success('目录重命名成功');
      }
      closeFolderModal();
      refreshPage();
    } finally {
      setFolderSubmitting(false);
    }
  });

  const onDeleteFolder = useThrottleEvent((folder: DealResourceNode) => {
    if (!canEditResources || folder.id === ROOT_FOLDER_ID) {
      return;
    }
    Modal.confirm({
      title: '确认删除目录',
      centered: true,
      okText: '确认',
      cancelText: '取消',
      content: `将递归删除“${folder.name}”及其包含的文件，操作无法撤销。`,
      afterOpenChange: (open) => showMask(open),
      onOk: async () => {
        await DueDiligenceAPI.deleteFolder(itemDetail.id, String(folder.id));
        message.success('目录删除成功');
        if (selectedFolderId === String(folder.id)) {
          setSelectedFolderId(ROOT_FOLDER_ID);
        }
        refreshPage();
      },
    });
  });

  const getResourceProgress = useCallback(
    (item: Pick<DealResourceFile, 'id' | 'parseStatus' | 'progress'>) => {
      const liveProgress = fileProgressMap[item.id];
      if (liveProgress) {
        return liveProgress;
      }
      if (item.parseStatus) {
        return {
          status: String(item.parseStatus),
          progress: item.progress || 0,
        };
      }
      return undefined;
    },
    [fileProgressMap]
  );

  const onRefreshSummary = useThrottleEvent(async () => {
    try {
      message.loading({content: '总结提炼中...', key: 'refreshSummary'});
      await DueDiligenceAPI.refreshSummary(itemDetail.id);
      message.success({content: '提炼完成', key: 'refreshSummary'});
      refreshPage();
    } catch (e: any) {
      // 错误已由 request 拦截器处理
    }
  });

  const onRenameReport = useThrottleEvent((fileId: string, fileName: string) => {
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

  const onReparseFile = useThrottleEvent((fileId: string) => {
    DueDiligenceAPI.reparseFile(itemDetail.id, fileId).then(() => {
      message.success('重新解析已触发');
      refreshPage();
    });
  });

  const onOpenInterviewDetail = useEvent((e: React.MouseEvent<any>, item: InterviewRecord) => {
    if (!e.currentTarget.contains(e.target as Node)) return;

    // 录音状态判断：只有状态为 '2' (合并完成) 才允许查看详情
    if (item.recordStatus !== '2') {
      message.info('录音文件合并中，请稍后再查看！');
      return;
    }

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

  const renderResourceProgress = (item: DealResourceFile) => {
    const fileProgress = getResourceProgress(item);
    if (!fileProgress || fileProgress.status === '1') {
      return null;
    }
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
          <Progress type="circle" percent={Math.round(fileProgress.progress * 100)} size={24} status="active" strokeColor={twoColors} />
        )}
      </div>
    );
  };

  const renderFolderRows = (nodes: DealResourceNode[]) => {
    return nodes.filter(isFolderNode).map((node) => {
      const folderId = String(node.id);
      return (
        <div key={folderId} className={styles.folderRow} onClick={() => setSelectedFolderId(folderId)}>
          <div className={styles.folderRowMain}>
            <FolderOpenOutlined className={styles.folderRowIcon} />
            <span className={styles.folderRowName}>{node.name}</span>
          </div>
          {canEditResources && (
            <div className={styles.folderRowActions} onClick={(e) => e.stopPropagation()}>
              <Button type="text" size="small" icon={<PlusOutlined />} onClick={() => openCreateFolderModal(folderId)} />
              <Button type="text" size="small" icon={<EditOutlined />} onClick={() => openRenameFolderModal(node)} />
              <Button type="text" size="small" icon={<CloseOutlined />} onClick={() => onDeleteFolder(node)} />
            </div>
          )}
        </div>
      );
    });
  };

  const resourceUploadMenu = {
    onClick: ({key, domEvent}: {key: string; domEvent: any}) => {
      domEvent.preventDefault();
      domEvent.stopPropagation();
      if (key === 'file') {
        onTriggerFileUpload();
        return;
      }
      onTriggerFolderUpload();
    },
    items: [
      {
        key: 'file',
        disabled: !canUploadIntoFolder || !!uploading,
        className: styles.dropdownMenuItem,
        label: (
          <div className={styles.menuItemContent}>
            <div className={styles.iconBox}>
              <FileAddOutlined />
            </div>
            <div className={styles.textBox}>
              <div className={styles.mTitle}>上传文件</div>
              <div className={styles.mDesc}>上传到当前选中的目录</div>
            </div>
          </div>
        ),
      },
      {
        key: 'directory',
        disabled: !canUploadIntoFolder || !!uploading,
        className: styles.dropdownMenuItem,
        label: (
          <div className={styles.menuItemContent}>
            <div className={styles.iconBox}>
              <FolderOpenOutlined />
            </div>
            <div className={styles.textBox}>
              <div className={styles.mTitle}>上传文件夹</div>
              <div className={styles.mDesc}>保留多级目录结构导入资料</div>
            </div>
          </div>
        ),
      },
    ],
  };

  const selectedFolderDisplayName = selectedFolderId === ROOT_FOLDER_ID ? ROOT_FOLDER_NAME : selectedFolderNode?.name || ROOT_FOLDER_NAME;
  const selectedResourceFolderPath = selectedResourceFile?.folderId
    ? resourceFolderPathMap.get(String(selectedResourceFile.folderId)) || ROOT_FOLDER_NAME
    : ROOT_FOLDER_NAME;
  const selectedResourcePathInfo = useMemo(() => {
    const rawFileName = selectedResourceFile?.fileName || '';
    const normalizedFileName = rawFileName.replace(/\\/g, '/');
    const pathSegments = normalizedFileName.split('/').filter(Boolean);
    const displayFileName = pathSegments[pathSegments.length - 1] || rawFileName || '-';
    const displayFolderPath = pathSegments.length > 1 ? pathSegments.slice(0, -1).join(' / ') : selectedResourceFolderPath;
    return {
      displayFileName,
      displayFolderPath,
    };
  }, [selectedResourceFile?.fileName, selectedResourceFolderPath]);
  const resourceTagNameMap = useMemo(() => {
    return new Map(resourceTagDefinitions.map((item) => [String(item.id), item.name]));
  }, [resourceTagDefinitions]);
  const getResourceTagLabels = useCallback(
    (item?: Pick<DealResourceFile, 'fileTags' | 'tags' | 'tagIds'>) => {
      if (!item) {
        return [];
      }
      if (item.tags?.length) {
        return item.tags.map((tag) => tag.name).filter(Boolean);
      }
      if (item.fileTags) {
        return item.fileTags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean);
      }
      if (item.tagIds?.length) {
        return item.tagIds.map((id) => resourceTagNameMap.get(String(id)) || String(id)).filter(Boolean);
      }
      return [];
    },
    [resourceTagNameMap]
  );
  const selectedResourceTags = useMemo(() => getResourceTagLabels(selectedResourceFile), [getResourceTagLabels, selectedResourceFile]);

  const renderFolderNodes = (nodes: DealResourceNode[], depth: number = 0): React.ReactNode => {
    return nodes.filter(isFolderNode).map((node) => {
      const folderId = String(node.id);
      const childFolders = (node.children || []).filter(isFolderNode);
      const directFiles = (node.children || []).filter(isFileNode);
      const isExpanded = expandedFolderIds.includes(folderId);
      const isSelected = selectedFolderId === folderId;
      return (
        <div key={folderId} className={styles.treeNodeWrap}>
          <div
            className={classNames(styles.treeNode, {[styles.selectedTreeNode]: isSelected})}
            style={{paddingLeft: 16 + depth * 18}}
            onClick={() => setSelectedFolderId(folderId)}
          >
            <button
              type="button"
              className={styles.treeToggle}
              onClick={(e) => {
                e.stopPropagation();
                if (childFolders.length) {
                  toggleFolderExpanded(folderId);
                }
              }}
            >
              {childFolders.length ? isExpanded ? <CaretDownOutlined /> : <CaretRightOutlined /> : <span className={styles.treeTogglePlaceholder} />}
            </button>
            <FolderOpenOutlined className={styles.treeIcon} />
            <div className={styles.treeContent}>
              <Tooltip title={node.name}>
                <span className={styles.treeLabel}>{node.name}</span>
              </Tooltip>
              <span className={styles.treeMeta}>
                {childFolders.length} 个子目录 · {directFiles.length} 个文件
              </span>
            </div>
            {canEditResources && (
              <div className={styles.treeActions} onClick={(e) => e.stopPropagation()}>
                <Tooltip title="新建子目录">
                  <Button type="text" size="small" icon={<PlusOutlined />} onClick={() => openCreateFolderModal(folderId)} />
                </Tooltip>
                <Tooltip title="重命名">
                  <Button type="text" size="small" icon={<EditOutlined />} onClick={() => openRenameFolderModal(node)} />
                </Tooltip>
                <Tooltip title="删除">
                  <Button type="text" size="small" icon={<CloseOutlined />} onClick={() => onDeleteFolder(node)} />
                </Tooltip>
              </div>
            )}
          </div>
          {isExpanded && childFolders.length > 0 && <div className={styles.treeChildren}>{renderFolderNodes(childFolders, depth + 1)}</div>}
        </div>
      );
    });
  };

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
      DueDiligenceAPI.getTemplateInfoList(itemDetail.id).then((list) => {
        setAllQuestionsTemplates(list || []);
      });
    }
  }, [itemDetail.id]);

  useEffect(() => {
    if (!itemDetail.templateId) {
      setResourceTagDefinitions([]);
      return;
    }
    DueDiligenceAPI.listFileTags(String(itemDetail.templateId))
      .then(setResourceTagDefinitions)
      .catch(() => setResourceTagDefinitions([]));
  }, [itemDetail.templateId]);

  const onBack = useEvent(() => {
    const router = GetClientRouter();
    const url = itemDetail.status === '5' ? '/admin/dueDiligence/list/maintain?status=end' : '/admin/dueDiligence/list/maintain';
    router.push({url});
  });

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
          <LeftOutlined onClick={onBack} />
          <a onClick={onBack}>尽调管理</a>
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
      <div
        className={classNames(styles.scrapingRow, {
          [styles.loading]: scrapingStatus === 'loading',
          [styles.completed]: scrapingStatus === 'completed',
        })}
      >
        <div className="left">
          <div className="icon-box">
            <img src={ReviewIcon} alt="BrainIcon" />
            {scrapingStatus === 'loading' && <div className="loading-mask" />}
          </div>
          <div className="text-box">
            <div className="title">
              {scrapingStatus === 'loading' ? '企业数据抓取中' : scrapingStatus === 'completed' ? '企业数据抓取已完成' : '企业数据抓取'}
            </div>
            {scrapingStatus !== 'completed' && (
              <div className="desc">
                {scrapingStatus === 'loading'
                  ? '正在调取全网检索接口，执行深度隐患筛查，此过程不影响您当前的操作'
                  : '全网数据深度抓取，精准识别访谈重点'}
                {scrapingStatus === 'loading' && <span className="dot">...</span>}
              </div>
            )}
          </div>
        </div>

        <div className="right-action">
          {scrapingStatus === 'ready' && (
            <Button type="primary" icon={<ThunderboltOutlined />} style={{borderRadius: 10}} onClick={onStartScraping}>
              开始抓取
            </Button>
          )}
          {scrapingStatus === 'completed' && (
            <div style={{display: 'flex', gap: 12}}>
              <Button
                type="primary"
                icon={<ProfileOutlined />}
                style={{borderRadius: 10, height: 40}}
                onClick={() => setShowScrapingResultModal(true)}
              >
                查看抓取结果
              </Button>
              <div
                className="refresh-btn"
                onClick={onStartScraping}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 44,
                  height: 44,
                  background: '#f1f5f9',
                  borderRadius: 14,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <SyncOutlined style={{fontSize: 20, color: '#94a3b8'}} />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="cd">
        <div className="top">
          <div className="left">
            <img className="icon" src={itemDetail.logo} />
            <div className="cont">
              <div className="title" title={itemDetail.name}>
                <span className="nameText">{itemDetail.name}</span>
                <Tooltip title="编辑尽调">
                  <EditOutlined className="editIcon" onClick={() => setIsEditModalVisible(true)} />
                </Tooltip>
              </div>
              {(itemDetail.companyName || itemDetail.creditCode) && (
                <div className={styles.compSimpleInfo}>
                  {itemDetail.companyName && (
                    <div className={styles.compName} title={itemDetail.companyName}>
                      {itemDetail.companyName}
                    </div>
                  )}
                  {itemDetail.creditCode && (
                    <div className={styles.compCode} title={itemDetail.creditCode}>
                      {itemDetail.creditCode}
                    </div>
                  )}
                </div>
              )}
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
              <Button
                type="primary"
                onClick={onRebuildReport}
                loading={reportPolling}
                disabled={itemDetail.status === '5'}
                style={{borderRadius: 10, fontWeight: 500}}
              >
                {reportPolling ? '报告生成中...' : itemDetail.report?.id ? '重新生成' : '立即生成'}
              </Button>
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
                下载报告
              </Button>
              {/* <Button
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
              </Button> */}
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
              <span className="title">尽调小总结</span>
              <span className="tag">AI自动提炼，仅供参考</span>
              <Button
                type="text"
                size="small"
                icon={<RedoOutlined />}
                onClick={onRefreshSummary}
                disabled={itemDetail.status === '5'}
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
              {itemDetail.dealSummary || '尽调小总结未生成，请刷新生成。'}
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
          <div className={classNames(styles.resourceWorkspace, {[styles.collapsed]: isResourcesCollapsed})}>
            <input ref={fileUploadInputRef} type="file" multiple accept={RESOURCE_ACCEPT} style={{display: 'none'}} onChange={onSelectLocalFiles} />
            <input ref={folderUploadInputRef} type="file" multiple style={{display: 'none'}} onChange={onSelectLocalFolder} />

            {!hasAnyResourceContent ? (
              <div className={styles.resourceIntro}>
                <div className={styles.resourceIntroIcon}>
                  <FolderOpenOutlined />
                </div>
                <h3 className={styles.resourceIntroTitle}>按文件夹方式管理资料</h3>
                <p className={styles.resourceIntroDesc}>
                  目录区更轻，文件区更紧凑，摘要放到详情面板里。先建目录再上传，或者直接上传整个文件夹都可以。
                </p>
                <div className={styles.resourceIntroActions}>
                  <Button
                    color="primary"
                    variant="outlined"
                    icon={<PlusOutlined />}
                    disabled={!canEditResources}
                    onClick={() => openCreateFolderModal(selectedFolderId)}
                  >
                    新建目录
                  </Button>
                  <Dropdown
                    trigger={['click']}
                    overlayClassName={styles.uploadDropdown}
                    placement="bottom"
                    arrow={{pointAtCenter: true}}
                    menu={resourceUploadMenu}
                  >
                    <Button type="primary" icon={<CloudUploadOutlined />} disabled={!canUploadIntoFolder || !!uploading}>
                      {uploading ? '上传中...' : '上传资料'} <DownOutlined />
                    </Button>
                  </Dropdown>
                </div>
              </div>
            ) : (
              <div className={styles.resourceLayout}>
                <div className={styles.resourceSidebar}>
                  <div className={styles.resourcePanelHeader}>
                    <div>
                      <div className={styles.panelTitle}>目录</div>
                    </div>
                    {canEditResources && (
                      <Button type="text" icon={<PlusOutlined />} onClick={() => openCreateFolderModal(ROOT_FOLDER_ID)}>
                        新建
                      </Button>
                    )}
                  </div>
                  <div className={styles.resourceSidebarBody}>
                    <div className={styles.treeNodeWrap}>
                      <div
                        className={classNames(styles.treeNode, {[styles.selectedTreeNode]: selectedFolderId === ROOT_FOLDER_ID})}
                        onClick={() => setSelectedFolderId(ROOT_FOLDER_ID)}
                      >
                        <button
                          type="button"
                          className={styles.treeToggle}
                          onClick={(e) => {
                            e.stopPropagation();
                            if ((resourceRootNode.children || []).length) {
                              toggleFolderExpanded(ROOT_FOLDER_ID);
                            }
                          }}
                        >
                          {(resourceRootNode.children || []).length ? (
                            expandedFolderIds.includes(ROOT_FOLDER_ID) ? (
                              <CaretDownOutlined />
                            ) : (
                              <CaretRightOutlined />
                            )
                          ) : (
                            <span className={styles.treeTogglePlaceholder} />
                          )}
                        </button>
                        <BankOutlined className={styles.treeIcon} />
                        <div className={styles.treeContent}>
                          <Tooltip title={ROOT_FOLDER_NAME}>
                            <span className={styles.treeLabel}>{ROOT_FOLDER_NAME}</span>
                          </Tooltip>
                          <span className={styles.treeMeta}>根级资料入口</span>
                        </div>
                      </div>
                      {expandedFolderIds.includes(ROOT_FOLDER_ID) && (
                        <div className={styles.treeChildren}>{renderFolderNodes(resourceRootNode.children || [])}</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className={styles.resourceCenter}>
                  <div className={styles.resourceCenterHeader}>
                    {/* <div className={styles.breadcrumb}>
                      {selectedFolderId === ROOT_FOLDER_ID ? (
                        <div className={styles.panelTitle}>{ROOT_FOLDER_NAME}</div>
                      ) : (
                        <>
                          <div className={styles.parentPath} onClick={() => setSelectedFolderId(ROOT_FOLDER_ID)}>
                            {ROOT_FOLDER_NAME}
                          </div>
                          <span className={styles.separator}>/</span>
                          <Tooltip title={selectedFolderNode?.name}>
                            <div className={styles.panelTitle}>{selectedFolderNode?.name}</div>
                          </Tooltip>
                        </>
                      )}
                    </div> */}
                    <div className={styles.resourceToolbar}>
                      {/* <Button disabled icon={<FileOutlined />}>
                        合并文档
                      </Button> */}
                      <Dropdown
                        trigger={['click']}
                        overlayClassName={styles.uploadDropdown}
                        placement="bottomRight"
                        arrow={{pointAtCenter: true}}
                        menu={resourceUploadMenu}
                      >
                        <Button type="primary" icon={<CloudUploadOutlined />} disabled={!canUploadIntoFolder || !!uploading}>
                          {uploading ? '上传中...' : '上传'} <DownOutlined />
                        </Button>
                      </Dropdown>
                    </div>
                  </div>

                  <div className={styles.resourceCenterBody}>
                    <div className={styles.resourceCenterScroll}>
                      {selectedFolderDirectories.length > 0 && <div className={styles.folderRows}>{renderFolderRows(selectedFolderDirectories)}</div>}

                      {selectedFolderFiles.length > 0 && (
                        <div className={styles.resourceFileList}>
                          {selectedFolderFiles.map((item) => {
                            const tagLabels = getResourceTagLabels(item);
                            return (
                              <div
                                key={item.id}
                                className={classNames(styles.resourceFileRow, {
                                  [styles.selectedResourceFileRow]: selectedResourceFile?.id === item.id,
                                })}
                                onClick={(e) => onFileClick(e, item)}
                              >
                                <div className={`g-doc-icon t-${item.fileName?.split('.').pop()?.toLowerCase() || 'doc'}`} />
                                <div className={styles.resourceFileBody}>
                                  <div className={styles.resourceFileHead}>
                                    <div className={styles.nameWrap}>
                                      <div className={styles.name} title={item.fileName}>
                                        {item.fileName}
                                      </div>
                                      {canEditResources && (
                                        <EditOutlined
                                          className={styles.edit}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            setRenameFileModal(item);
                                            setRenameFileName(item.fileName);
                                          }}
                                        />
                                      )}
                                      {canEditResources && (
                                        <Tooltip title="预览">
                                          <EyeOutlined
                                            className={styles.preview}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              onPreviewResource(item);
                                            }}
                                          />
                                        </Tooltip>
                                      )}
                                    </div>
                                    {canEditResources && (
                                      <CloseCircleFilled
                                        className="close"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onRemoveResource(item.id);
                                        }}
                                      />
                                    )}
                                  </div>
                                  <div className={styles.resourceFileMeta}>
                                    <span className={styles.resourceFileTime}>{item.lastModifiedTime || '暂无上传时间'}</span>
                                    {tagLabels.length > 0 && (
                                      <div className={styles.fileTagsWrap}>
                                        {tagLabels.map((tag: string, index: number) => (
                                          <span key={index} className={styles.tagItem} title={tag}>
                                            {tag}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                {renderResourceProgress(item)}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {!selectedFolderDirectories.length && !selectedFolderFiles.length && (
                        <div className={styles.resourceCenterEmpty}>当前目录下还没有文件，可继续上传资料或新建子目录。</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className={styles.resourceDetailPanel}>
                  <div className={styles.resourcePanelHeader}>
                    <div>
                      <div className={styles.panelTitle}>文件详情</div>
                      <div className={styles.panelDesc}>{selectedResourceFile ? '当前选中文件信息' : '选择文件后展示目录、上传时间和标签'}</div>
                    </div>
                  </div>
                  <div className={styles.resourceDetailBody}>
                    {selectedResourceFile ? (
                      <>
                        <div className={styles.detailFileName}>{selectedResourcePathInfo.displayFileName}</div>
                        {/* <div className={styles.detailFileMeta}>目录：{selectedResourcePathInfo.displayFolderPath}</div> */}

                        <div className={styles.detailInfoCard}>
                          <span className={styles.detailInfoLabel}>上传时间</span>
                          <strong className={styles.detailInfoValue}>{selectedResourceFile.lastModifiedTime || '暂无时间'}</strong>
                        </div>

                        <div className={styles.detailTagsBlock}>
                          <div className={styles.detailSectionLabel}>
                            <ApiOutlined />
                            标签
                          </div>
                          <div className={styles.detailTagList}>
                            {selectedResourceTags.length > 0 ? (
                              selectedResourceTags.map((tag, index) => (
                                <span key={`${tag}-${index}`} className={styles.detailTag}>
                                  {tag}
                                </span>
                              ))
                            ) : (
                              <span className={styles.detailEmptyText}>暂无标签</span>
                            )}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className={styles.resourceDetailEmpty}>
                        <FileOutlined />
                        <p>选择文件后，这里会展示目录、上传时间和标签信息。</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className={`${styles.list} ${isResourcesCollapsed ? styles.collapsed : ''}`} style={{display: 'none'}}>
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
                  {getResourceTagLabels(item).length > 0 && (
                    <div className={styles.fileTagsWrap}>
                      {getResourceTagLabels(item).map((tag: string, index: number) => (
                        <span key={index} className={styles.tagItem} title={tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
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
            <Dropdown
              disabled={itemDetail.status === '5' || !!uploading}
              trigger={['click']}
              overlayClassName={styles.uploadDropdown}
              placement="bottom"
              arrow={{pointAtCenter: true}}
              menu={{
                items: [
                  {
                    key: 'file',
                    className: styles.dropdownMenuItem,
                    label: (
                      <Upload showUploadList={false} multiple {...uploadProps} className={styles.menuUpload}>
                        <div className={styles.menuItemContent}>
                          <div className={styles.iconBox}>
                            <FileAddOutlined />
                          </div>
                          <div className={styles.textBox}>
                            <div className={styles.mTitle}>上传文件</div>
                            <div className={styles.mDesc}>支持多选文档、图片等</div>
                          </div>
                        </div>
                      </Upload>
                    ),
                  },
                  {
                    key: 'directory',
                    className: styles.dropdownMenuItem,
                    label: (
                      <Upload showUploadList={false} multiple directory {...uploadProps} className={styles.menuUpload}>
                        <div className={styles.menuItemContent}>
                          <div className={styles.iconBox}>
                            <FolderOpenOutlined />
                          </div>
                          <div className={styles.textBox}>
                            <div className={styles.mTitle}>上传文件夹</div>
                            <div className={styles.mDesc}>一键导入整个目录结构</div>
                          </div>
                        </div>
                      </Upload>
                    ),
                  },
                ],
              }}
            >
              <div className={styles.uploadWrapper}>
                <div className={`${styles.fileUpload} ${itemDetail.status === '5' || !!uploading ? styles.fileUploadDisabled : ''}`}>
                  <img src={UploadIcon} alt="上传资料" />
                  <div className={styles.uploadText}>
                    <span>{uploading ? '正在上传...' : '点击上传资料'}</span>
                    {!uploading && <p>支持文件或文件夹上传</p>}
                  </div>
                </div>
              </div>
            </Dropdown>
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
        <div className="step">
          <div className="subject" onClick={() => setIsQuestionListCollapsed(!isQuestionListCollapsed)}>
            <div className="collapse-icon">{isQuestionListCollapsed ? <CaretRightOutlined /> : <CaretDownOutlined />}</div>
            访谈问题清单
            <span className={styles.countBadge} style={{marginLeft: 12, verticalAlign: 'middle'}}>
              {questionList.filter((q) => q.status === 'covered').length}/{questionList.length}
            </span>
            <div className={styles.qToolbar} onClick={(e) => e.stopPropagation()}>
              {showAiInsightView ? (
                <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                  <Button
                    type="primary"
                    danger={false}
                    icon={<RocketOutlined />}
                    onClick={() => setShowAiInsightView(false)}
                    className={styles.exitAiBtn}
                  >
                    退出AI洞察
                  </Button>
                  <Tooltip title="重新生成AI洞察">
                    <Button
                      className={styles.aiRefreshBtn}
                      icon={<SyncOutlined spin={aiInsightStatus === 'loading'} />}
                      onClick={() => executeAiInsight(true)}
                    />
                  </Tooltip>
                  <Button className={styles.aiSwitchBtn} onClick={() => onQuestionListAction('switch')}>
                    切换问题清单
                  </Button>
                </div>
              ) : (
                <>
                  <Tooltip title="AI 洞察">
                    <Button
                      type="link"
                      icon={<RocketOutlined />}
                      onClick={() => onQuestionListAction('ai')}
                      className={styles.aiBtn}
                      disabled={isAIInsightDisabled}
                    >
                      AI 洞察
                    </Button>
                  </Tooltip>
                  <Tooltip title="切换清单">
                    <Button type="link" icon={<SwapOutlined />} onClick={() => onQuestionListAction('switch')}>
                      切换清单
                    </Button>
                  </Tooltip>
                  <Tooltip title="手动添加">
                    <Button
                      type={isAddingQuestion ? 'primary' : 'default'}
                      icon={<PlusOutlined />}
                      onClick={() => onQuestionListAction('add')}
                      className={classNames(styles.addBtn, {[styles.active]: isAddingQuestion})}
                    >
                      手动添加
                    </Button>
                  </Tooltip>
                </>
              )}
            </div>
          </div>
          <div className={`${styles.list} ${styles.fullWidthList} ${isQuestionListCollapsed ? styles.collapsed : ''}`}>
            {showAiInsightView ? (
              <div className={styles.aiInsightViewContainer}>
                <div className={styles.aiViewHeader}>
                  <div className={styles.left}>
                    <div className={styles.vTitle}>AI洞察问题清单</div>
                  </div>
                  <div className={styles.right}>
                    <Button
                      className={styles.batchBtn}
                      onClick={() => {
                        if (selectedAiKeys.length === aiInsightList.length) {
                          setSelectedAiKeys([]);
                        } else {
                          setSelectedAiKeys(aiInsightList.map((i) => i.id));
                        }
                      }}
                    >
                      {selectedAiKeys.length === aiInsightList.length ? '取消全选' : '全部选择'}
                    </Button>
                    <Button type="primary" className={styles.importBtn} onClick={onImportAiQuestions} disabled={selectedAiKeys.length === 0}>
                      导入到当前清单
                    </Button>
                  </div>
                </div>

                <div className={styles.aiInfoBanner}>
                  <div className={styles.bannerContent}>
                    <div className={styles.bTitle}>AI洞察问题清单</div>
                    <div className={styles.bDesc}>这里展示 AI 洞察生成的补充访谈问题，勾选后可一键导入到当前访谈问题清单。</div>
                  </div>
                  <div className={styles.bannerStats}>
                    <span className={styles.totalBadge}>共 {aiInsightStatus === 'loading' ? 0 : aiInsightList.length} 个问题</span>
                    <span className={styles.selectedBadge}>已选 {aiInsightStatus === 'loading' ? 0 : selectedAiKeys.length} 个</span>
                  </div>
                </div>

                <div className={styles.aiQuestionsScroll}>
                  {aiInsightStatus === 'loading' ? (
                    <div className={styles.aiInsightLoadingCard} style={{margin: '20px 0', border: '1.5px solid #d0e6ff'}}>
                      <div className={styles.aiTop}>
                        <div className={styles.aiIconBox}>
                          <div className={styles.aiIconSpin}>
                            <RocketOutlined />
                          </div>
                        </div>
                        <div className={styles.aiInfo}>
                          <div className={styles.aiTitle}>AI 洞察生成中</div>
                          <div className={styles.aiSub}>正在后台生成补充问题，你可以继续编辑当前问题清单。</div>
                        </div>
                        <div className={styles.aiStepBadge}>{Math.min(4, Math.floor(aiInsightProgress / 25) + 1)}/4</div>
                      </div>
                      <div className={styles.aiProgressWrap}>
                        <Progress percent={aiInsightProgress} strokeColor={twoColors} showInfo={false} strokeWidth={6} style={{marginTop: 8}} />
                      </div>
                      <div className={styles.aiTasks}>
                        <div className={classNames(styles.taskItem, {[styles.active]: aiInsightProgress >= 0})}>
                          {aiInsightProgress > 25 ? <CheckCircleOutlined className={styles.done} /> : <LoadingOutlined className={styles.loading} />}
                          <span>正在整理企业抓取结果与已有资料...</span>
                        </div>
                        {aiInsightProgress >= 25 && (
                          <div className={classNames(styles.taskItem, styles.active)}>
                            {aiInsightProgress > 50 ? (
                              <CheckCircleOutlined className={styles.done} />
                            ) : (
                              <LoadingOutlined className={styles.loading} />
                            )}
                            <span>正在识别高风险追问点与管理层答复缺口...</span>
                          </div>
                        )}
                        {aiInsightProgress >= 50 && (
                          <div className={classNames(styles.taskItem, styles.active)}>
                            {aiInsightProgress > 75 ? (
                              <CheckCircleOutlined className={styles.done} />
                            ) : (
                              <LoadingOutlined className={styles.loading} />
                            )}
                            <span>正在生成分主题访谈问题，并进行重复问题合并...</span>
                          </div>
                        )}
                        {aiInsightProgress >= 75 && (
                          <div className={classNames(styles.taskItem, styles.active)}>
                            {aiInsightProgress >= 100 ? (
                              <CheckCircleOutlined className={styles.done} />
                            ) : (
                              <LoadingOutlined className={styles.loading} />
                            )}
                            <span>正在输出可直接导入的问题清单...</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    aiInsightList.map((item) => (
                      <div
                        key={item.id}
                        className={classNames(styles.aiQuestionCard, {[styles.selected]: selectedAiKeys.includes(item.id)})}
                        onClick={() => {
                          setSelectedAiKeys((prev) => (prev.includes(item.id) ? prev.filter((k) => k !== item.id) : [...prev, item.id]));
                        }}
                      >
                        <div className={styles.cardSelect}>
                          <div className={classNames(styles.customCheckbox, {[styles.checked]: selectedAiKeys.includes(item.id)})}>
                            {selectedAiKeys.includes(item.id) && <CheckOutlined />}
                          </div>
                        </div>
                        <div className={styles.cardMain}>
                          <div className={styles.cTop}>
                            <span className={styles.cTag}>AI洞察</span>
                            <span className={styles.cTag}>补充建议</span>
                          </div>
                          <div className={styles.cTitle}>{item.questionContent}</div>
                          <div className={styles.cBot}>
                            <span className={styles.aiLabel}>AI 洞察</span>
                            <span className={styles.aiReason}>根据企业经营风险及财务状况提炼生成</span>
                          </div>
                        </div>
                        {selectedAiKeys.includes(item.id) && (
                          <div className={styles.cardStatusBadge}>
                            <span className={styles.statusTxt}>已选中</span>
                            <CheckCircleFilled className={styles.statusIcon} />
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : questionList.length > 0 ? (
              <div className={styles.qListContainer}>
                {isAIInsightDisabled && (
                  <div className={styles.aiDisabledHint}>存在企业名称、文档资料或文本资料中的任意一项后，即可使用 AI 洞察。</div>
                )}
                <div className={styles.qListHeader}>
                  <div className={styles.leftTitle}>
                    当前问题清单：
                    <span style={{color: '#1e293b', marginLeft: 4}}>{currentQuestionListName}</span>
                  </div>
                  {/* <div className={styles.rightInfo}>当前模板：{currentTemplateName}</div> */}
                </div>

                {aiInsightStatus === 'loading' && (
                  <div className={styles.aiInsightLoadingCard}>
                    <div className={styles.aiTop}>
                      <div className={styles.aiIconBox}>
                        <div className={styles.aiIconSpin}>
                          <RocketOutlined />
                        </div>
                      </div>
                      <div className={styles.aiInfo}>
                        <div className={styles.aiTitle}>AI 洞察生成中</div>
                        <div className={styles.aiSub}>正在后台生成补充问题，你可以继续编辑当前问题清单。</div>
                      </div>
                      <div className={styles.aiStepBadge}>{Math.min(4, Math.floor(aiInsightProgress / 25) + 1)}/4</div>
                    </div>
                    <div className={styles.aiProgressWrap}>
                      <Progress percent={aiInsightProgress} strokeColor={twoColors} showInfo={false} strokeWidth={6} style={{marginTop: 8}} />
                    </div>
                    <div className={styles.aiTasks}>
                      <div className={classNames(styles.taskItem, {[styles.active]: aiInsightProgress >= 0})}>
                        {aiInsightProgress > 25 ? <CheckCircleOutlined className={styles.done} /> : <LoadingOutlined className={styles.loading} />}
                        <span>正在整理企业抓取结果与已有资料...</span>
                      </div>
                      {aiInsightProgress >= 25 && (
                        <div className={classNames(styles.taskItem, styles.active)}>
                          {aiInsightProgress > 50 ? <CheckCircleOutlined className={styles.done} /> : <LoadingOutlined className={styles.loading} />}
                          <span>正在识别高风险追问点与管理层答复缺口...</span>
                        </div>
                      )}
                      {aiInsightProgress >= 50 && (
                        <div className={classNames(styles.taskItem, styles.active)}>
                          {aiInsightProgress > 75 ? <CheckCircleOutlined className={styles.done} /> : <LoadingOutlined className={styles.loading} />}
                          <span>正在生成分主题访谈问题，并进行重复问题合并...</span>
                        </div>
                      )}
                      {aiInsightProgress >= 75 && (
                        <div className={classNames(styles.taskItem, styles.active)}>
                          {aiInsightProgress >= 100 ? (
                            <CheckCircleOutlined className={styles.done} />
                          ) : (
                            <LoadingOutlined className={styles.loading} />
                          )}
                          <span>正在输出可直接导入的问题清单...</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className={styles.qListBody}>
                  {isAddingQuestion && (
                    <div className={styles.addQuestionRow}>
                      <Input
                        placeholder="请输入访谈问题內容..."
                        value={newQuestionValue}
                        onChange={(e) => setNewQuestionValue(e.target.value)}
                        onPressEnter={onConfirmAddQuestion}
                        autoFocus
                      />
                      <div className={styles.addActions}>
                        <span className={styles.confirmLink} onClick={onConfirmAddQuestion}>
                          添加问题
                        </span>
                        <span className={styles.divider}>|</span>
                        <span className={styles.cancelLink} onClick={onCancelAddQuestion}>
                          取消
                        </span>
                      </div>
                    </div>
                  )}
                  {questionList.map((q, index) => (
                    <div key={q.id || index} className={styles.questionRow}>
                      <div className={styles.rowTop}>
                        {q.questionType === '1' && <span className={`${styles.qTag} ${styles.blue}`}>模板预设问题</span>}
                        {q.questionType === '2' && <span className={`${styles.qTag} ${styles.purple}`}>AI 洞察问题</span>}
                        {q.questionType === '3' && <span className={`${styles.qTag} ${styles.purple}`}>手动添加问题</span>}
                        {!['1', '2', '3'].includes(String(q.questionType)) && (
                          <span className={`${styles.qTag} ${q.isManual ? styles.purple : styles.blue}`}>{q.isManual ? '手动添加' : '模板预设'}</span>
                        )}
                        {q.status === 'covered' && <span className={`${styles.qTag} ${styles.green}`}>已访谈</span>}
                      </div>
                      <div className={styles.rowMid}>
                        {editingQuestionId === q.id ? (
                          <div className={styles.inlineEditWrap}>
                            <span className={styles.qIndex}>{index + 1}.</span>
                            <Input
                              value={editingQuestionValue}
                              onChange={(e) => setEditingQuestionValue(e.target.value)}
                              autoFocus
                              onPressEnter={() => onConfirmEditQuestion(q.id!)}
                            />
                            <div className={styles.editActions}>
                              <div className={`${styles.iconBtn} ${styles.primary}`} onClick={() => onConfirmEditQuestion(q.id!)}>
                                <CheckOutlined />
                              </div>
                              <div className={styles.iconBtn} onClick={() => setEditingQuestionId(null)}>
                                <CloseOutlined />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className={styles.qTitleWrap}>
                            <span className={styles.qIndex}>{index + 1}.</span>
                            <div className={styles.qTitle}>{q.title}</div>
                          </div>
                        )}
                      </div>
                      {!editingQuestionId && q.desc && (
                        <div className={styles.rowBot}>
                          <div className={styles.qDesc}>{q.desc}</div>
                          {q.answerTime && <div className={styles.answerTime}>{dayjs(q.answerTime).format('YYYY-MM-DD HH:mm:ss')}</div>}
                        </div>
                      )}
                      {!editingQuestionId && (
                        <div className={styles.rowActions}>
                          <Tooltip title="编辑">
                            <div
                              className={styles.actionBtn}
                              onClick={() => {
                                setEditingQuestionId(q.id);
                                setEditingQuestionValue(q.title);
                              }}
                            >
                              <EditOutlined />
                            </div>
                          </Tooltip>
                          <Tooltip title="删除">
                            <div className={styles.actionBtn} onClick={() => onDeleteQuestion(q.id)}>
                              <CloseOutlined />
                            </div>
                          </Tooltip>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className={styles.qListFooter}>共 {questionList.length} 个访谈问题</div>
              </div>
            ) : (
              <div className="empty">暂无问题清单</div>
            )}
          </div>
        </div>
      </div>
      <Modal
        title={<div style={{fontSize: '18px', fontWeight: 600}}>选择问题清单</div>}
        width={420}
        open={isQuestionModalVisible}
        footer={null}
        centered
        styles={{
          mask: {backdropFilter: 'blur(4px)'},
          header: {marginBottom: '8px'},
          content: {borderRadius: '20px', padding: '12px 16px'},
          body: {padding: '0', maxHeight: '600px', overflowY: 'auto'},
        }}
        onCancel={() => setIsQuestionModalVisible(false)}
        afterOpenChange={(open: boolean) => {
          showMask(open);
        }}
      >
        <List
          loading={switchingQuestion}
          dataSource={allQuestionsTemplates}
          renderItem={(item) => {
            const isCurrent = String(item.id) === String(itemDetail.questionId);
            return (
              <List.Item
                className={classNames(styles.tplSelectItem, isCurrent && styles.active, isCurrent && styles.disabled)}
                onClick={() => {
                  if (isCurrent) {
                    setIsQuestionModalVisible(false);
                    return;
                  }
                  onConfirmSelectQuestionTemplate(item.id, item.templateName);
                }}
              >
                <div className={styles.tplInfo}>
                  <Tooltip title={item.templateName}>
                    <div className={styles.name}>{item.templateName}</div>
                  </Tooltip>
                  <div className={styles.count}>{item.questionList?.length || 0} 个预制问题</div>
                </div>
                <div className={styles.tplAction}>
                  {isCurrent ? <div className={styles.currentBadge}>当前使用</div> : <RightOutlined className="arrow" />}
                </div>
              </List.Item>
            );
          }}
        />
      </Modal>

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
              readOnly={itemDetail.status === '5'}
              onChange={(e) => setSupplementaryContent(e.target.value)}
            />
          </div>
          <div className="actions">
            <Button type="primary" onClick={onSupplementarySubmit} disabled={itemDetail.status === '5'}>
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

      {/* 企业数据抓取结果 Modal */}
      <Modal
        title={
          <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: '#1677ff',
                color: '#fff',
                fontSize: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ApiOutlined />
            </div>
            <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', lineHeight: 1.2}}>
              <div style={{fontSize: 16, fontWeight: 800, color: '#1e293b', marginBottom: '4px'}}>企业数据抓取结果</div>
              <div style={{fontSize: 12, color: '#1677ff', opacity: 0.8}}>深度扫描结果 ·</div>
            </div>
          </div>
        }
        open={showScrapingResultModal}
        onCancel={() => setShowScrapingResultModal(false)}
        footer={
          <Button onClick={() => setShowScrapingResultModal(false)} style={{borderRadius: 8, padding: '0 24px'}}>
            关闭
          </Button>
        }
        width={760}
        destroyOnClose
        centered
        className={styles.scrapingResultUiModal}
      >
        <div className={styles.scrapingResultBody}>
          {isEnterpriseLoading ? (
            <div style={{padding: '40px 0', textAlign: 'center'}}>
              <SyncOutlined spin style={{fontSize: 24, color: '#1677ff', marginBottom: 12}} />
              <div style={{fontSize: 13, color: '#64748b'}}>正在深度扫描全网线索...</div>
            </div>
          ) : (
            <>
              <div className={styles.sectionWrap}>
                <div className={styles.secHeader}>
                  <BankOutlined style={{color: '#1677ff', marginRight: 6}} /> 企业概况
                </div>
                <div className={styles.dataGrid}>
                  <div className={styles.dataCard}>
                    <div className={styles.label}>企业名称</div>
                    <div className={styles.val}>{enterpriseInfo?.result?.name || itemDetail.companyName || '暂无'}</div>
                  </div>
                  <div className={styles.dataCard}>
                    <div className={styles.label}>企业状态</div>
                    <div className={styles.val}>{enterpriseInfo?.result?.regStatus || '暂无'}</div>
                  </div>
                  <div className={styles.dataCard}>
                    <div className={styles.label}>法定代表人</div>
                    <div className={styles.val}>{enterpriseInfo?.result?.legalPersonName || '暂无'}</div>
                  </div>
                  <div className={styles.dataCard}>
                    <div className={styles.label}>统一社会信用代码</div>
                    <div className={styles.val}>{enterpriseInfo?.result?.creditCode || itemDetail.creditCode || '暂无'}</div>
                  </div>
                  <div className={styles.dataCard}>
                    <div className={styles.label}>注册资本</div>
                    <div className={styles.val}>{enterpriseInfo?.result?.regCapital || '暂无'}</div>
                  </div>
                  <div className={styles.dataCard}>
                    <div className={styles.label}>成立日期</div>
                    <div className={styles.val}>
                      {enterpriseInfo?.result?.estiblishTime ? new Date(enterpriseInfo.result.estiblishTime).toLocaleDateString() : '暂无'}
                    </div>
                  </div>
                  <div className={styles.dataCard}>
                    <div className={styles.label}>所属行业</div>
                    <div className={styles.val}>{enterpriseInfo?.result?.industryAll?.category || enterpriseInfo?.result?.industry || '暂无'}</div>
                  </div>
                  <div className={styles.dataCard}>
                    <div className={styles.label}>人员规模</div>
                    <div className={styles.val}>{enterpriseInfo?.result?.staffNumRange || enterpriseInfo?.result?.staffSize || '暂无'}</div>
                  </div>
                  <div className={styles.dataCard}>
                    <div className={styles.label}>注册地址</div>
                    <div className={styles.val}>{enterpriseInfo?.result?.regLocation || '暂无'}</div>
                  </div>
                </div>
              </div>

              <div className={styles.sectionWrap} style={{marginTop: 24}}>
                <div className={styles.secHeader}>
                  <SafetyCertificateOutlined style={{color: '#1677ff', marginRight: 6}} /> 抓取结果明细
                </div>
                <div className={styles.dataGrid} style={{gridTemplateColumns: 'repeat(2, 1fr)'}}>
                  <div className={styles.dataCard}>
                    <div className={styles.label}>公司类型</div>
                    <div className={styles.val}>{enterpriseInfo?.result?.companyOrgType || '暂无'}</div>
                  </div>
                  <div className={styles.dataCard}>
                    <div className={styles.label}>股票简称</div>
                    <div className={styles.val}>{enterpriseInfo?.result?.bondName || '暂无'}</div>
                  </div>
                  <div className={styles.dataCard}>
                    <div className={styles.label}>股票代码</div>
                    <div className={styles.val}>{enterpriseInfo?.result?.bondNum || '暂无'}</div>
                  </div>
                  <div className={styles.dataCard}>
                    <div className={styles.label}>登记机关</div>
                    <div className={styles.val}>{enterpriseInfo?.result?.regInstitute || '暂无'}</div>
                  </div>
                  <div className={styles.dataCard}>
                    <div className={styles.label}>注册号</div>
                    <div className={styles.val}>{enterpriseInfo?.result?.regNumber || '暂无'}</div>
                  </div>
                  <div className={styles.dataCard}>
                    <div className={styles.label}>组织机构代码</div>
                    <div className={styles.val}>{enterpriseInfo?.result?.orgNumber || '暂无'}</div>
                  </div>
                  <div className={styles.dataCard}>
                    <div className={styles.label}>核准日期</div>
                    <div className={styles.val}>
                      {enterpriseInfo?.result?.approvedTime ? new Date(enterpriseInfo.result.approvedTime).toLocaleDateString() : '暂无'}
                    </div>
                  </div>
                  <div className={styles.dataCard}>
                    <div className={styles.label}>曾用名</div>
                    <div className={styles.val}>{enterpriseInfo?.result?.historyNames || '暂无'}</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </Modal>

      <Modal
        width={440}
        styles={{header: {marginBottom: 4}}}
        title={<div style={{fontSize: '18px', fontWeight: 600}}>{folderModal?.mode === 'rename' ? '重命名目录' : '新建目录'}</div>}
        open={!!folderModal}
        okText={folderModal?.mode === 'rename' ? '确认重命名' : '创建目录'}
        cancelText="取消"
        onOk={onSubmitFolderModal}
        confirmLoading={folderSubmitting}
        onCancel={closeFolderModal}
        afterOpenChange={(open: boolean) => {
          showMask(open);
        }}
      >
        <div className={styles.folderModalBody}>
          <div className={styles.folderModalHint}>
            {folderModal?.mode === 'rename' ? '目录重命名后，当前目录树会以服务端最新结果重新刷新。' : `新目录将创建在 ${selectedFolderPath} 下。`}
          </div>
          <Input
            allowClear
            autoFocus
            maxLength={60}
            value={folderNameValue}
            placeholder="请输入目录名称"
            onChange={(e) => setFolderNameValue(sanitizeNodeName(e.target.value))}
            onPressEnter={onSubmitFolderModal}
          />
        </div>
      </Modal>

      <Modal
        width={590}
        title="编辑尽调"
        open={isEditModalVisible}
        footer={null}
        destroyOnClose
        onCancel={() => {
          showMask(false);
          setIsEditModalVisible(false);
        }}
        afterOpenChange={(open: boolean) => {
          showMask(open);
        }}
      >
        <Edit
          configs={configs!}
          data={{
            ...itemDetail,
            questions: configs && {
              tpl: String(
                itemDetail.questionId ||
                  configs.template.list.find((t) => String(t.id) === String(itemDetail.templateId))?.questionId ||
                  configs.questions.selected
              ),
              list:
                configs.questions.tpls.find(
                  (q) =>
                    String(q.value) ===
                    String(
                      itemDetail.questionId ||
                        configs.template.list.find((t) => String(t.id) === String(itemDetail.templateId))?.questionId ||
                        configs.questions.selected
                    )
                )?.list || [],
            },
            template: configs?.template.list.find((t) => String(t.id) === String(itemDetail.templateId)) && {
              id: itemDetail.templateId!,
              name: configs?.template.list.find((t) => String(t.id) === String(itemDetail.templateId))?.title || '',
            },
          }}
          onCancel={() => {
            showMask(false);
            setIsEditModalVisible(false);
          }}
          onSubmit={onEditSubmit}
        />
      </Modal>
      <Modal
        width={440}
        styles={{header: {marginBottom: 4}}}
        title={<div style={{fontSize: '18px', fontWeight: 600}}>重命名文件</div>}
        open={!!renameFileModal}
        onOk={() => {
          const value = renameFileName.trim();
          if (value && value !== renameFileModal?.fileName) {
            onRenameReport(renameFileModal!.id, value);
          }
          setRenameFileModal(null);
        }}
        onCancel={() => setRenameFileModal(null)}
        destroyOnClose
      >
        <div style={{padding: '4px 0'}}>
          <div style={{marginBottom: 8, color: '#64748b', fontSize: 12}}>请输入新的文件名称：</div>
          <Input
            allowClear
            autoFocus
            maxLength={255}
            value={renameFileName}
            onChange={(e) => setRenameFileName(e.target.value.replace(/[<>?/\\|*]|\.\.|[\r\n]/g, ''))}
            onPressEnter={() => {
              const value = renameFileName.trim();
              if (value && value !== renameFileModal?.fileName) {
                onRenameReport(renameFileModal!.id, value);
              }
              setRenameFileModal(null);
            }}
          />
        </div>
      </Modal>
    </div>
  );
};

export default memo(Component);
