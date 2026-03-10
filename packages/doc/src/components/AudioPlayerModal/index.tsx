// @ts-ignore
import BenzAMRRecorder from 'benz-amr-recorder';
import React, {useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import WaveSurfer from 'wavesurfer.js';
import styles from './index.module.less';

const PlayIcon = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={styles.ml1}
  >
    <polygon points="5 3 19 12 5 21 5 3"></polygon>
  </svg>
);

const PauseIcon = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="6" y="4" width="4" height="16"></rect>
    <rect x="14" y="4" width="4" height="16"></rect>
  </svg>
);

const XIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

interface AudioPlayerModalProps {
  visible: boolean;
  onClose: () => void;
  audioUrl: string;
  fileName?: string;
}

const AudioPlayerModal: React.FC<AudioPlayerModalProps> = ({visible, onClose, audioUrl, fileName}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // 格式化时间为 mm:ss
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // 将 PCM 采样数据转换为 WAV Blob
  const pcmToWav = (samples: Float32Array, sampleRate: number) => {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);

    const writeString = (v: DataView, offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        v.setUint8(offset + i, string.charCodeAt(i));
      }
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
    view.setUint16(22, 1, true); // 单声道
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true); // 1 channel * 2 bytes
    view.setUint16(34, 16, true);
    writeString(view, 36, 'data');
    view.setUint32(40, samples.length * 2, true);
    floatTo16BitPCM(view, 44, samples);

    return new Blob([buffer], {type: 'audio/wav'});
  };

  useEffect(() => {
    if (!visible || !audioUrl) return;

    const isAmr = audioUrl.toLowerCase().endsWith('.amr') || fileName?.toLowerCase().endsWith('.amr');

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
          waveColor: '#C3D1FD',
          progressColor: '#4337F1',
          cursorColor: '#4337F1',
          barWidth: 2,
          barGap: 1,
          barRadius: 2,
          height: 60,
          dragToSeek: true,
          interact: true,
          normalize: true,
        });

        wavesurferRef.current = ws;

        ws.on('ready', () => {
          setIsReady(true);
          setDuration(ws.getDuration());
        });

        ws.on('audioprocess', () => {
          setCurrentTime(ws.getCurrentTime());
        });

        ws.on('interaction', () => {
          setCurrentTime(ws.getCurrentTime());
        });

        ws.on('finish', () => {
          setIsPlaying(false);
          ws.seekTo(0);
          setCurrentTime(0);
        });

        ws.on('error', (err) => {
          console.error('Wavesurfer error:', err);
          setErrorMsg('音频播放失败，请稍后重试');
        });

        if (url instanceof Blob) {
          ws.loadBlob(url);
        } else {
          ws.load(url);
        }
      } catch (err) {
        console.error('Wavesurfer init error:', err);
        setErrorMsg('播放器启动失败');
      }
    };

    if (isAmr) {
      const amr = new BenzAMRRecorder();
      amr
        .initWithUrl(audioUrl)
        .then(() => {
          // 使用 amr 内部已解码的采样数据转换为 WaveSurfer 可识别的 WAV
          // @ts-ignore
          const samples = amr._samples;
          if (samples && samples.length > 0) {
            const wavBlob = pcmToWav(samples, 8000);
            initWaveSurfer(wavBlob);
          } else {
            setErrorMsg('AMR 录音数据解析为空');
          }
        })
        .catch((err: any) => {
          console.error('AMR init error:', err);
          setErrorMsg('AMR 录音加载失败');
        });
    } else {
      setTimeout(() => initWaveSurfer(audioUrl), 50);
    }

    return cleanup;
  }, [visible, audioUrl, fileName]);

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

  if (!visible) return null;

  return createPortal(
    <div className={styles.modalOverlay}>
      {/* Backdrop */}
      <div className={styles.backdrop} onClick={onClose} />

      {/* Modal Content */}
      <div className={styles.modalContent}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.titleInfo}>
            <h3 className={styles.title}>{fileName || '录音播放'}</h3>
            <p className={styles.subtitle}>点击波形图可拖动进度</p>
          </div>
          <button onClick={onClose} className={styles.closeBtn}>
            <XIcon />
          </button>
        </div>

        {/* Player Body */}
        <div className={styles.playerBody}>
          {/* Waveform container */}
          <div ref={containerRef} className={styles.waveformContainer} />

          {/* Time Display */}
          <div className={styles.timeDisplay}>
            <span className={styles.currentTime}>{formatTime(currentTime)}</span>
            <span className={styles.duration}>{formatTime(duration)}</span>
          </div>

          {/* Loading State */}
          {!isReady && !errorMsg && (
            <div className={styles.loadingState}>
              <div className={styles.loaderSpinner}></div>
              <span className={styles.loaderText}>音频加载中...</span>
            </div>
          )}

          {/* Error State */}
          {errorMsg && (
            <div className={styles.errorState}>
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className={styles.controls}>
          <button
            onClick={togglePlay}
            disabled={!isReady || !!errorMsg}
            className={`${styles.playBtn} ${isReady && !errorMsg ? styles.playBtnActive : styles.playBtnDisabled}`}
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AudioPlayerModal;
