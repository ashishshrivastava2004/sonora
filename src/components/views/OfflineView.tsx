import React from 'react';
import {
  DownloadCloud,
  HardDrive,
  Trash2,
  Play,
  CheckCircle2,
  WifiOff,
  Wifi,
  Music2,
  Sparkles,
  Volume2,
} from 'lucide-react';
import { Track } from '../../types';
import { formatTime, formatBytes } from '../../utils/formatters';

interface OfflineViewProps {
  downloadedTracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  onPlayTrack: (track: Track, queueList?: Track[]) => void;
  onRemoveDownloadedTrack: (trackId: string) => Promise<void>;
  onClearOfflineStorage: () => Promise<void>;
  storageUsage: { used: number; quota: number };
  isOfflineMode: boolean;
  onToggleOfflineMode: () => void;
}

export const OfflineView: React.FC<OfflineViewProps> = ({
  downloadedTracks,
  currentTrack,
  isPlaying,
  onPlayTrack,
  onRemoveDownloadedTrack,
  onClearOfflineStorage,
  storageUsage,
  isOfflineMode,
  onToggleOfflineMode,
}) => {
  const percentUsed =
    storageUsage.quota > 0 ? (storageUsage.used / storageUsage.quota) * 100 : 0;

  return (
    <div id="sonora-offline-view" className="p-8 space-y-8 max-w-6xl mx-auto animate-fade-in select-none">
      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-sky-950 via-neutral-900 to-indigo-950 border border-sky-500/30 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono px-2.5 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold flex items-center gap-1.5">
              <DownloadCloud className="w-3.5 h-3.5" />
              <span>Offline Listening Engine</span>
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight font-display">
            Offline Vault & Local Cache
          </h1>
          <p className="text-sm text-neutral-300 leading-relaxed">
            All songs saved here are stored in IndexedDB browser storage for seamless playback on airplanes, subways, or whenever network connectivity drops.
          </p>
        </div>

        {/* Offline Mode Toggle Box */}
        <div className="p-5 rounded-2xl bg-neutral-950/80 border border-neutral-800 space-y-3 min-w-[240px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-300">Offline-Only Mode</span>
            <input
              type="checkbox"
              checked={isOfflineMode}
              onChange={onToggleOfflineMode}
              className="w-4 h-4 rounded accent-sky-400 cursor-pointer"
            />
          </div>
          <p className="text-[11px] text-neutral-400">
            {isOfflineMode
              ? 'Only playing local cached tracks'
              : 'Streaming with online cloud sync'}
          </p>
        </div>
      </div>

      {/* Storage Meter Card */}
      <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="w-12 h-12 rounded-xl bg-neutral-800 flex items-center justify-center text-sky-400 flex-shrink-0">
            <HardDrive className="w-6 h-6" />
          </div>
          <div className="space-y-1 flex-1">
            <h3 className="font-bold text-sm text-white">Local Offline Storage</h3>
            <p className="text-xs text-neutral-400">
              {formatBytes(storageUsage.used)} used across {downloadedTracks.length} lossless tracks
            </p>
            <div className="w-64 h-2 bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 rounded-full"
                style={{ width: `${Math.max(4, percentUsed)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {downloadedTracks.length > 0 && (
            <>
              <button
                onClick={() => onPlayTrack(downloadedTracks[0], downloadedTracks)}
                className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-neutral-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-sky-950 transition-colors"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Play All Offline</span>
              </button>

              <button
                onClick={onClearOfflineStorage}
                className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-neutral-300 text-xs font-semibold flex items-center gap-2 transition-colors"
              >
                <Trash2 className="w-4 h-4 text-rose-400" />
                <span>Clear Cache</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Downloaded Tracks Table */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white">Downloaded Tracks ({downloadedTracks.length})</h3>

        {downloadedTracks.length === 0 ? (
          <div className="p-12 rounded-2xl bg-neutral-900/40 border border-neutral-800 text-center space-y-3">
            <DownloadCloud className="w-12 h-12 text-neutral-600 mx-auto" />
            <h4 className="text-base font-semibold text-white">No tracks downloaded yet</h4>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              Click the download icon next to any song or album to save it for offline listening.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl bg-neutral-900/40 border border-neutral-800 overflow-hidden divide-y divide-neutral-800/60">
            {downloadedTracks.map((track, i) => {
              const isCurrent = currentTrack?.id === track.id;
              return (
                <div
                  key={track.id}
                  onClick={() => onPlayTrack(track, downloadedTracks)}
                  className={`p-3.5 px-5 flex items-center justify-between gap-4 hover:bg-neutral-800/60 transition-colors group cursor-pointer ${
                    isCurrent ? 'bg-neutral-800/80' : ''
                  }`}
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <span className="w-6 text-center text-xs font-mono text-neutral-400">
                      {i + 1}
                    </span>
                    <img
                      src={track.coverUrl}
                      alt={track.title}
                      className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm font-semibold truncate ${
                          isCurrent ? 'text-sky-400' : 'text-white group-hover:text-sky-300'
                        }`}
                      >
                        {track.title}
                      </p>
                      <p className="text-xs text-neutral-400 truncate">{track.artist}</p>
                    </div>
                  </div>

                  <div className="text-xs font-mono text-neutral-400 hidden sm:block">
                    {track.formatInfo.sampleRate} • {track.formatInfo.bitDepth}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-neutral-400">
                      {formatTime(track.duration)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveDownloadedTrack(track.id);
                      }}
                      className="p-1.5 text-neutral-400 hover:text-rose-400 transition-colors"
                      title="Remove from offline vault"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
