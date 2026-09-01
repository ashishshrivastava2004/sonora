import React from 'react';
import {
  Minimize2,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Heart,
  Mic2,
  Sliders,
  Radio,
  Download,
  Check,
  Disc3,
} from 'lucide-react';
import { Track } from '../types';
import { formatTime } from '../utils/formatters';
import { AudioSpectrumCanvas } from './AudioSpectrumCanvas';
import { SyncedLyricsView } from './SyncedLyricsView';

interface FullscreenPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  track: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isShuffled: boolean;
  repeatMode: 'off' | 'all' | 'one';
  isDJEnabled: boolean;
  isDownloaded: boolean;
  onTogglePlay: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (vol: number) => void;
  onToggleMute: () => void;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
  onToggleDJ: () => void;
  onToggleLike: (trackId: string) => void;
  onDownloadTrack: (track: Track) => void;
  onOpenEqualizer: () => void;
}

export const FullscreenPlayer: React.FC<FullscreenPlayerProps> = ({
  isOpen,
  onClose,
  track,
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  isShuffled,
  repeatMode,
  isDJEnabled,
  isDownloaded,
  onTogglePlay,
  onPrevious,
  onNext,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onToggleShuffle,
  onToggleRepeat,
  onToggleDJ,
  onToggleLike,
  onDownloadTrack,
  onOpenEqualizer,
}) => {
  if (!isOpen || !track) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const remainingTime = duration > currentTime ? duration - currentTime : 0;

  return (
    <div
      id="sonora-fullscreen-player"
      className="fixed inset-0 z-50 bg-neutral-950 flex flex-col overflow-hidden animate-fade-in select-none"
    >
      {/* Dynamic Ambient Background Blur */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40 blur-[130px] transition-all duration-1000"
        style={{
          background: `radial-gradient(circle at 30% 40%, ${track.color || '#6366f1'} 0%, transparent 60%),
                       radial-gradient(circle at 75% 65%, #ec4899 0%, transparent 50%),
                       radial-gradient(circle at 50% 90%, #06b6d4 0%, transparent 50%)`,
        }}
      />

      {/* Top Bar */}
      <div className="relative z-10 px-8 py-6 flex items-center justify-between border-b border-white/10 bg-black/20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
            <Disc3 className="w-4 h-4 text-white animate-spin-slow" />
          </div>
          <div>
            <p className="text-xs font-bold text-white uppercase tracking-wider">
              Now Playing in Sonora Hi-Res
            </p>
            <p className="text-[11px] font-mono text-neutral-400">
              {track.formatInfo.format} • {track.formatInfo.sampleRate} • {track.formatInfo.bitDepth}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onOpenEqualizer}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition-all"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>Equalizer & 3D Spatial</span>
          </button>

          <button
            id="close-fullscreen-btn"
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
            title="Minimize fullscreen player"
          >
            <Minimize2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Grid: Artwork + Controls on Left, Synced Lyrics on Right */}
      <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 p-8 overflow-hidden">
        {/* Left Section: Cover & Playback */}
        <div className="lg:col-span-5 flex flex-col justify-between items-center max-w-lg mx-auto w-full space-y-6">
          {/* Album Artwork */}
          <div className="relative group w-full aspect-square max-w-[380px] rounded-3xl overflow-hidden shadow-2xl shadow-black/80 border border-white/10 bg-neutral-900">
            <img
              src={track.coverUrl}
              alt={track.title}
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
            />
            <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[10px] font-mono text-amber-300 font-bold">
              {track.audioQuality.replace(/_/g, ' ')}
            </div>
          </div>

          {/* Track Info */}
          <div className="w-full text-center space-y-1">
            <div className="flex items-center justify-center gap-3">
              <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight font-display truncate">
                {track.title}
              </h2>
              <button
                onClick={() => onToggleLike(track.id)}
                className="text-neutral-400 hover:text-rose-400 transition-colors p-1"
              >
                <Heart
                  className={`w-6 h-6 ${track.liked ? 'fill-rose-500 text-rose-500' : ''}`}
                />
              </button>
              <button
                onClick={() => onDownloadTrack(track)}
                className={`p-1 transition-colors ${isDownloaded ? 'text-sky-400' : 'text-neutral-400 hover:text-sky-400'}`}
              >
                {isDownloaded ? <Check className="w-5 h-5" /> : <Download className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-base text-neutral-300 font-medium">{track.artist}</p>
            <p className="text-xs text-neutral-400">{track.album} • {track.year}</p>
          </div>

          {/* Real-time Spectrum Visualizer */}
          <div className="w-full max-w-sm px-4">
            <AudioSpectrumCanvas
              isPlaying={isPlaying}
              color={track.color || '#6366f1'}
              height={32}
              barCount={28}
            />
          </div>

          {/* Scrubber & Controls */}
          <div className="w-full space-y-4">
            {/* Scrubber */}
            <div className="space-y-1">
              <div
                className="relative h-4 flex items-center cursor-pointer group"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  const ratio = Math.max(0, Math.min(1, clickX / rect.width));
                  onSeek(ratio * duration);
                }}
              >
                <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden group-hover:h-2 transition-all">
                  <div
                    className="h-full bg-white rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div
                  className="absolute w-3.5 h-3.5 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity transform -translate-x-1/2"
                  style={{ left: `${progressPercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
                <span>{formatTime(currentTime)}</span>
                <span>-{formatTime(remainingTime)}</span>
              </div>
            </div>

            {/* Playback Buttons */}
            <div className="flex items-center justify-center gap-6">
              <button
                onClick={onToggleDJ}
                className={`p-2 rounded-full transition-all ${
                  isDJEnabled ? 'bg-amber-500/30 text-amber-300' : 'text-neutral-400 hover:text-white'
                }`}
                title="Aura AI DJ Radio Mode"
              >
                <Radio className="w-5 h-5" />
              </button>

              <button
                onClick={onToggleShuffle}
                className={`p-2 rounded-full transition-colors ${
                  isShuffled ? 'text-amber-400' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Shuffle className="w-5 h-5" />
              </button>

              <button
                onClick={onPrevious}
                className="p-2 text-white hover:scale-110 transition-transform"
              >
                <SkipBack className="w-7 h-7 fill-current" />
              </button>

              <button
                onClick={onTogglePlay}
                className="w-14 h-14 rounded-full bg-white text-neutral-950 hover:scale-105 active:scale-95 flex items-center justify-center shadow-xl transition-transform"
              >
                {isPlaying ? (
                  <Pause className="w-7 h-7 fill-current" />
                ) : (
                  <Play className="w-7 h-7 fill-current ml-1" />
                )}
              </button>

              <button
                onClick={onNext}
                className="p-2 text-white hover:scale-110 transition-transform"
              >
                <SkipForward className="w-7 h-7 fill-current" />
              </button>

              <button
                onClick={onToggleRepeat}
                className={`p-2 rounded-full transition-colors ${
                  repeatMode !== 'off' ? 'text-amber-400' : 'text-neutral-400 hover:text-white'
                }`}
              >
                {repeatMode === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
              </button>
            </div>

            {/* Volume */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button onClick={onToggleMute} className="text-neutral-400 hover:text-white">
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                className="w-32 h-1 bg-white/20 rounded-full accent-white cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Right Section: Synced Karaoke Lyrics & AI Insights */}
        <div className="lg:col-span-7 h-full rounded-3xl bg-black/30 border border-white/10 backdrop-blur-xl overflow-hidden flex flex-col shadow-2xl">
          <SyncedLyricsView
            track={track}
            currentTime={currentTime}
            onSeekToLyric={onSeek}
            dominantColor={track.color}
          />
        </div>
      </div>
    </div>
  );
};
