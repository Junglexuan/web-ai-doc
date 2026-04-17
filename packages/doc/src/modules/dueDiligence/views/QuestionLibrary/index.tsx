import {BookOutlined, DeleteOutlined, EditOutlined, LoadingOutlined, PlusOutlined} from '@ant-design/icons';
import {Button, Card, Checkbox, Input, Modal, Popconfirm, Spin, Typography, message} from 'antd';
import classNames from 'classnames';
import {FC, useEffect, useState} from 'react';
import {getCurUserId} from '@/utils/tools';
import {DueDiligenceAPI} from '../../api';
import {TemplateTypeEnum, TemplateTypeMap} from '../../entity';
import styles from './index.module.less';

const {Title, Text} = Typography;

// 数据结构定义
interface QuestionGroup {
  id: string;
  templateName: string;
  templateType?: string;
  templateDesc?: string;
  templateStatus?: string;
  businessId?: string | null;
  recStatus?: string;
  createUser?: string | number;
  remark?: string;
  questionList?: QuestionItem[];
}

interface QuestionItem {
  id: string;
  questionName: string;
  CHECKED?: boolean;
}

const QuestionLibrary: FC = () => {
  const [groups, setGroups] = useState<QuestionGroup[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 新建集合相关状态
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupRemark, setNewGroupRemark] = useState('');

  // 新增问题相关状态
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [newQuestionName, setNewQuestionName] = useState('');

  // 编辑集合相关状态
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editGroupName, setEditGroupName] = useState('');
  const [editGroupDesc, setEditGroupDesc] = useState('');

  // 编辑问题相关状态
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editQuestionName, setEditQuestionName] = useState('');

  // 批量操作状态
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);

  const fetchGroups = () => {
    setLoading(true);
    DueDiligenceAPI.getTemplateInfoList()
      .then((data) => {
        setGroups(data || []);
        if (data && data.length > 0 && !activeGroupId) {
          setActiveGroupId(String(data[0].id));
        }
      })
      .catch((err) => {
        message.error('加载问题清单失败');
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // 初始化加载数据
  useEffect(() => {
    fetchGroups();
  }, []);

  // 切换集合时，重置所有编辑/新增状态，并清空选择项
  useEffect(() => {
    setIsAddingQuestion(false);
    setNewQuestionName('');
    setEditingQuestionId(null);
    setEditQuestionName('');
    setSelectedQuestionIds([]);
  }, [activeGroupId]);

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) {
      message.warning('请输入问题集合名称');
      return;
    }
    setLoading(true);
    DueDiligenceAPI.addQuestionTemplate(newGroupName.trim(), newGroupRemark.trim())
      .then(() => {
        message.success('模板创建成功');
        setIsCreatingGroup(false);
        setNewGroupName('');
        setNewGroupRemark('');
        fetchGroups();
      })
      .catch((err) => {
        console.error(err);
        message.error('创建模板失败，请重试');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleCancelCreateGroup = () => {
    setNewGroupName('');
    setNewGroupRemark('');
    setIsCreatingGroup(false);
  };

  const handleEditGroup = (group: QuestionGroup) => {
    setEditingGroupId(group.id);
    setEditGroupName(group.templateName);
    setEditGroupDesc(group.templateDesc || group.remark || '');
  };

  const handleUpdateGroup = () => {
    if (!editGroupName.trim()) {
      message.warning('请输入问题集合名称');
      return;
    }
    setLoading(true);
    DueDiligenceAPI.updateQuestionTemplate({
      id: editingGroupId!,
      templateName: editGroupName.trim(),
      templateDesc: editGroupDesc.trim(),
    })
      .then(() => {
        message.success('模板更新成功');
        setEditingGroupId(null);
        fetchGroups();
      })
      .catch((err) => {
        console.error(err);
        message.error('更新模板失败');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleDeleteGroup = (id: string) => {
    setLoading(true);
    DueDiligenceAPI.deleteQuestionTemplate(id)
      .then(() => {
        message.success('模板已删除');
        if (activeGroupId === id) {
          setActiveGroupId(null);
        }
        fetchGroups();
      })
      .catch((err) => {
        console.error(err);
        message.error('删除模板失败');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleSaveQuestion = (isContinue: boolean = false) => {
    if (!newQuestionName.trim()) {
      message.warning('请输入问题内容');
      return;
    }
    if (!activeGroupId) {
      message.warning('请先选择一个问题集合');
      return;
    }

    setLoading(true);
    DueDiligenceAPI.addQuestionItem(newQuestionName.trim(), activeGroupId)
      .then(() => {
        message.success('保存成功');
        setNewQuestionName('');
        if (!isContinue) {
          setIsAddingQuestion(false);
        }
        fetchGroups(); // 刷新数据以显示新增加的问题
      })
      .catch((err) => {
        console.error(err);
        message.error('保存失败，请重试');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleCancelAddQuestion = () => {
    setNewQuestionName('');
    setIsAddingQuestion(false);
  };

  const handleStartEditQuestion = (q: QuestionItem) => {
    setEditingQuestionId(q.id);
    setEditQuestionName(q.questionName);
  };

  const handleCancelEditQuestion = () => {
    setEditingQuestionId(null);
    setEditQuestionName('');
  };

  const handleUpdateQuestion = () => {
    if (!editQuestionName.trim()) {
      message.warning('请输入问题内容');
      return;
    }
    setLoading(true);
    DueDiligenceAPI.updateQuestionItem({
      id: editingQuestionId!,
      questionName: editQuestionName.trim(),
    })
      .then(() => {
        message.success('修改成功');
        setEditingQuestionId(null);
        fetchGroups();
      })
      .catch((err) => {
        console.error(err);
        message.error('保存失败，请重试');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleDeleteQuestion = (id: string) => {
    setLoading(true);
    DueDiligenceAPI.deleteQuestionItem(id)
      .then(() => {
        message.success('问题已删除');
        setSelectedQuestionIds((prev) => prev.filter((itemId) => itemId !== id));
        fetchGroups();
      })
      .catch((err) => {
        console.error(err);
        message.error('删除问题失败，请重试');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleBatchDeleteQuestion = () => {
    if (selectedQuestionIds.length === 0) return;
    setLoading(true);
    DueDiligenceAPI.batchDeleteQuestionItems(selectedQuestionIds)
      .then(() => {
        message.success(`成功删除 ${selectedQuestionIds.length} 条问题`);
        setSelectedQuestionIds([]);
        fetchGroups();
      })
      .catch((err) => {
        console.error(err);
        message.error('批量删除失败，请重试');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const toggleSelectQuestion = (id: string) => {
    setSelectedQuestionIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedQuestionIds(currentQuestions.filter((q) => !q.CHECKED).map((q) => q.id));
    } else {
      setSelectedQuestionIds([]);
    }
  };

  const activeGroup = groups.find((g) => String(g.id) === activeGroupId);
  const currentQuestions = activeGroup?.questionList || [];
  const hasEditPermission = activeGroup?.templateType === '2' && String(activeGroup?.createUser) === String(getCurUserId());

  return (
    <div className={styles.root}>
      {/* 左侧集合列表 */}
      <div className={styles.sider}>
        <div className={styles.siderHeader}>
          <div className={styles.title}>
            <span className={styles.label}>问题集合</span>
            <span className={styles.subTitle}>选择一套问题清单进行管理</span>
          </div>
          <Button icon={<PlusOutlined />} onClick={() => setIsCreatingGroup(true)} style={{borderRadius: 12, fontWeight: 700, height: 38}}>
            新建
          </Button>
        </div>

        {isCreatingGroup && (
          <div className={styles.addGroupContainer}>
            <div className={styles.groupTitle}>
              <BookOutlined className={styles.icon} />
              <span>新建问题集合</span>
            </div>
            <div className={styles.inputGroup}>
              <Input placeholder="输入问题集合名称..." value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} />
              <Input placeholder="输入问题集合说明（选填）..." value={newGroupRemark} onChange={(e) => setNewGroupRemark(e.target.value)} />
            </div>
            <div className={styles.footer}>
              <Button className={styles.cancelBtn} onClick={handleCancelCreateGroup}>
                取消
              </Button>
              <Button className={styles.submitBtn} onClick={handleCreateGroup}>
                创建问题集合
              </Button>
            </div>
          </div>
        )}

        <div className={styles.list}>
          {loading && groups.length === 0 ? (
            <div style={{textAlign: 'center', padding: '20px'}}>
              <Spin indicator={<LoadingOutlined style={{fontSize: 24}} spin />} />
            </div>
          ) : (
            groups.map((group) => (
              <div
                key={group.id}
                className={`${styles.item} ${activeGroupId === String(group.id) ? styles.active : ''}`}
                onClick={() => setActiveGroupId(String(group.id))}
              >
                <div className={styles.itemTitle}>
                  <div className={styles.nameWrapper}>
                    {group.templateType && TemplateTypeMap[group.templateType] && (
                      <span className={styles.typeTag}>
                        {group.templateType === TemplateTypeEnum.PERSONAL && String(group.createUser) !== String(getCurUserId())
                          ? '组织'
                          : group.templateType === TemplateTypeEnum.PRESET
                            ? '内置'
                            : TemplateTypeMap[group.templateType]}
                      </span>
                    )}
                    <span className={styles.name}>{group.templateName}</span>
                  </div>
                  <div className={styles.sideActions}>
                    {group.templateType === '2' && String(group.createUser) === String(getCurUserId()) && (
                      <>
                        <EditOutlined
                          className={styles.actionIcon}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditGroup(group);
                          }}
                        />
                        <Popconfirm
                          title="确定删除该问题集合吗？"
                          onConfirm={() => handleDeleteGroup(group.id)}
                          onCancel={(e) => e?.stopPropagation()}
                          okText="确定"
                          cancelText="取消"
                        >
                          <DeleteOutlined className={`${styles.actionIcon} ${styles.deleteIcon}`} onClick={(e) => e.stopPropagation()} />
                        </Popconfirm>
                      </>
                    )}
                    <span className={styles.count}>{group.questionList?.length || 0}</span>
                  </div>
                </div>
                <div className={styles.desc}>{group.templateDesc || group.remark || '暂无描述内容'}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 右侧问题详情 */}
      <div className={styles.content}>
        <div className={styles.contentHeader}>
          <div className={styles.info}>
            <div className={styles.name}>{activeGroup?.templateName || '未选择集合'}</div>
            <div className={styles.desc}>{activeGroup?.templateDesc || activeGroup?.remark || '暂无描述内容'}</div>
          </div>
          {hasEditPermission && (
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsAddingQuestion(true)}>
              新增问题
            </Button>
          )}
        </div>

        <div className={styles.questionList}>
          {isAddingQuestion && (
            <div className={styles.addQuestionContainer}>
              <div className={styles.title}>
                <PlusOutlined />
                <span>新增问题</span>
                <span className={styles.required}>*</span>
              </div>
              <Input.TextArea rows={4} placeholder="输入问题内容..." value={newQuestionName} onChange={(e) => setNewQuestionName(e.target.value)} />
              <div className={styles.footer}>
                <Button className={`${styles.btn} ${styles.cancelBtn}`} onClick={handleCancelAddQuestion}>
                  取消
                </Button>
                <Button className={`${styles.btn} ${styles.saveBtn}`} onClick={() => handleSaveQuestion(false)}>
                  保存
                </Button>
                <Button
                  className={classNames(styles.btn, styles.continueBtn, {[styles.active]: !!newQuestionName.trim()})}
                  onClick={() => handleSaveQuestion(true)}
                  disabled={!newQuestionName.trim()}
                >
                  保存并继续新增
                </Button>
              </div>
            </div>
          )}

          {hasEditPermission && currentQuestions.length > 0 && (
            <div className={styles.batchActionBar}>
              <div className={styles.left}>
                <Checkbox
                  indeterminate={selectedQuestionIds.length > 0 && selectedQuestionIds.length < currentQuestions.length}
                  checked={selectedQuestionIds.length > 0 && selectedQuestionIds.length === currentQuestions.length}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                >
                  全选
                </Checkbox>
                {selectedQuestionIds.length > 0 && <span className={styles.selectedCount}>已选 {selectedQuestionIds.length} 项</span>}
              </div>
              {selectedQuestionIds.length > 0 && (
                <Popconfirm
                  title={`确定删除选中的 ${selectedQuestionIds.length} 条问题吗？`}
                  onConfirm={handleBatchDeleteQuestion}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button danger type="link" icon={<DeleteOutlined />}>
                    批量删除
                  </Button>
                </Popconfirm>
              )}
            </div>
          )}

          {loading ? (
            <div style={{textAlign: 'center', padding: '100px'}}>
              <Spin size="large" />
            </div>
          ) : (
            <>
              {currentQuestions.map((q, idx) => {
                const isEditing = q.id === editingQuestionId;
                if (isEditing) {
                  return (
                    <div key={q.id || idx} className={styles.editQuestionWrapper}>
                      <Input.TextArea
                        autoFocus
                        rows={3}
                        value={editQuestionName}
                        onChange={(e) => setEditQuestionName(e.target.value)}
                        className={styles.editInput}
                      />
                      <div className={styles.editFooter}>
                        <Button className={styles.cancelBtn} onClick={handleCancelEditQuestion}>
                          取消
                        </Button>
                        <Button type="primary" className={styles.saveBtn} onClick={handleUpdateQuestion} loading={loading}>
                          保存
                        </Button>
                      </div>
                    </div>
                  );
                }
                return (
                  <div key={q.id || idx} className={`${styles.questionItem} ${selectedQuestionIds.includes(q.id) ? styles.selected : ''}`}>
                    {hasEditPermission && !q.CHECKED && (
                      <div className={styles.checkboxWrapper}>
                        <Checkbox checked={selectedQuestionIds.includes(q.id)} onChange={() => toggleSelectQuestion(q.id)} />
                      </div>
                    )}
                    <div className={styles.index}>{idx + 1}.</div>
                    <div className={styles.main}>
                      <div className={styles.text}>{q.questionName}</div>
                    </div>
                    <div className={styles.actions}>
                      {hasEditPermission && !q.CHECKED && (
                        <>
                          <Button type="text" icon={<EditOutlined />} onClick={() => handleStartEditQuestion(q)} />
                          <Popconfirm
                            title="确定删除该问题吗？"
                            onConfirm={() => handleDeleteQuestion(q.id)}
                            onCancel={(e) => e?.stopPropagation()}
                            okText="确定"
                            cancelText="取消"
                          >
                            <Button type="text" danger icon={<DeleteOutlined />} onClick={(e) => e.stopPropagation()} />
                          </Popconfirm>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
              {currentQuestions.length === 0 && !loading && (
                <Card style={{textAlign: 'center', padding: '60px', color: '#94a3b8', borderRadius: 16, border: '1px dashed #e2e8f0'}}>
                  该集合下暂无问题
                </Card>
              )}
            </>
          )}
        </div>
      </div>

      <Modal
        open={!!editingGroupId}
        onCancel={() => setEditingGroupId(null)}
        confirmLoading={loading}
        destroyOnClose
        closable={true}
        centered
        width={520}
        styles={{
          mask: {backdropFilter: 'blur(4px)'},
          content: {borderRadius: '20px', padding: '28px 32px'},
          header: {marginBottom: '24px'},
        }}
        title={<div className={styles.modalTitle}>编辑问题集合</div>}
        footer={
          <div className={styles.modalFooter}>
            <Button className={styles.cancelBtn} onClick={() => setEditingGroupId(null)}>
              取消
            </Button>
            <Button type="primary" className={styles.saveBtn} onClick={handleUpdateGroup} loading={loading}>
              确定
            </Button>
          </div>
        }
      >
        <div className={styles.modalBody}>
          <div className={styles.formItem}>
            <div className={styles.label}>集合名称</div>
            <Input className={styles.input} placeholder="输入问题集合名称" value={editGroupName} onChange={(e) => setEditGroupName(e.target.value)} />
          </div>
          <div className={styles.formItem}>
            <div className={styles.label}>集合说明</div>
            <Input.TextArea
              className={styles.textarea}
              rows={4}
              placeholder="输入问题集合说明（选填）"
              value={editGroupDesc}
              onChange={(e) => setEditGroupDesc(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default QuestionLibrary;
