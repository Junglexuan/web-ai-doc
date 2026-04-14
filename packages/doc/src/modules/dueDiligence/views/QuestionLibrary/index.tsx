import {BookOutlined, DeleteOutlined, EditOutlined, LoadingOutlined, PlusOutlined} from '@ant-design/icons';
import {Button, Card, Input, Spin, Typography, message} from 'antd';
import {FC, useEffect, useState} from 'react';
import {DueDiligenceAPI} from '../../api';
import styles from './index.module.less';

const {Title, Text} = Typography;

// 数据结构定义
interface QuestionGroup {
  id: string;
  templateName: string;
  remark?: string;
  questionList?: QuestionItem[];
}

interface QuestionItem {
  id: string;
  questionName: string;
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

  // 初始化加载数据
  useEffect(() => {
    setLoading(true);
    // 这里传入 interviewDealInstId 参数，可以按需从 URL 或配置中获取
    DueDiligenceAPI.getTemplateInfoList()
      .then((data) => {
        setGroups(data || []);
        if (data && data.length > 0) {
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
  }, []);

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) {
      message.warning('请输入问题集合名称');
      return;
    }
    message.success('创建成功（演示环境）');
    setIsCreatingGroup(false);
    setNewGroupName('');
    setNewGroupRemark('');
  };

  const handleSaveQuestion = (isContinue: boolean = false) => {
    if (!newQuestionName.trim()) {
      message.warning('请输入问题内容');
      return;
    }
    message.success('保存成功（演示环境）');
    setNewQuestionName('');
    if (!isContinue) {
      setIsAddingQuestion(false);
    }
  };

  const activeGroup = groups.find((g) => String(g.id) === activeGroupId);
  const currentQuestions = activeGroup?.questionList || [];

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
              <Button className={styles.cancelBtn} onClick={() => setIsCreatingGroup(false)}>
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
                  <span className={styles.name}>{group.templateName}</span>
                  <span className={styles.count}>{group.questionList?.length || 0}</span>
                </div>
                <div className={styles.desc}>{group.remark || '暂无描述内容'}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 右侧问题详情 */}
      <div className={styles.content}>
        <div className={styles.contentHeader}>
          <div className={styles.info}>
            <div className={styles.currentGroup}>当前集合</div>
            <div className={styles.name}>{activeGroup?.templateName || '未选择集合'}</div>
            <div className={styles.desc}>{activeGroup?.remark || '关注访谈过程中的核心要点与风险'}</div>
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsAddingQuestion(true)}>
            新增问题
          </Button>
        </div>

        <div className={styles.questionList}>
          {isAddingQuestion && (
            <div className={styles.addQuestionContainer}>
              <div className={styles.title}>
                <PlusOutlined />
                <span>新增问题</span>
              </div>
              <Input.TextArea rows={4} placeholder="输入问题内容..." value={newQuestionName} onChange={(e) => setNewQuestionName(e.target.value)} />
              <div className={styles.footer}>
                <Button className={`${styles.btn} ${styles.cancelBtn}`} onClick={() => setIsAddingQuestion(false)}>
                  取消
                </Button>
                <Button className={`${styles.btn} ${styles.saveBtn}`} onClick={() => handleSaveQuestion(false)}>
                  保存
                </Button>
                <Button className={`${styles.btn} ${styles.continueBtn}`} onClick={() => handleSaveQuestion(true)}>
                  保存并继续新增
                </Button>
              </div>
            </div>
          )}

          {loading ? (
            <div style={{textAlign: 'center', padding: '100px'}}>
              <Spin size="large" />
            </div>
          ) : (
            <>
              {currentQuestions.map((q, idx) => (
                <div key={q.id || idx} className={styles.questionItem}>
                  <div className={styles.main}>
                    <div className={styles.tags}>
                      <span className={styles.category}>预设问题</span>
                      <span className={styles.type}>访谈清单</span>
                    </div>
                    <div className={styles.text}>{q.questionName}</div>
                  </div>
                  <div className={styles.actions}>
                    <Button type="text" icon={<EditOutlined />} onClick={(e) => e.stopPropagation()} />
                    <Button type="text" danger icon={<DeleteOutlined />} onClick={(e) => e.stopPropagation()} />
                  </div>
                </div>
              ))}
              {currentQuestions.length === 0 && !loading && (
                <Card style={{textAlign: 'center', padding: '60px', color: '#94a3b8', borderRadius: 16, border: '1px dashed #e2e8f0'}}>
                  该集合下暂无问题
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionLibrary;
