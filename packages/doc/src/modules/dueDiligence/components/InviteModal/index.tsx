import {CopyOutlined, GiftOutlined, UserAddOutlined} from '@ant-design/icons';
import {Button, Input, Modal, message} from 'antd';
import {FC, memo, useEffect, useRef, useState} from 'react';
import {DueDiligenceAPI} from '../../api';
import styles from './index.module.less';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const steps = [
  {icon: <CopyOutlined />, text: '复制您的专属邀请码并发送给好友'},
  {icon: <GiftOutlined />, text: '好友在下方填写您的邀请码并点击确定'},
  {icon: <UserAddOutlined />, text: '好友分享，同触AI报告新体验'},
];

const InviteModal: FC<Props> = ({open, onClose, onSuccess}) => {
  const [inviteCode, setInviteCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [friendCode, setFriendCode] = useState('');
  const isComposing = useRef(false);

  useEffect(() => {
    if (!open) return;
    setIsLoading(true);
    DueDiligenceAPI.queryInviteCode()
      .then((res) => {
        if (res.success && res.data) {
          setInviteCode(res.data);
        }
      })
      .catch((_err) => {
        /* ignore */
      })
      .finally(() => setIsLoading(false));
  }, [open]);

  const handleCopyOrGenerate = async () => {
    if (inviteCode) {
      // copy
      const text = inviteCode;
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard
          .writeText(text)
          .then(() => message.success('已复制到剪贴板'))
          .catch(() => fallbackCopy(text));
      } else {
        fallbackCopy(text);
      }
      return;
    }
    // generate
    setIsGenerating(true);
    try {
      const res = await DueDiligenceAPI.getInviteCode();
      if (res.success && res.data) {
        setInviteCode(res.data);
      } else {
        message.error(res.message || '获取失败');
      }
    } catch {
      message.error('获取失败，请稍后重试');
    } finally {
      setIsGenerating(false);
    }
  };

  const fallbackCopy = (text: string) => {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    try {
      document.execCommand('copy');
      message.success('已复制到剪贴板');
    } catch {
      message.error('复制失败');
    }
    document.body.removeChild(el);
  };

  const handleConfirm = async () => {
    const code = friendCode.trim().toUpperCase();
    if (!code) {
      message.warning('请输入邀请码');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await DueDiligenceAPI.importInviteCode(code);
      if (res.success) {
        message.success('关联成功');
        setFriendCode('');
        onClose();
        onSuccess?.();
      } else {
        message.error(res.message || '关联失败');
        setFriendCode('');
      }
    } catch (err: any) {
      // 如果 request 在业务失败时会抛异常，err.message 里已带有服务端返回的信息，
      // 直接展示避免与上方的 res.message toast 重复
      const errMsg = err?.response?.data?.message || err?.message;
      if (errMsg) {
        message.error(errMsg);
      }
      setFriendCode('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={() => {
        setFriendCode('');
        onClose();
      }}
      footer={null}
      width={480}
      centered
      className={styles.inviteModalWrap}
      styles={{
        content: {padding: 0, borderRadius: 20, overflow: 'hidden'},
        mask: {backdropFilter: 'blur(4px)'},
      }}
    >
      {/* Top banner */}
      <div className={styles.banner}>
        <div className={styles.bannerOverlay} />
        <div className={styles.bannerContent}>
          <div className={styles.bannerEmoji}>📄</div>
          <div className={styles.bannerTitle}>分享邀请码</div>
          <div className={styles.bannerSubtitle}>好友体验小狸报告</div>
        </div>
      </div>

      {/* Main content */}
      <div className={styles.body}>
        {/* Card 1: Share code */}
        <div className={styles.card}>
          <div className={styles.cardLabel}>分享邀请码，邀请好友体验小狸报告</div>
          <div className={styles.codeRow}>
            <div className={styles.codeBox}>
              <span className={inviteCode ? styles.codeText : styles.codePlaceholder}>
                {isLoading || isGenerating ? '...' : inviteCode || 'WAITING...'}
              </span>
            </div>
            <Button type="primary" className={styles.copyBtn} loading={isLoading || isGenerating} onClick={handleCopyOrGenerate}>
              {inviteCode ? '复制邀请码' : isLoading || isGenerating ? '生成中...' : '生成邀请码'}
            </Button>
          </div>
        </div>

        {/* Card 2: Steps */}
        <div className={styles.card}>
          <div className={styles.sectionTitle}>邀请步骤</div>
          <div className={styles.steps}>
            {steps.map((step, idx) => (
              <div key={idx} className={styles.stepItem}>
                <div className={styles.stepLeft}>
                  <div className={styles.stepDot} />
                  {idx < steps.length - 1 && <div className={styles.stepLine} />}
                </div>
                <div className={`${styles.stepContent} ${idx < steps.length - 1 ? styles.stepContentGap : ''}`}>
                  <span className={styles.stepIcon}>{step.icon}</span>
                  <span className={styles.stepText}>{step.text}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 3: Fill friend code */}
        <div className={styles.card}>
          <div className={styles.sectionTitle}>填写好友邀请码</div>
          <div className={styles.codeRow}>
            <Input
              value={friendCode}
              onChange={(e) => {
                if (!isComposing.current) {
                  setFriendCode(e.target.value.replace(/[^a-zA-Z0-9]/g, ''));
                } else {
                  setFriendCode(e.target.value);
                }
              }}
              onCompositionStart={() => {
                isComposing.current = true;
              }}
              onCompositionEnd={(e: any) => {
                isComposing.current = false;
                setFriendCode(e.target.value.replace(/[^a-zA-Z0-9]/g, ''));
              }}
              placeholder="请输入邀请码"
              maxLength={10}
              className={styles.friendCodeInput}
              style={{textTransform: 'uppercase'}}
            />
            <Button
              type="primary"
              className={`${styles.confirmBtn} ${!friendCode.trim() ? styles.confirmBtnDisabled : ''}`}
              loading={isSubmitting}
              onClick={handleConfirm}
            >
              确定
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default memo(InviteModal);
