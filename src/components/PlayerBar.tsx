import React, { useState } from 'react';
import {
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
  ListMusic,
  Maximize2,
  Sliders,
  Radio,
  Download,
  Check,
  Cast,
  Headphones,
  Sparkles,
} from 'lucide-react';
import { Track, AudioQualityType } from '../types';
import { formatTime } from '../utils/formatters';
import { AudioSpectrumCanvas } from './AudioSpectrumCanvas';

interface PlayerBarProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isShuffled: boolean;
  repeatMode: 'off' | 'all' | 'one';
  isDJEnabled: boolean;
  isLyricsOpen: boolean;
  isQueueOpen: boolean;
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
  onToggleLyrics: () => void;
  onToggleQueue: () => void;
  onToggleLike: (trackId: string) => void;
  onDownloadTrack: (track: Track) => void;
  onOpenFullscreen: () => void;
  onOpenEqualizer: () => void;
  onOpenDeviceModal: () => void;
}

export const PlayerBar: React.FC<PlayerBarProps> = ({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  isShuffled,
  repeatMode,
  isDJEnabled,
  isLyricsOpen,
  isQueueOpen,
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
  onToggleLyrics,
  onToggleQueue,
  onToggleLike,
  onDownloadTrack,
  onOpenFullscreen,
  onOpenEqualizer,
  onOpenDeviceModal,
}) => {
  const [isHoveringSeek, setIsHoveringSeek] = useState(false);
  const [hoverSeekTime, setHoverSeekTime] = useState(0);

  if (!currentTrack) {
    return (
      <div
        id="sonora-player-bar-empty"
        className="h-20 bg-neutral-950/90 backdrop-blur-2xl border-t border-neutral-900 px-6 flex items-center justify-between text-neutral-400 text-sm select-none"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center">
            <Headphones className="w-5 h-5 text-neutral-600" />
          </div>
          <div>
            <p className="text-neutral-300 font-medium text-sm">Select a track to start streaming</p>
            <p className="text-xs text-neutral-400">Hi-Res Lossless 24-bit 192kHz Ready</p>
          </div>
        </div>
      </div>
    );
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const remainingTime = duration > currentTime ? duration - currentTime : 0;

  const getQualityBadge = (quality: AudioQualityType) => {
    switch (quality) {
      case 'HI_RES_LOSSLESS':
        return (
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1 font-semibold">
            <span>Hi-Res 192kHz</span>
          </span>
        );
      case 'DOLBY_ATMOS':
        return (
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-violet-500/15 text-violet-300 border border-violet-500/30 font-semibold">
            Dolby Atmos
          </span>
        );
      case 'LOSSLESS':
        return (
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold">
            Lossless ALAC
          </span>
        );
      default:
        return (
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400">
            320 kbps
          </span>
        );
    }
  };

  return (
    <footer
      id="sonora-player-bar"
      className="h-24 bg-neutral-950/90 backdrop-blur-2xl border-t border-neutral-800/60 px-6 py-2 flex items-center justify-between gap-4 select-none relative z-40"
    >
      {/* Dynamic Background Glow from Track Color */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20 blur-3xl"
        style={{
          background: `radial-gradient(ellipse at 50% 120%, ${currentTrack.color || '#6366f1'}, transparent 70%)`,
        }}
      />

      {/* Left: Track Information */}
      <div className="flex items-center gap-3.5 w-1/4 min-w-[220px]">
        <div
          className="relative group cursor-pointer w-14 h-14 rounded-xl overflow-hidden shadow-md flex-shrink-0 bg-neutral-900 border border-neutral-800/80"
          onClick={onOpenFullscreen}
          title="Open immersive full screen player & lyrics"
        >
          <img
            src={currentTrack.coverUrl}
            alt={currentTrack.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <Maximize2 className="w-5 h-5 text-white" />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4
              onClick={onOpenFullscreen}
              className="text-sm font-semibold text-white truncate cursor-pointer hover:underline"
            >
              {currentTrack.title}
            </h4>
            {getQualityBadge(currentTrack.audioQuality)}
          </div>
          <p className="text-xs text-neutral-400 truncate hover:text-neutral-300 cursor-pointer">
            {currentTrack.artist}
          </p>

          <div className="flex items-center gap-2 mt-1">
            <button
              id="like-current-track-btn"
              onClick={() => onToggleLike(currentTrack.id)}
              className="text-neutral-400 hover:text-rose-400 transition-colors"
              title={currentTrack.liked ? 'Remove from Liked' : 'Save to Liked Songs'}
            >
              <Heart
                className={`w-3.5 h-3.5 ${currentTrack.liked ? 'fill-rose-500 text-rose-500' : ''}`}
              />
            </button>

            <button
              id="download-current-track-btn"
              onClick={() => onDownloadTrack(currentTrack)}
              className={`transition-colors ${isDownloaded ? 'text-sky-400' : 'text-neutral-400 hover:text-sky-400'}`}
              title={isDownloaded ? 'Downloaded for offline' : 'Download for offline'}
            >
              {isDownloaded ? <Check className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
            </button>

            {/* Mini Spectrum Visualizer */}
            <div className="w-16 h-3.5 opacity-80">
              <AudioSpectrumCanvas
                isPlaying={isPlaying}
                color={currentTrack.color || '#6366f1'}
                height={14}
                barCount={10}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Center: Playback Controls & Scrubber */}
      <div className="flex flex-col items-center max-w-xl w-2/4 px-4">
        {/* Buttons */}
        <div className="flex items-center gap-5 mb-1.5">
          {/* Smart DJ Voice commentary button */}
          <button
            id="toggle-dj-mode-btn"
            onClick={onToggleDJ}
            title={isDJEnabled ? 'Aura AI DJ Active' : 'Enable Aura AI DJ Radio Mode'}
            className={`p-1.5 rounded-full transition-all ${
              isDJEnabled
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-950'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Radio className="w-4 h-4" />
          </button>

          {/* Shuffle */}
          <button
            id="player-shuffle-btn"
            onClick={onToggleShuffle}
            title={isShuffled ? 'Shuffle On' : 'Shuffle Off'}
            className={`p-1.5 rounded-full transition-colors ${
              isShuffled ? 'text-amber-400' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Shuffle className="w-4 h-4" />
          </button>

          {/* Previous */}
          <button
            id="player-prev-btn"
            onClick={onPrevious}
            className="p-1.5 text-neutral-300 hover:text-white transition-colors"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>

          {/* Play / Pause */}
          <button
            id="player-play-pause-btn"
            onClick={onTogglePlay}
            className="w-10 h-10 rounded-full bg-white text-neutral-950 hover:scale-105 active:scale-95 flex items-center justify-center shadow-lg shadow-white/10 transition-all"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current text-neutral-950" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5 text-neutral-950" />
            )}
          </button>

          {/* Next */}
          <button
            id="player-next-btn"
            onClick={onNext}
            className="p-1.5 text-neutral-300 hover:text-white transition-colors"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>

          {/* Repeat */}
          <button
            id="player-repeat-btn"
            onClick={onToggleRepeat}
            title={`Repeat: ${repeatMode}`}
            className={`p-1.5 rounded-full transition-colors ${
              repeatMode !== 'off' ? 'text-amber-400' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
          </button>
        </div>

        {/* Scrubber Bar */}
        <div className="w-full flex items-center gap-3 text-[11px] font-mono text-neutral-400">
          <span className="w-9 text-right text-neutral-400">{formatTime(currentTime)}</span>

          <div
            className="flex-1 relative h-4 flex items-center cursor-pointer group"
            onMouseEnter={() => setIsHoveringSeek(true)}
            onMouseLeave={() => setIsHoveringSeek(false)}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const ratio = Math.max(0, Math.min(1, clickX / rect.width));
              onSeek(ratio * duration);
            }}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const moveX = e.clientX - rect.left;
              const ratio = Math.max(0, Math.min(1, moveX / rect.width));
              setHoverSeekTime(ratio * duration);
            }}
          >
            {/* Track Bar Background */}
            <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden group-hover:h-2 transition-all">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-rose-400 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Scrubber Knob */}
            <div
              className="absolute w-3 h-3 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity transform -translate-x-1/2"
              style={{ left: `${progressPercent}%` }}
            />

            {/* Hover Tooltip Timestamp */}
            {isHoveringSeek && (
              <div
                className="absolute -top-7 transform -translate-x-1/2 px-2 py-0.5 rounded bg-neutral-900 border border-neutral-700 text-[10px] text-white pointer-events-none shadow"
                style={{
                  left: `${(hoverSeekTime / (duration || 1)) * 100}%`,
                }}
              >
                {formatTime(hoverSeekTime)}
              </div>
            )}
          </div>

          <span className="w-9 text-left text-neutral-400">-{formatTime(remainingTime)}</span>
        </div>
      </div>

      {/* Right: Audio DSP, Synced Lyrics, Queue, Volume, Fullscreen */}
      <div className="flex items-center justify-end gap-3 w-1/4 min-w-[220px]">
        {/* Synced Lyrics Toggle */}
        <button
          id="toggle-synced-lyrics-btn"
          onClick={onToggleLyrics}
          title="Synced Karaoke Lyrics & Song Insights"
          className={`p-2 rounded-xl transition-all ${
            isLyricsOpen
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm shadow-rose-950'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900/60'
          }`}
        >
          <Mic2 className="w-4 h-4" />
        </button>

        {/* 10-Band EQ & DSP modal trigger */}
        <button
          id="toggle-eq-bar-btn"
          onClick={onOpenEqualizer}
          title="10-Band Graphic Equalizer & Spatial 3D Audio"
          className="p-2 rounded-xl text-neutral-400 hover:text-amber-400 hover:bg-neutral-900/60 transition-colors"
        >
          <Sliders className="w-4 h-4" />
        </button>

        {/* Up Next Queue Drawer */}
        <button
          id="toggle-queue-btn"
          onClick={onToggleQueue}
          title="Play Queue & History"
          className={`p-2 rounded-xl transition-all ${
            isQueueOpen
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900/60'
          }`}
        >
          <ListMusic className="w-4 h-4" />
        </button>

        {/* AirPlay / Connect */}
        <button
          id="player-airplay-btn"
          onClick={onOpenDeviceModal}
          title="AirPlay & Connected Cloud Devices"
          className="p-2 rounded-xl text-neutral-400 hover:text-cyan-400 hover:bg-neutral-900/60 transition-colors"
        >
          <Cast className="w-4 h-4" />
        </button>

        {/* Volume Slider */}
        <div className="flex items-center gap-2">
          <button
            id="toggle-mute-btn"
            onClick={onToggleMute}
            className="text-neutral-400 hover:text-white transition-colors"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          <input
            id="player-volume-slider"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="w-20 h-1.5 bg-neutral-800 rounded-full accent-amber-400 cursor-pointer"
          />
        </div>

        {/* Fullscreen Player */}
        <button
          id="open-fullscreen-player-btn"
          onClick={onOpenFullscreen}
          title="Immersive Fullscreen Experience"
          className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-900/60 transition-colors"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </footer>
  );
};
