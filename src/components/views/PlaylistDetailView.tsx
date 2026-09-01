import React from 'react';
import {
  Play,
  Shuffle,
  Download,
  Check,
  Edit2,
  Trash2,
  Clock,
  Heart,
  Music,
  Share2,
  Sparkles,
} from 'lucide-react';
import { Playlist, Track } from '../../types';
import { formatTime } from '../../utils/formatters';

interface PlaylistDetailViewProps {
  playlist: Playlist;
  tracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  onPlayTrack: (track: Track, queueList?: Track[]) => void;
  onPlayAll: (shuffle?: boolean) => void;
  onDownloadAll: () => Promise<void>;
  onEditPlaylist: () => void;
  onDeletePlaylist: (id: string) => Promise<void>;
  onToggleLike: (trackId: string) => void;
  onDownloadTrack: (track: Track) => void;
  downloadedIds: string[];
}

export const PlaylistDetailView: React.FC<PlaylistDetailViewProps> = ({
  playlist,
  tracks,
  currentTrack,
  isPlaying,
  onPlayTrack,
  onPlayAll,
  onDownloadAll,
  onEditPlaylist,
  onDeletePlaylist,
  onToggleLike,
  onDownloadTrack,
  downloadedIds,
}) => {
  const totalDuration = tracks.reduce((acc, t) => acc + t.duration, 0);

  return (
    <div id="sonora-playlist-detail-view" className="animate-fade-in select-none">
      {/* Top Banner Header */}
      <div
        className={`p-8 md:p-12 bg-gradient-to-b ${playlist.gradient || 'from-indigo-950 via-neutral-900 to-black'} border-b border-neutral-800/80 flex flex-col md:flex-row items-end gap-8 relative`}
      >
        <div className="w-48 h-48 md:w-56 md:h-56 rounded-2xl overflow-hidden shadow-2xl flex-shrink-0 bg-neutral-950 border border-white/10">
          <img
            src={playlist.coverUrl}
            alt={playlist.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="space-y-3 flex-1">
          <span className="text-xs uppercase font-bold tracking-widest text-white/70">
            Playlist
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight font-display">
            {playlist.title}
          </h1>
          <p className="text-sm text-neutral-300 max-w-2xl">{playlist.description}</p>

          <div className="flex items-center gap-3 text-xs text-neutral-300 font-mono pt-2">
            <span>{tracks.length} tracks</span>
            <span>•</span>
            <span>{Math.round(totalDuration / 60)} minutes</span>
            <span>•</span>
            <span className="text-amber-400">Lossless Master</span>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="px-8 py-5 flex items-center justify-between border-b border-neutral-900 bg-neutral-950/40">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onPlayAll(false)}
            className="w-12 h-12 rounded-full bg-white text-neutral-950 flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all"
          >
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </button>

          <button
            onClick={() => onPlayAll(true)}
            className="p-3 rounded-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white transition-colors"
            title="Shuffle Play"
          >
            <Shuffle className="w-4 h-4" />
          </button>

          <button
            onClick={onDownloadAll}
            className="p-3 rounded-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-sky-400 transition-colors"
            title="Download All for Offline Listening"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onEditPlaylist}
            className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>

          <button
            onClick={() => onDeletePlaylist(playlist.id)}
            className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-rose-400 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Tracks Table */}
      <div className="p-8 max-w-7xl mx-auto">
        <div className="rounded-2xl bg-neutral-900/40 border border-neutral-800/80 overflow-hidden divide-y divide-neutral-800/60">
          {/* Table Header */}
          <div className="p-3 px-5 grid grid-cols-12 text-xs font-bold text-neutral-400 uppercase tracking-wider bg-neutral-950/40">
            <div className="col-span-1">#</div>
            <div className="col-span-6 md:col-span-5">Title</div>
            <div className="hidden md:block col-span-3">Album</div>
            <div className="col-span-3 md:col-span-2 text-center">Quality</div>
            <div className="col-span-2 md:col-span-1 text-right flex items-center justify-end">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Rows */}
          {tracks.map((track, i) => {
            const isCurrent = currentTrack?.id === track.id;
            const isDown = downloadedIds.includes(track.id);

            return (
              <div
                key={track.id}
                onClick={() => onPlayTrack(track, tracks)}
                className={`p-3.5 px-5 grid grid-cols-12 items-center hover:bg-neutral-800/60 transition-colors group cursor-pointer ${
                  isCurrent ? 'bg-neutral-800/80' : ''
                }`}
              >
                <div className="col-span-1 text-xs font-mono text-neutral-400">
                  {isCurrent && isPlaying ? (
                    <span className="text-amber-400 font-bold">▶</span>
                  ) : (
                    i + 1
                  )}
                </div>

                <div className="col-span-6 md:col-span-5 flex items-center gap-3 min-w-0 pr-2">
                  <img
                    src={track.coverUrl}
                    alt={track.title}
                    className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm font-semibold truncate ${
                        isCurrent ? 'text-amber-400' : 'text-white group-hover:text-amber-300'
                      }`}
                    >
                      {track.title}
                    </p>
                    <p className="text-xs text-neutral-400 truncate">{track.artist}</p>
                  </div>
                </div>

                <div className="hidden md:block col-span-3 text-xs text-neutral-400 truncate">
                  {track.album}
                </div>

                <div className="col-span-3 md:col-span-2 text-center">
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-neutral-950 text-amber-300 border border-neutral-700">
                    {track.formatInfo.sampleRate}
                  </span>
                </div>

                <div className="col-span-2 md:col-span-1 flex items-center justify-end gap-2 text-xs font-mono text-neutral-400">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleLike(track.id);
                    }}
                    className="text-neutral-400 hover:text-rose-400 transition-colors"
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${track.liked ? 'fill-rose-500 text-rose-500' : ''}`}
                    />
                  </button>
                  <span>{formatTime(track.duration)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
