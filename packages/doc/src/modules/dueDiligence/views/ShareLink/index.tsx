import {
  AppleFilled,
  CheckCircleOutlined,
  CloseOutlined,
  CloudDownloadOutlined,
  FileTextOutlined,
  LayoutOutlined,
  PhoneOutlined,
  SafetyOutlined,
  ThunderboltOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {Modal, message} from 'antd';
import {FC, useEffect, useState} from 'react';
import androidApk from '@/assets/imgs/androidapk.png';
import {useRouter} from '@/Global';
import {saveInviteParams} from '@/utils/tools';
import {AuthAPI, DueDiligenceAPI} from '../../api';
import styles from './index.module.less';

const ShareLink: FC = () => {
  const router = useRouter();
  const query = router.location.searchQuery || {};
  const {inviterUserId = '', inviterUserName = '', inviterTenantId = '', type = '', inviteCode = '', inviteName = ''} = query;

  // 根据 type 区分两套文案
  const isTenant = type === 'tenant';
  const formSubText = isTenant ? '验证手机号，即刻加入企业工作台' : '验证手机号，立即解锁专业尽调工具';
  const successTitle = isTenant ? '邀请接收成功' : '您已成功注册';
  const successDesc = isTenant ? `您已获得${inviterUserName || ''}租户的访问权限。` : '现在就让小狸帮您捕捉访谈细节，快速生成专业报告。';

  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [loginSuccess, setLoginSuccess] = useState(false); // 控制成功状态
  // 环境检测及下载状态
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isWeChat = /MicroMessenger/i.test(ua);
  const [downloadModal, setDownloadModal] = useState<'ios' | 'android' | null>(null);

  // 进入页面时，若 URL 携带邀请参数则持久化
  useEffect(() => {
    document.title = '小狸报告';
    if (inviteCode) {
      saveInviteParams({inviterUserId, inviterUserName, inviterTenantId, type, inviteCode});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 倒计时
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  /** 发送验证码 */
  const handleSendCode = async () => {
    if (!phone || phone.length !== 11) {
      message.warning('请输入正确的11位手机号');
      return;
    }
    if (countdown > 0) return;
    try {
      const res = await AuthAPI.sendSms(phone);
      if (res.successful) {
        setCountdown(60);
        message.success('验证码已发送');
      } else {
        message.error(res.message || '验证码发送失败');
      }
    } catch (e: any) {
      message.error(e?.message || '验证码发送失败，请重试');
    }
  };

  /** 手机号验证码登录 */
  const handleLogin = async () => {
    if (!phone || phone.length !== 11) {
      message.warning('请输入正确的11位手机号');
      return;
    }
    if (!code) {
      message.warning('请输入验证码');
      return;
    }
    setLoading(true);
    try {
      const res = await AuthAPI.loginWithPhoneCode(phone, code);
      if (res.successful && res.data) {
        const {accessToken} = res.data;
        // 1. 获取用户信息（请求返回结构通常为 { successful: boolean, data: { userId, username... } }）
        const userInfoRes = await AuthAPI.getUserInfo(accessToken);
        const userInfo = userInfoRes.data || userInfoRes; // 兼容处理，优先取 .data

        if (!userInfo || !userInfo.userId) {
          throw new Error('获取用户信息失败');
        }

        // 2. 调用注册邀请接口（透传所有 URL 参数 + 注入用户信息）
        await DueDiligenceAPI.registerInvitation(
          {
            ...query, // 透传所有 URL 参数 (inviterUserId, inviterUserName, inviterTenantId, type, inviteCode, inviteName 等)
            inviteeUserId: userInfo.userId, // 取自 userinfo
            inviteeUserName: userInfo.username, // 取自 userinfo
          },
          {
            Authorization: accessToken,
            Tenant: userInfo.tenantId || '',
          }
        );

        // 3. 切换到成功界面
        setLoginSuccess(true);
      } else {
        message.error(res.message || '登录失败');
      }
    } catch (e: any) {
      console.error('Login error:', e);
      message.error(e?.message || '登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  /** 处理下载按钮点击 */
  const handleDownloadClick = () => {
    if (isIOS) {
      setDownloadModal('ios');
      // 延迟自动跳转（模拟效果）
      setTimeout(() => {
        // window.location.href = 'https://apps.apple.com/cn/app/idxxxx';
      }, 1500);
    } else {
      setDownloadModal('android');
    }
  };

  const displayName = inviterUserName || inviteName || '好友';

  return (
    <div className={styles.sharePage}>
      <div className={styles.mobileContainer}>
        {/* Header */}
        <section className={styles.header}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>
              <UserOutlined className={styles.avatarImg} />
            </div>
            <div className={styles.inviteText}>
              您的好友 <strong>「{displayName}」</strong> 邀请您加入小狸报告
            </div>
          </div>
          <h1 className={styles.mainTitle}>专业尽调，一键生成</h1>
          <p className={styles.subTitle}>立即登录绑定，可以使用多种模版</p>
        </section>

        {/* 登录成功：绑定成功卡片 */}
        {loginSuccess ? (
          <section className={styles.successCard}>
            <div className={styles.successIcon}>
              <CheckCircleOutlined style={{fontSize: 36, color: '#16a34a'}} />
            </div>
            <div className={styles.successTitle}>{successTitle}</div>
            <div className={styles.successDesc}>{successDesc}</div>
            <button className={styles.downloadBtn} type="button" onClick={handleDownloadClick}>
              <CloudDownloadOutlined />
              立即下载 App 体验
            </button>
          </section>
        ) : (
          /* 登录表单卡片 */
          <section className={styles.formCard}>
            <div className={styles.formTitle}>手机号快捷登录</div>
            <div className={styles.formSub}>{formSubText}</div>

            <div className={styles.inputGroup}>
              <div className={styles.inputWrap}>
                <PhoneOutlined className={styles.icon} />
                <input
                  type="tel"
                  placeholder="请输入手机号"
                  value={phone}
                  maxLength={11}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                />
              </div>
              <div className={styles.inputWrap}>
                <SafetyOutlined className={styles.icon} />
                <input type="text" placeholder="验证码" value={code} maxLength={6} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} />
                <div
                  className={styles.codeBtn}
                  style={{opacity: countdown > 0 ? 0.5 : 1, cursor: countdown > 0 ? 'not-allowed' : 'pointer'}}
                  onClick={handleSendCode}
                >
                  {countdown > 0 ? `${countdown}s 后重发` : '获取验证码'}
                </div>
              </div>
            </div>

            <button className={styles.submitBtn} type="button" disabled={loading} onClick={handleLogin}>
              {loading ? '登录中...' : '接受邀请并登录'}
            </button>

            <div className={styles.agreement}>点击按钮即表示同意《用户协议》与《隐私政策》</div>
          </section>
        )}

        {/* 产品使用流程 */}
        <section className={styles.processSection}>
          <div className={styles.sectionHeader}>
            <div className={styles.line} />
            <div className={styles.stitle}>产品使用流程</div>
            <div className={styles.line} />
          </div>
          <div className={styles.processList}>
            <div className={styles.processItem}>
              <div className={styles.picon}>
                <ThunderboltOutlined />
              </div>
              <div className={styles.pinfo}>
                <div className={styles.ptitle}>1. 一键创建尽调</div>
                <div className={styles.pdesc}>支持多维度企业信息导入，云端同步不丢失。</div>
              </div>
            </div>
            <div className={styles.processItem}>
              <div className={styles.picon}>
                <LayoutOutlined />
              </div>
              <div className={styles.pinfo}>
                <div className={styles.ptitle}>2. 海量行业模板</div>
                <div className={styles.pdesc}>涵盖金融、建工、项目等，海量行业标准模板。</div>
              </div>
            </div>
            <div className={styles.processItem}>
              <div className={styles.picon}>
                <FileTextOutlined />
              </div>
              <div className={styles.pinfo}>
                <div className={styles.ptitle}>3. 自动生成报告</div>
                <div className={styles.pdesc}>智能排版，一键导出专业报告文档。</div>
              </div>
            </div>
          </div>
        </section>

        {/* 底部 Logo */}
        <footer className={styles.footer}>
          <div className={styles.flogo}>狸</div>
          <div className={styles.finfo}>
            <div className={styles.fname}>小狸报告</div>
            <div className={styles.fdesc}>更高效的尽调工具</div>
          </div>
        </footer>

        {/* iOS 下载引导弹窗 */}
        <Modal
          open={downloadModal === 'ios'}
          footer={null}
          closable={false}
          centered
          width={320}
          className={styles.downloadModal}
          onCancel={() => setDownloadModal(null)}
        >
          <div className={styles.modalClose} onClick={() => setDownloadModal(null)}>
            <CloseOutlined style={{fontSize: 20, color: '#999'}} />
          </div>
          <div className={styles.iosContent}>
            <div className={styles.appleLogo}>
              <AppleFilled />
            </div>
            <div className={styles.modalTitle}>正在打开 App Store...</div>
            <div className={styles.modalSub}>如未自动跳转，请点击下方按钮</div>
            <button className={styles.iosBtn} type="button" onClick={() => window.open('https://apps.apple.com/cn/app/id6757141299')}>
              <AppleFilled style={{marginRight: 8}} /> 前往 App Store 下载
            </button>
          </div>
        </Modal>

        {/* Android 下载引导弹窗 */}
        <Modal
          open={downloadModal === 'android'}
          footer={null}
          closable={false}
          centered
          width={320}
          className={styles.downloadModal}
          onCancel={() => setDownloadModal(null)}
        >
          <div className={styles.modalClose} onClick={() => setDownloadModal(null)}>
            <CloseOutlined style={{fontSize: 20, color: '#999'}} />
          </div>
          <div className={styles.androidContent}>
            <div className={styles.modalTitle}>下载安卓版</div>
            <div className={styles.modalSub}>长按识别二维码或点击直接下载</div>
            <div className={styles.qrCodeBox}>
              <img src={androidApk} alt="QR Code" />
              <div className={styles.qrLogo}>狸</div>
            </div>
            <button
              className={styles.androidBtn}
              type="button"
              onClick={() => (window.location.href = 'https://img.aiipu.com/xiaoli-report1772784294394.apk')}
            >
              <CloudDownloadOutlined style={{marginRight: 8}} /> 直接下载 APK 安装包
            </button>
            {isWeChat && <div className={styles.wechatHint}>微信内请点击右上角「在浏览器打开」进行下载</div>}
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default ShareLink;
