import React from 'react';
import { X, ListMusic, Play, Trash2, Sparkles, Music2, Radio, Check } from 'lucide-react';
import { Track } from '../types';
import { formatTime } from '../utils/formatters';

interface QueueDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentTrack: Track | null;
  queue: Track[];
  history: Track[];
  onPlayTrack: (track: Track) => void;
  onRemoveFromQueue: (index: number) => void;
  onClearQueue: () => void;
  isAutoplay: boolean;
  onToggleAutoplay: () => void;
}

export const QueueDrawer: React.FC<QueueDrawerProps> = ({
  isOpen,
  onClose,
  currentTrack,
  queue,
  history,
  onPlayTrack,
  onRemoveFromQueue,
  onClearQueue,
  isAutoplay,
  onToggleAutoplay,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-neutral-900/95 backdrop-blur-2xl border-l border-neutral-800 shadow-2xl flex flex-col animate-slide-left select-none">
      {/* Header */}
      <div className="p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
        <div className="flex items-center gap-2.5">
          <ListMusic className="w-5 h-5 text-amber-400" />
          <h3 className="font-bold text-base text-white">Playback Queue</h3>
        </div>

        <div className="flex items-center gap-2">
          {queue.length > 0 && (
            <button
              onClick={onClearQueue}
              className="text-xs text-neutral-400 hover:text-rose-400 flex items-center gap-1 transition-colors px-2 py-1"
              title="Clear upcoming queue"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Autoplay & DJ Toggle */}
      <div className="p-4 bg-neutral-950/40 border-b border-neutral-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <div>
            <p className="text-xs font-semibold text-white">AI Continuous Autoplay</p>
            <p className="text-[10px] text-neutral-400">Play similar songs when queue ends</p>
          </div>
        </div>
        <input
          type="checkbox"
          checked={isAutoplay}
          onChange={onToggleAutoplay}
          className="w-4 h-4 rounded accent-indigo-500 cursor-pointer"
        />
      </div>

      {/* Queue List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Now Playing */}
        {currentTrack && (
          <div>
            <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              Now Playing
            </p>
            <div className="p-3 rounded-xl bg-neutral-800/80 border border-neutral-700/60 flex items-center gap-3">
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">{currentTrack.title}</p>
                <p className="text-[11px] text-neutral-400 truncate">{currentTrack.artist}</p>
              </div>
              <span className="text-[10px] font-mono text-amber-400">Playing</span>
            </div>
          </div>
        )}

        {/* Up Next */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
              Up Next ({queue.length})
            </p>
          </div>

          {queue.length === 0 ? (
            <div className="p-6 rounded-xl bg-neutral-950/40 border border-neutral-800/60 text-center text-neutral-400 text-xs">
              <Music2 className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
              <p>Queue is empty</p>
              <p className="text-[11px] text-neutral-400 mt-1">
                AI Autoplay will discover next songs automatically
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {queue.map((track, idx) => (
                <div
                  key={`${track.id}-${idx}`}
                  className="group p-2.5 rounded-xl hover:bg-neutral-800/60 flex items-center justify-between gap-3 transition-colors"
                >
                  <div
                    className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                    onClick={() => onPlayTrack(track)}
                  >
                    <img
                      src={track.coverUrl}
                      alt={track.title}
                      className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-neutral-200 truncate group-hover:text-amber-400 transition-colors">
                        {track.title}
                      </p>
                      <p className="text-[11px] text-neutral-400 truncate">{track.artist}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-neutral-400">
                      {formatTime(track.duration)}
                    </span>
                    <button
                      onClick={() => onRemoveFromQueue(idx)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-rose-400 transition-all"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* History */}
        {history.length > 0 && (
          <div>
            <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              Recently Played
            </p>
            <div className="space-y-1.5">
              {history.slice(0, 5).map((track, idx) => (
                <div
                  key={`hist-${track.id}-${idx}`}
                  onClick={() => onPlayTrack(track)}
                  className="p-2 rounded-xl hover:bg-neutral-800/40 flex items-center gap-3 cursor-pointer opacity-70 hover:opacity-100 transition-all"
                >
                  <img
                    src={track.coverUrl}
                    alt={track.title}
                    className="w-7 h-7 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-neutral-300 truncate">{track.title}</p>
                    <p className="text-[10px] text-neutral-400 truncate">{track.artist}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
