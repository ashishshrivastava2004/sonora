import React, { useEffect, useRef } from 'react';
import { audioEngine } from '../services/audioEngine';

interface AudioSpectrumCanvasProps {
  isPlaying: boolean;
  color?: string;
  height?: number;
  barCount?: number;
  type?: 'bars' | 'wave' | 'circle';
  className?: string;
}

export const AudioSpectrumCanvas: React.FC<AudioSpectrumCanvasProps> = ({
  isPlaying,
  color = '#6366f1',
  height = 48,
  barCount = 32,
  type = 'bars',
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const width = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, width, h);

      if (!isPlaying) {
        // Subtle resting baseline
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        if (type === 'bars') {
          const barWidth = width / barCount;
          for (let i = 0; i < barCount; i++) {
            const barH = 3;
            ctx.fillRect(i * barWidth + 1, h - barH, barWidth - 2, barH);
          }
        }
        return;
      }

      const freqData = audioEngine.getFrequencyData();
      const waveData = audioEngine.getWaveformData();

      if (type === 'bars') {
        const barWidth = width / barCount;
        const step = Math.floor(freqData.length / barCount);

        for (let i = 0; i < barCount; i++) {
          const value = freqData[i * step] || 0;
          const percent = value / 255;
          const barHeight = Math.max(3, percent * h * 0.95);
          const x = i * barWidth;
          const y = h - barHeight;

          // Gradient color with glow
          const grad = ctx.createLinearGradient(0, y, 0, h);
          grad.addColorStop(0, color);
          grad.addColorStop(1, 'rgba(255, 255, 255, 0.2)');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.roundRect(x + 1, y, barWidth - 2, barHeight, [2, 2, 0, 0]);
          ctx.fill();
        }
      } else if (type === 'wave') {
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = color;
        ctx.beginPath();
        const sliceWidth = width / waveData.length;
        let x = 0;

        for (let i = 0; i < waveData.length; i++) {
          const v = waveData[i] / 128.0;
          const y = (v * h) / 2;
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }
        ctx.stroke();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isPlaying, color, barCount, type]);

  return (
    <canvas
      ref={canvasRef}
      width={barCount * 8}
      height={height}
      className={`block w-full ${className}`}
      style={{ height: `${height}px` }}
    />
  );
};
