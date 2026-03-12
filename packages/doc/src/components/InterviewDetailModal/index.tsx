// @ts-ignore
import BenzAMRRecorder from 'benz-amr-recorder';
import React, {useEffect, useRef, useState} from 'react';
import WaveSurfer from 'wavesurfer.js';
import {DueDiligenceAPI} from '@/modules/dueDiligence/api';
import {InterviewInstDetail, TranscriptItem} from '@/modules/dueDiligence/entity';
import {replaceBaseUrl} from '@/utils/request';
import {showMask} from '@/utils/tools';
import styles from './index.module.less';

interface Props {
  visible: boolean;
  onClose: () => void;
  record: InterviewInstDetail | null;
}

const AvatarIcon = ({name, index}: {name: string; index?: number}) => {
  let colorIndex = index || 0;
  if (index === undefined) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    colorIndex = Math.abs(hash) % 5;
  } else {
    colorIndex = index % 5;
  }

  const colors = [
    {fg: 'url(#grad-blue)', bg: '#EDF2FE', border: '#DDE5FE', from: '#6B8DF8', to: '#3859FF'},
    {fg: 'url(#grad-purple)', bg: '#F5E8FF', border: '#EAD1FF', from: '#C058FF', to: '#9013FF'},
    {fg: 'url(#grad-lightblue)', bg: '#EAF6FF', border: '#D1E9FF', from: '#59CDFF', to: '#1583FF'},
    {fg: 'url(#grad-orange)', bg: '#FFEFEA', border: '#FFDFD5', from: '#FF8A58', to: '#FF3B00'},
    {fg: 'url(#grad-teal)', bg: '#E6FCF8', border: '#CCF8EF', from: '#32E0C4', to: '#00B294'},
  ][colorIndex];

  return (
    <div
      style={{
        width: 30,
        height: 30,
        borderRadius: '50%',
        backgroundColor: colors.bg,
        border: `1px solid ${colors.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={colors.fg.replace('url(#', '').replace(')', '')} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={colors.from} />
            <stop offset="100%" stopColor={colors.to} />
          </linearGradient>
        </defs>
        <circle cx="12" cy="7" r="4" fill={colors.fg} />
        <path d="M5 21C5 17.134 8.13401 14 12 14C15.866 14 19 17.134 19 21H5Z" fill={colors.fg} />
      </svg>
    </div>
  );
};

const PlayIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="currentColor"
    strokeWidth="1"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="7 4 19 12 7 20" />
  </svg>
);

const PauseIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="currentColor"
    strokeWidth="1"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="6" y="4" width="3.5" height="16" rx="1.5" />
    <rect x="14.5" y="4" width="3.5" height="16" rx="1.5" />
  </svg>
);

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const Forward15Icon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <text x="12" y="15.5" fill="currentColor" stroke="none" fontSize="8.5" fontWeight="600" textAnchor="middle">
      15
    </text>
  </svg>
);

const Backward15Icon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <text x="12" y="15.5" fill="currentColor" stroke="none" fontSize="8.5" fontWeight="600" textAnchor="middle">
      15
    </text>
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#52c41a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M8 12l2.5 2.5L16 9" />
  </svg>
);

const EmptyCircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d9d9d9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const ChevronUpIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="18 15 12 9 6 15" />
  </svg>
);

// 解析转写文本，支持多种格式
const parseTranscript = (text: string): {role: string; time: string; content: string}[] => {
  if (!text) return [];
  const lines: {role: string; time: string; content: string}[] = [];
  // 尝试解析 JSON
  try {
    const json = JSON.parse(text);
    if (Array.isArray(json)) {
      return json.map((item: any, idx: number) => ({
        role: item.role || item.speaker || (idx % 2 === 0 ? '访谈员' : '受访人'),
        time: item.time || item.timestamp || '',
        content: item.content || item.text || '',
      }));
    }
  } catch {
    // 非JSON，按行解析
  }
  // 按段落合并
  const paragraphs = text.split(/\n{2,}/);
  paragraphs.forEach((para, idx) => {
    const trimmed = para.trim();
    if (!trimmed) return;
    lines.push({
      role: idx % 2 === 0 ? '访谈员' : '受访人',
      time: '',
      content: trimmed,
    });
  });
  return lines;
};

const InterviewDetailModal: React.FC<Props> = ({visible, onClose, record}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [transcriptLoading, setTranscriptLoading] = useState(false);
  const [transPage, setTransPage] = useState({pageNum: 1, pageSize: 50, total: 0, hasMore: true});
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'questions' | 'transcript'>('questions');

  const transcriptBodyRef = useRef<HTMLDivElement>(null);

  const roleIndexMap = React.useMemo(() => {
    const map = new Map<string, number>();
    let idx = 0;
    transcript.forEach((item) => {
      if (!map.has(item.role)) {
        map.set(item.role, idx++);
      }
    });
    return map;
  }, [transcript]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // 加载转写文本函数
  const loadTranscript = async (pageNum: number, isRefresh = false) => {
    if (!record?.interviewInstId || transcriptLoading) return;
    if (!isRefresh && !transPage.hasMore) return;

    setTranscriptLoading(true);
    try {
      const res = await DueDiligenceAPI.getInterviewTranscript({
        interviewInstId: record.interviewInstId,
        pageNum,
        pageSize: transPage.pageSize,
      });
      const newItems = res.records || [];
      const total = res.total || 0;

      setTranscript((prev) => (isRefresh ? newItems : [...prev, ...newItems]));
      setTransPage((prev) => ({
        ...prev,
        pageNum,
        total,
        hasMore: isRefresh ? newItems.length < total : (prev.pageNum - 1) * prev.pageSize + newItems.length < total,
      }));
    } catch (e) {
      console.error('Failed to load transcript', e);
    } finally {
      setTranscriptLoading(false);
    }
  };

  // 滚动处理
  const onTranscriptScroll = () => {
    if (!transcriptBodyRef.current || transcriptLoading || !transPage.hasMore) return;
    const {scrollTop, scrollHeight, clientHeight} = transcriptBodyRef.current;
    if (scrollHeight - scrollTop - clientHeight < 50) {
      loadTranscript(transPage.pageNum + 1);
    }
  };

  // 初始化加载
  useEffect(() => {
    if (visible) {
      showMask(true);
      if (record?.interviewInstId) {
        setTranscript([]);
        setTransPage({pageNum: 1, pageSize: 50, total: 0, hasMore: true});
        loadTranscript(1, true);
      }
    } else {
      showMask(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, record?.interviewInstId]);

  // 将 PCM 采样数据转换为 WAV Blob
  const pcmToWav = (samples: Float32Array, sampleRate: number) => {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);
    const writeString = (v: DataView, offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) v.setUint8(offset + i, string.charCodeAt(i));
    };
    const floatTo16BitPCM = (output: DataView, offset: number, input: Float32Array) => {
      for (let i = 0; i < input.length; i++, offset += 2) {
        const s = Math.max(-1, Math.min(1, input[i]));
        output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      }
    };
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + samples.length * 2, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, 'data');
    view.setUint32(40, samples.length * 2, true);
    floatTo16BitPCM(view, 44, samples);
    return new Blob([buffer], {type: 'audio/wav'});
  };

  // 初始化 WaveSurfer
  useEffect(() => {
    if (!visible || !record?.recordFileInstVo?.recordFileUrl) return;

    const audioUrl = replaceBaseUrl(record.recordFileInstVo.recordFileUrl);
    const fileName = record.recordFileInstVo.recordFileName || '';
    const isAmr = audioUrl.toLowerCase().endsWith('.amr') || fileName.toLowerCase().endsWith('.amr');

    const cleanup = () => {
      if (wavesurferRef.current) {
        try {
          wavesurferRef.current.destroy();
        } catch (e) {
          console.warn(e);
        }
        wavesurferRef.current = null;
      }
    };

    cleanup();
    setIsReady(false);
    setIsPlaying(false);
    setErrorMsg('');
    setCurrentTime(0);
    setDuration(0);

    const initWaveSurfer = (url: string | Blob) => {
      if (!containerRef.current) return;
      try {
        const ws = WaveSurfer.create({
          container: containerRef.current as unknown as HTMLElement,
          waveColor: '#e2e8f0',
          progressColor: '#2a62fa',
          cursorColor: '#2a62fa',
          barWidth: 2,
          barGap: 1.5,
          barRadius: 2,
          height: 64,
          dragToSeek: true,
          interact: true,
          normalize: true,
        });
        wavesurferRef.current = ws;
        ws.on('ready', () => {
          setIsReady(true);
          setDuration(ws.getDuration());
        });
        ws.on('audioprocess', () => setCurrentTime(ws.getCurrentTime()));
        ws.on('interaction', () => setCurrentTime(ws.getCurrentTime()));
        ws.on('finish', () => {
          setIsPlaying(false);
          ws.seekTo(0);
          setCurrentTime(0);
        });
        ws.on('error', () => setErrorMsg('音频播放失败'));
        if (url instanceof Blob) {
          ws.loadBlob(url);
        } else {
          ws.load(url);
        }
      } catch {
        setErrorMsg('播放器启动失败');
      }
    };

    if (isAmr) {
      const amr = new BenzAMRRecorder();
      amr
        .initWithUrl(audioUrl)
        .then(() => {
          // @ts-ignore
          const samples = amr._samples;
          if (samples?.length > 0) {
            initWaveSurfer(pcmToWav(samples, 8000));
          } else {
            setErrorMsg('AMR 录音数据解析为空');
          }
        })
        .catch(() => setErrorMsg('AMR 录音加载失败'));
    } else {
      setTimeout(() => initWaveSurfer(audioUrl), 50);
    }

    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, record?.recordFileInstVo?.recordFileUrl]);

  // 关闭时重置状态
  const handleClose = () => {
    if (wavesurferRef.current) {
      try {
        wavesurferRef.current.pause();
      } catch {
        // ignore
      }
    }
    setIsPlaying(false);
    showMask(false);
    onClose();
  };

  const togglePlay = () => {
    if (wavesurferRef.current && isReady) {
      if (isPlaying) {
        wavesurferRef.current.pause();
      } else {
        wavesurferRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const skipForward = () => {
    if (wavesurferRef.current && isReady) {
      wavesurferRef.current.skip(15);
    }
  };

  const skipBackward = () => {
    if (wavesurferRef.current && isReady) {
      wavesurferRef.current.skip(-15);
    }
  };

  const toggleQuestion = (id: string) => {
    setExpandedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  if (!visible || !record) return null;

  const title = record.interviewCust || '访谈录音';
  const hasAudio = !!record.recordFileInstVo?.recordFileUrl;
  const questionList = record.questionInstList || [];
  const hitCount = questionList.filter((q) => q.CHECKED).length;

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerTitle}>{title}</div>
          <button className={styles.closeBtn} onClick={handleClose}>
            <CloseIcon />
          </button>
        </div>

        {/* Body */}
        <div className={styles.body}>
          {/* Player section */}
          <div className={styles.playerSectionWrapper}>
            <div className={styles.playerCard}>
              {hasAudio ? (
                <>
                  <div className={styles.waveWrapper}>
                    <div ref={containerRef} className={styles.waveform} />
                    {!isReady && !errorMsg && (
                      <div className={styles.waveLoading}>
                        <div className={styles.spinner} />
                        <span>音频加载中...</span>
                      </div>
                    )}
                    {errorMsg && <div className={styles.waveError}>{errorMsg}</div>}
                  </div>
                  <div className={styles.timeInfo}>
                    <span className={styles.curTime}>{formatTime(currentTime)}</span>
                    <span className={styles.totalTime}>{formatTime(duration)}</span>
                  </div>
                  <div className={styles.playerControls}>
                    <button className={styles.skipBtn} onClick={skipBackward} disabled={!isReady || !!errorMsg} title="后退15秒">
                      <Backward15Icon />
                    </button>
                    <button
                      className={`${styles.playBtn} ${isReady && !errorMsg ? styles.playBtnActive : styles.playBtnDisabled}`}
                      onClick={togglePlay}
                      disabled={!isReady || !!errorMsg}
                    >
                      {isPlaying ? <PauseIcon /> : <PlayIcon />}
                    </button>
                    <button className={styles.skipBtn} onClick={skipForward} disabled={!isReady || !!errorMsg} title="快进15秒">
                      <Forward15Icon />
                    </button>
                  </div>
                </>
              ) : (
                <div className={styles.noAudio}>
                  <span>暂无录音文件</span>
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className={styles.tabsWrapper}>
            <div className={`${styles.tabItem} ${activeTab === 'questions' ? styles.tabItemActive : ''}`} onClick={() => setActiveTab('questions')}>
              问题清单
            </div>
            <div className={`${styles.tabItem} ${activeTab === 'transcript' ? styles.tabItemActive : ''}`} onClick={() => setActiveTab('transcript')}>
              录音转写
            </div>
          </div>

          {/* Tab Content */}
          <div className={styles.tabContent}>
            {activeTab === 'questions' && (
              <div className={styles.questionsWrapper}>
                <div className={styles.questionsStats}>
                  已自动匹配 <span>{hitCount}</span> / {questionList.length} 项
                </div>
                <div className={styles.questionList}>
                  {questionList.map((q, index) => {
                    const isExpanded = expandedQuestions.has(q.id || q.questionName);
                    const isHit = q.CHECKED;
                    return (
                      <div
                        key={q.id || q.questionName}
                        className={`${styles.questionItem} ${isHit ? styles.questionHit : styles.questionMiss} ${
                          isExpanded ? styles.questionExpanded : ''
                        }`}
                      >
                        <div className={styles.questionHeader} onClick={() => isHit && toggleQuestion(q.id || q.questionName)}>
                          <div className={styles.questionTitleMain}>
                            {index + 1}.{q.questionName}
                          </div>
                          <div className={styles.questionHeaderRight}>
                            {isHit && <div className={styles.chevronIcon}>{isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}</div>}
                            {isHit ? <CheckCircleIcon /> : <EmptyCircleIcon />}
                          </div>
                        </div>
                        {isHit && isExpanded && <div className={styles.questionAnswerBody}>{q.questionAnswer || '暂无回答内容。'}</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'transcript' && (
              <div className={styles.transcriptWrapper} ref={transcriptBodyRef} onScroll={onTranscriptScroll}>
                {transcriptLoading && transcript.length === 0 ? (
                  <div className={styles.transcriptLoading}>
                    <div className={styles.spinner} />
                    <span>转写内容加载中...</span>
                  </div>
                ) : transcript.length > 0 ? (
                  transcript.map((item, idx) => (
                    <div key={idx} className={styles.speechItem}>
                      <div className={styles.speechHeader}>
                        <AvatarIcon name={item.role} index={roleIndexMap.get(item.role)} />
                        <div className={styles.speechRole}>{item.role}</div>
                        {item.time && <div className={styles.speechTime}>{item.time}</div>}
                      </div>
                      <div className={styles.speechContent}>{item.content}</div>
                    </div>
                  ))
                ) : (
                  <div className={styles.noTranscript}>
                    <span>暂无转写内容</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={handleClose}>
            取消
          </button>
          <button className={styles.confirmBtn} onClick={handleClose}>
            确定
          </button>
        </div>
      </div>
    </div>
  );
};

export default InterviewDetailModal;
