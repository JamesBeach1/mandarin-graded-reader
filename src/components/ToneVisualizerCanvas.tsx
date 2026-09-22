import React, { useEffect, useRef, useState } from 'react';
import { PitchTracker } from '../services/pitchTracker';
import { Mic, Square, RefreshCw, Volume2 } from 'lucide-react';
import { AzureSpeechService } from '../services/azureSpeech';

interface ToneVisualizerCanvasProps {
  character: string;
  pinyin: string;
  targetTone: number; // 1 to 5
}

export const ToneVisualizerCanvas: React.FC<ToneVisualizerCanvasProps> = ({
  character,
  pinyin,
  targetTone
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [userScore, setUserScore] = useState<number | null>(null);
  const [detectedTone, setDetectedTone] = useState<number | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');

  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const recordedPitchesRef = useRef<number[]>([]);

  // Draw background grid & target curve
  const drawBaseCanvas = (userCurve?: number[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear
    ctx.clearRect(0, 0, width, height);

    // 1. Draw 5-degree Chinese tonal grid lines with intuitive pitch register labels
    ctx.strokeStyle = 'rgba(63, 63, 69, 0.4)';
    ctx.lineWidth = 1;
    ctx.font = '11px var(--font-mono, monospace)';
    ctx.fillStyle = '#A0A0A5';

    const leftMargin = 100;
    const toneLabels: Record<number, string> = {
      5: '5 High (高)',
      4: '4 Mid-High (半高)',
      3: '3 Mid (中)',
      2: '2 Mid-Low (半低)',
      1: '1 Low (低)'
    };

    for (let level = 1; level <= 5; level++) {
      const y = height - (level / 5) * (height - 40) - 15;
      ctx.beginPath();
      ctx.moveTo(leftMargin, y);
      ctx.lineTo(width - 20, y);
      ctx.stroke();
      ctx.fillText(toneLabels[level] || `Level ${level}`, 10, y + 4);
    }

    // 2. Draw Target Reference Tone Curve (Calligraphy Gold #B8904D)
    const targetCurve = PitchTracker.getIdealToneCurve(targetTone, 50);
    ctx.beginPath();
    ctx.strokeStyle = '#B8904D'; // Calligraphy Gold
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const drawWidth = width - leftMargin - 30;
    for (let i = 0; i < targetCurve.length; i++) {
      const x = leftMargin + 10 + (i / 49) * drawWidth;
      const y = height - targetCurve[i] * (height - 50) - 25;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // 3. Draw User Pitch Curve (Seal Red #A33B3B) if available
    if (userCurve && userCurve.length > 0) {
      ctx.beginPath();
      ctx.strokeStyle = '#A33B3B'; // Seal Red
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      for (let i = 0; i < userCurve.length; i++) {
        const x = leftMargin + 10 + (i / (userCurve.length - 1)) * drawWidth;
        const y = height - userCurve[i] * (height - 50) - 25;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  };

  useEffect(() => {
    drawBaseCanvas();
    return () => {
      stopRecording();
    };
  }, [targetTone, character]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);

      const buffer = new Float32Array(analyser.fftSize);
      recordedPitchesRef.current = [];
      setIsRecording(true);
      setUserScore(null);
      setFeedbackMessage('Listening... Speak the character now.');

      const updatePitch = () => {
        analyser.getFloatTimeDomainData(buffer);
        const pitch = PitchTracker.detectPitch(buffer, audioCtx.sampleRate);
        if (pitch > 60) {
          recordedPitchesRef.current.push(pitch);
        }

        // Real-time canvas preview
        if (recordedPitchesRef.current.length > 2) {
          const liveNormalized = PitchTracker.normalizeF0Sequence(recordedPitchesRef.current);
          drawBaseCanvas(liveNormalized);
        }

        animationFrameRef.current = requestAnimationFrame(updatePitch);
      };

      updatePitch();
    } catch (err) {
      console.error('Microphone access denied:', err);
      alert('Microphone access is required for real-time pitch tracking.');
    }
  };

  const stopRecording = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setIsRecording(false);

    // Final evaluation
    if (recordedPitchesRef.current.length > 5) {
      const normalized = PitchTracker.normalizeF0Sequence(recordedPitchesRef.current);
      drawBaseCanvas(normalized);

      const evalResult = PitchTracker.evaluateToneAccuracy(normalized, targetTone);
      setUserScore(evalResult.score);
      setDetectedTone(evalResult.detectedTone);

      if (evalResult.score >= 80) {
        setFeedbackMessage(`Excellent! Accurate ${targetTone} tone (${evalResult.score}% match).`);
      } else if (evalResult.score >= 50) {
        setFeedbackMessage(`Good effort. Detected tone ${evalResult.detectedTone} (${evalResult.score}% match). Focus on the curve shape.`);
      } else {
        setFeedbackMessage(`Needs adjustment. Detected tone ${evalResult.detectedTone} (${evalResult.score}% match). Follow the indigo curve.`);
      }
    } else if (isRecording) {
      setFeedbackMessage('No clear vocal pitch detected. Please speak closer to the microphone.');
    }
  };

  const handlePlayReference = () => {
    AzureSpeechService.speak(character, { rate: 0.85 });
  };

  return (
    <div className="pitch-studio-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>
            Tone {targetTone} Pitch Visualizer
          </span>
          <h3 style={{ margin: '4px 0 0 0', fontFamily: 'var(--font-serif-zh)', fontSize: '28px', color: 'var(--text-main)' }}>
            {character} <span style={{ fontSize: '18px', color: 'var(--text-pinyin)', fontFamily: 'var(--font-mono)' }}>({pinyin})</span>
          </h3>
        </div>
        <button onClick={handlePlayReference} className="btn btn-secondary" title="Listen to Native Pronunciation">
          <Volume2 size={18} /> Reference Audio
        </button>
      </div>

      <div className="pitch-canvas-wrapper">
        <canvas
          ref={canvasRef}
          width={560}
          height={240}
          className="pitch-canvas"
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div className="tone-curve-legend">
          <div className="legend-item">
            <div className="legend-color-dot" style={{ backgroundColor: '#1D3C45' }}></div>
            <span>Target Tone {targetTone}</span>
          </div>
          <div className="legend-item">
            <div className="legend-color-dot" style={{ backgroundColor: '#E34234' }}></div>
            <span>Your Pitch Curve</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {!isRecording ? (
            <button onClick={startRecording} className="btn btn-primary">
              <Mic size={16} /> Record Voice
            </button>
          ) : (
            <button onClick={stopRecording} className="btn btn-primary" style={{ backgroundColor: '#B32418' }}>
              <Square size={16} /> Stop & Evaluate
            </button>
          )}
          <button onClick={() => { drawBaseCanvas(); setUserScore(null); setFeedbackMessage(''); }} className="btn btn-secondary" title="Reset Canvas">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {feedbackMessage && (
        <div style={{
          padding: '10px 14px',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: userScore && userScore >= 80 ? 'rgba(123, 141, 98, 0.15)' : 'var(--bg-panel)',
          color: userScore && userScore >= 80 ? 'var(--accent-bamboo)' : 'var(--text-main)',
          fontSize: '13px',
          fontWeight: 600
        }}>
          {feedbackMessage}
        </div>
      )}
    </div>
  );
};
