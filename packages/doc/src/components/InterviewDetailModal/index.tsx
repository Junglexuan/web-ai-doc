// @ts-ignore
import BenzAMRRecorder from 'benz-amr-recorder';
import React, {useEffect, useRef, useState} from 'react';
import WaveSurfer from 'wavesurfer.js';
import {DueDiligenceAPI} from '@/modules/dueDiligence/api';
import {InterviewInstDetail, TranscriptItem} from '@/modules/dueDiligence/entity';
import {replaceBaseUrl} from '@/utils/request';
import styles from './index.module.less';

interface Props {
  visible: boolean;
  onClose: () => void;
  record: InterviewInstDetail | null;
}

const PlayIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

const PauseIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="6" y="4" width="4" height="16" />
    <rect x="14" y="4" width="4" height="16" />
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

const MicIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
    <line x1="12" y1="19" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="8" y1="23" x2="16" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const TargetIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
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

  const transcriptBodyRef = useRef<HTMLDivElement>(null);

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
    if (visible && record?.interviewInstId) {
      setTranscript([]);
      setTransPage({pageNum: 1, pageSize: 50, total: 0, hasMore: true});
      loadTranscript(1, true);
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
          waveColor: '#C8D8FF',
          progressColor: '#2A62FA',
          cursorColor: '#2A62FA',
          barWidth: 2,
          barGap: 1.5,
          barRadius: 2,
          height: 56,
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

  const title = record.interviewInstTitle || record.interviewCust || '访谈录音';
  const hasAudio = !!record.recordFileInstVo?.recordFileUrl;
  const questionList = record.questionInstList || [];
  const hitCount = questionList.filter((q) => q.CHECKED).length;

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.micIcon}>
              <MicIcon />
            </div>
            <div className={styles.headerInfo}>
              <h2 className={styles.title}>{title}</h2>
              <div className={styles.subtitle}>
                <span className={styles.timeIcon}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </span>
                <span>{record.lastModifiedTime || '-'}</span>
                {isReady && duration > 0 && (
                  <>
                    <span className={styles.divider}>·</span>
                    <span className={styles.durationIcon}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 18V5l12-2v13" />
                        <circle cx="6" cy="18" r="3" />
                        <circle cx="18" cy="16" r="3" />
                      </svg>
                    </span>
                    <span>时长: {formatTime(duration)}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={handleClose}>
            <CloseIcon />
          </button>
        </div>

        {/* Body */}
        <div className={styles.body}>
          {/* Left Panel */}
          <div className={styles.leftPanel}>
            {/* Audio Player */}
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
                  <div className={styles.playerControls}>
                    <button
                      className={`${styles.playBtn} ${isReady && !errorMsg ? styles.playBtnActive : styles.playBtnDisabled}`}
                      onClick={togglePlay}
                      disabled={!isReady || !!errorMsg}
                    >
                      {isPlaying ? <PauseIcon /> : <PlayIcon />}
                    </button>
                    <div className={styles.timeInfo}>
                      <span className={styles.curTime}>{formatTime(currentTime)}</span>
                      <span className={styles.totalTime}>{formatTime(duration)}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className={styles.noAudio}>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="1.5">
                    <path d="M9 18V5l12-2v13" />
                    <circle cx="6" cy="18" r="3" />
                    <circle cx="18" cy="16" r="3" />
                  </svg>
                  <span>暂无录音文件</span>
                </div>
              )}
            </div>

            {/* Transcript */}
            <div className={styles.transcriptCard}>
              <div className={styles.sectionHead}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2A62FA" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                <span>录音转写全文</span>
              </div>
              <div ref={transcriptBodyRef} className={styles.transcriptBody} onScroll={onTranscriptScroll}>
                {transcriptLoading && transcript.length === 0 ? (
                  <div className={styles.transcriptLoading}>
                    <div className={styles.spinner} />
                    <span>转写内容加载中...</span>
                  </div>
                ) : transcript.length > 0 ? (
                  transcript.map((item, idx) => (
                    <div key={idx} className={`${styles.speechItem} ${item.role === '访谈者' ? styles.speechGuest : styles.speechHost}`}>
                      <div className={styles.speechRole}>{item.role}</div>
                      {item.time && <div className={styles.speechTime}>{item.time}</div>}
                      <div className={styles.speechContent}>{item.content}</div>
                    </div>
                  ))
                ) : (
                  <div className={styles.noTranscript}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d0d0d0" strokeWidth="1.5">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    <span>暂无转写内容</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel: Question List */}
          <div className={styles.rightPanel}>
            <div className={styles.questionHead}>
              <div className={styles.questionHeadTop}>
                <TargetIcon />
                <span className={styles.questionTitle}>问题命中分析</span>
              </div>
              <div className={styles.questionSubtitle}>AI 自动识别访谈中覆盖的尽调要点</div>
            </div>
            <div className={styles.questionList}>
              {questionList.length === 0 ? (
                <div className={styles.noQuestion}>暂无问题清单</div>
              ) : (
                questionList.map((q) => {
                  const isExpanded = expandedQuestions.has(q.id || q.questionName);
                  return (
                    <div
                      key={q.id || q.questionName}
                      className={`${styles.questionItem} ${q.CHECKED ? styles.questionItemHit : styles.questionItemMiss}`}
                      onClick={() => q.CHECKED && q.questionAnswer && toggleQuestion(q.id || q.questionName)}
                    >
                      <div className={styles.questionTop}>
                        <div className={styles.questionMeta}>
                          <span className={`${styles.hitBadge} ${q.CHECKED ? styles.hitBadgeHit : styles.hitBadgeMiss}`}>
                            {q.CHECKED ? '已命中' : '未命中'}
                          </span>
                          {q.hitTime && (
                            <span className={styles.hitTime}>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                              </svg>
                              {q.hitTime}
                            </span>
                          )}
                        </div>
                        <div className={styles.questionStatus}>
                          {q.CHECKED ? (
                            <span className={styles.statusCheck}>
                              <CheckIcon />
                            </span>
                          ) : (
                            <span className={styles.statusMiss}>×</span>
                          )}
                        </div>
                      </div>
                      <div className={styles.questionName}>{q.questionName}</div>
                      {q.CHECKED && q.questionAnswer && isExpanded && (
                        <div className={styles.questionAnswer}>
                          <div className={styles.answerLabel}>答复：</div>
                          <div className={styles.answerText}>{q.questionAnswer}</div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewDetailModal;
