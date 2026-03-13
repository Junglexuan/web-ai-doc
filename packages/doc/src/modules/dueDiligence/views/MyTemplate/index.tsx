import {
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  EllipsisOutlined,
  ExclamationCircleOutlined,
  InboxOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {Dispatch, DocumentHead} from '@elux/react-web';
import {Button, Dropdown, Input, Modal, Progress, Space, Tag, Tooltip, Upload, message} from 'antd';
import {FC, memo, useEffect, useMemo, useState} from 'react';
import WordIcon from '@/assets/images/word.svg';
import {SiteInfo, SitesUrl} from '@/Global';
import {confirm, showMask, useDebounceEvent, useEvent, useThrottleEvent} from '@/utils/tools';
import {DueDiligenceAPI} from '../../api';
import InviteModal from '../../components/InviteModal';
import {TemplateRecord} from '../../entity';
import styles from './index.module.less';

interface Props {
  dispatch: Dispatch;
}

const StatusMap: {[key: string]: {text: string; color: string}} = {
  '1': {text: '上传中', color: 'processing'},
  '2': {text: '上传成功', color: 'success'},
  '3': {text: '上传失败', color: 'error'},
};

const MyTemplate: FC<Props> = ({dispatch}) => {
  const [list, setList] = useState<TemplateRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [reportName, setReportName] = useState('');
  const [fileList, setFileList] = useState<File[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'processing'>('all');
  const [searchText, setSearchText] = useState('');
  const [filterText, setFilterText] = useState('');
  const [showInvite, setShowInvite] = useState(false);

  const onSearch = useDebounceEvent((val: string) => {
    setFilterText(val);
  }, 500);

  const fetchList = useThrottleEvent(() => {
    setLoading(true);
    const apiCall = activeTab === 'all' ? DueDiligenceAPI.getTemplateList() : DueDiligenceAPI.queryApproveReport();

    apiCall
      .then((data: any) => {
        if (activeTab === 'all') {
          // 将 ReportTemplate 映射为 TemplateRecord 结构以便展示
          const mapped = (data || []).map((item: any) => ({
            id: item.id,
            approveReportName: item.reportTemplateName || '',
            approveReportStatus: '2', // 上传成功/已通过
            approveTemplateUrl: item.outTemplateUrl || '',
            viewTemplateUrl: item.viewTemplateUrl || '',
            createDate: item.createDate || '-', // 如果接口没返回 createDate，展示占位符
          }));
          setList(mapped);
        } else {
          setList(data || []);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  });

  useEffect(() => {
    fetchList();
  }, [activeTab, fetchList]);

  useEffect(() => {
    showMask(showUpload || showInvite);
  }, [showUpload, showInvite]);

  const filteredList = useMemo(() => {
    let result = list;
    if (activeTab === 'processing') {
      // 不再过滤状态，直接展示接口返回的所有数据
    }
    if (filterText) {
      result = result.filter((item) => item.approveReportName.toLowerCase().includes(filterText.toLowerCase()));
    }
    return result;
  }, [list, activeTab, filterText]);

  const onRename = useThrottleEvent((id: string, oldName: string) => {
    let newName = oldName;
    Modal.confirm({
      title: '重命名模板',
      content: <Input defaultValue={oldName} onChange={(e) => (newName = e.target.value)} />,
      afterOpenChange: (open) => showMask(open),
      onOk: () => {
        if (!newName || newName === oldName) return;
        DueDiligenceAPI.updateApproveReport({id, approveReportName: newName}).then(() => {
          message.success('重命名成功');
          fetchList();
        });
      },
    });
  });

  const onDelete = useThrottleEvent((id: string) => {
    confirm('确定要删除该模板吗？', (ok) => {
      if (ok) {
        DueDiligenceAPI.deleteApproveReport(id).then(() => {
          message.success('删除成功');
          fetchList();
        });
      }
    });
  });

  const onUploadSubmit = useThrottleEvent(() => {
    if (!reportName.trim()) {
      message.warning('请输入模板名称');
      return;
    }
    if (fileList.length === 0) {
      message.warning('请选择模板文件');
      return;
    }
    setLoading(true);

    const uploadPromises = fileList.map((file, index) => {
      const name = fileList.length > 1 ? `${reportName}_${index + 1}` : reportName;
      return DueDiligenceAPI.addApproveReport({reportName: name, file});
    });

    Promise.all(uploadPromises)
      .then((results) => {
        const failedCount = results.filter((res) => !res.success).length;
        if (failedCount === 0) {
          message.success('上传成功');
          setShowUpload(false);
          setReportName('');
          setFileList([]);
          fetchList();
        } else {
          message.error(`有 ${failedCount} 个文件上传失败`);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  });

  const renderCard = (record: TemplateRecord) => {
    const status = StatusMap[record.approveReportStatus] || {text: '未知', color: 'default'};
    const isProcessing = record.approveReportStatus === '1'; // 上传中
    const isFailed = record.approveReportStatus === '3'; // 上传失败

    return (
      <div className={styles.card} key={record.id}>
        <div className="card-hd">
          <img src={WordIcon} className="word-icon" alt="word" />
          <div className="name-wrap">
            <Tooltip title={record.approveReportName}>
              <div className="name">{record.approveReportName}</div>
            </Tooltip>
            {isFailed && (
              <Tooltip title={record.errorMsg || '未通过：模板包含敏感词汇或话术不符合合规要求'}>
                <ExclamationCircleOutlined style={{color: '#ff4d4f', fontSize: 14, cursor: 'pointer', marginLeft: 4}} />
              </Tooltip>
            )}
          </div>
          {activeTab === 'processing' && <span className={`status-tag status-${record.approveReportStatus}`}>{status.text}</span>}
        </div>

        {isProcessing && (
          <div className="card-bd">
            <div className={styles.processingLayout}>
              <div className="divider" />
              <div className="content">
                <Progress percent={45} strokeColor="#4F46E5" showInfo={false} size="small" />
                <div className="hint">预计2小时后完成</div>
              </div>
            </div>
          </div>
        )}

        {!isProcessing && (
          <div className="card-ft">
            <div className="date">{record.createDate}</div>
            {activeTab === 'all' ? (
              <div
                className="preview-btn"
                onClick={() => {
                  const url = record.viewTemplateUrl || record.approveTemplateUrl;
                  if (!url) {
                    message.error('暂无预览地址');
                    return;
                  }
                  DueDiligenceAPI.viewReportUrl(null, url).then((res) => {
                    if (res.success && res.data) {
                      window.open(res.data, '_blank');
                    } else {
                      message.error(res.message || '获取预览地址失败');
                    }
                  });
                }}
              >
                预览
              </div>
            ) : (
              <Dropdown
                menu={{
                  items: [
                    {key: 'rename', label: '重命名', icon: <EditOutlined />, onClick: () => onRename(record.id, record.approveReportName)},
                    {key: 'delete', label: '删除模板', icon: <DeleteOutlined />, danger: true, onClick: () => onDelete(record.id)},
                  ],
                }}
                overlayClassName={styles.actionDropdown}
                trigger={['click']}
                placement="bottomRight"
              >
                <EllipsisOutlined className="more-btn" />
              </Dropdown>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={styles.root}>
      <DocumentHead title={'我的模版-' + SiteInfo.name} />
      <div className="page-header">
        <div className="title">我的模板</div>
        <div className="header-actions">
          <Input
            className="search-input"
            placeholder="请搜索模板名称"
            allowClear
            value={searchText}
            onChange={(e) => {
              const val = e.target.value;
              setSearchText(val);
              onSearch(val);
            }}
            onPressEnter={() => {
              onSearch(searchText);
            }}
            suffix={
              <SearchOutlined
                onClick={() => {
                  onSearch(searchText);
                }}
              />
            }
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setShowUpload(true)} style={{borderRadius: 10, fontWeight: 500}}>
            上传模板
          </Button>
          <Button onClick={() => setShowInvite(true)} style={{borderRadius: 10, fontWeight: 500}}>
            模板分享
          </Button>
        </div>
      </div>

      <div className="tab-container">
        <div className={`tab-item ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
          我的模板
        </div>
        <div className={`tab-item ${activeTab === 'processing' ? 'active' : ''}`} onClick={() => setActiveTab('processing')}>
          处理中
        </div>
      </div>

      <div className="grid-content">
        {loading && list.length === 0 ? (
          <div className="loading-state">加载中...</div>
        ) : filteredList.length > 0 ? (
          <div className="card-grid">{filteredList.map(renderCard)}</div>
        ) : (
          <div className={styles['empty-state']}>
            <img src={require('@/assets/imgs/null.png')} alt="暂无模板内容" />
            <p>暂无模板内容</p>
          </div>
        )}
      </div>

      <Modal
        title="上传文件"
        open={showUpload}
        onOk={onUploadSubmit}
        confirmLoading={loading}
        className={styles.uploadModal}
        onCancel={() => {
          setShowUpload(false);
          setReportName('');
          setFileList([]);
        }}
        okText="确定"
        cancelText="取消"
        width={540}
        centered
      >
        <div className={styles.uploadContainer}>
          <div className={styles.formItem}>
            <span className={styles.label}>
              <span className={styles.required}>*</span>模板名称
            </span>
            <Input placeholder="请输入模板名称" value={reportName} onChange={(e) => setReportName(e.target.value)} className={styles.input} />
          </div>
          <Upload.Dragger
            accept=".doc,.docx"
            beforeUpload={(f) => {
              const isDoc = f.name.endsWith('.doc') || f.name.endsWith('.docx');
              if (!isDoc) {
                message.error('只能上传 .doc 或 .docx 格式的模板文件');
                return Upload.LIST_IGNORE;
              }
              setFileList([f]);
              if (!reportName) {
                setReportName(f.name.split('.').slice(0, -1).join('.'));
              }
              return false;
            }}
            showUploadList={false}
            className={styles.dragger}
          >
            <div className={styles.draggerInner}>
              {fileList.length === 0 ? (
                <div className={styles.emptyUpload}>
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined style={{color: '#4F46E5'}} />
                  </p>
                  <p className="ant-upload-text">点击或将文件拖拽到这里上传，单次可上传1个文件</p>
                  <p className="ant-upload-hint">支持.doc、.docx格式文件，不超过50MB</p>
                </div>
              ) : (
                <div className={styles.selectedFiles}>
                  {fileList.map((f, index) => (
                    <div className={styles.fileItem} key={index} onClick={(e) => e.stopPropagation()}>
                      <div className={styles.fileInfo}>
                        <img src={WordIcon} className={styles.wordIcon} alt="word" />
                        <span className={styles.fileName}>{f.name}</span>
                      </div>
                      <CloseOutlined
                        className={styles.removeIcon}
                        onClick={() => {
                          setFileList([]);
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Upload.Dragger>
        </div>
      </Modal>
      <InviteModal open={showInvite} onClose={() => setShowInvite(false)} onSuccess={fetchList} />
    </div>
  );
};

export default memo(MyTemplate);
