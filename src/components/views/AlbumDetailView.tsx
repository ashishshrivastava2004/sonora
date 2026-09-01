import React from 'react';
import { Play, Shuffle, Download, Heart, Clock, Disc3 } from 'lucide-react';
import { Album, Track } from '../../types';
import { formatTime } from '../../utils/formatters';

interface AlbumDetailViewProps {
  album: Album;
  tracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  onPlayTrack: (track: Track, queueList?: Track[]) => void;
  onPlayAll: (shuffle?: boolean) => void;
  onSelectArtist: (artistId: string) => void;
  onToggleLike: (trackId: string) => void;
}

export const AlbumDetailView: React.FC<AlbumDetailViewProps> = ({
  album,
  tracks,
  currentTrack,
  isPlaying,
  onPlayTrack,
  onPlayAll,
  onSelectArtist,
  onToggleLike,
}) => {
  const totalDuration = tracks.reduce((acc, t) => acc + t.duration, 0);

  return (
    <div id="sonora-album-detail-view" className="animate-fade-in select-none">
      {/* Header */}
      <div className="p-8 md:p-12 bg-gradient-to-b from-neutral-900 via-neutral-950 to-black border-b border-neutral-800/80 flex flex-col md:flex-row items-end gap-8">
        <div className="w-48 h-48 md:w-56 md:h-56 rounded-2xl overflow-hidden shadow-2xl flex-shrink-0 bg-neutral-900 border border-neutral-700">
          <img
            src={album.coverUrl}
            alt={album.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="space-y-3 flex-1">
          <span className="text-xs uppercase font-bold tracking-widest text-amber-400">
            Studio Master Album
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight font-display">
            {album.title}
          </h1>
          <p
            onClick={() => onSelectArtist(album.artistId)}
            className="text-base text-neutral-300 hover:underline cursor-pointer font-semibold"
          >
            {album.artist}
          </p>

          <div className="flex items-center gap-3 text-xs text-neutral-400 font-mono pt-1">
            <span>{album.year}</span>
            <span>•</span>
            <span>{tracks.length} Songs</span>
            <span>•</span>
            <span>{Math.round(totalDuration / 60)} min</span>
            <span>•</span>
            <span className="text-amber-400 font-semibold">{album.audioQuality.replace(/_/g, ' ')}</span>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="px-8 py-5 flex items-center gap-4 border-b border-neutral-900 bg-neutral-950/40">
        <button
          onClick={() => onPlayAll(false)}
          className="w-12 h-12 rounded-full bg-white text-neutral-950 flex items-center justify-center shadow-xl hover:scale-105 transition-all"
        >
          <Play className="w-5 h-5 fill-current ml-0.5" />
        </button>

        <button
          onClick={() => onPlayAll(true)}
          className="p-3 rounded-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white transition-colors"
          title="Shuffle Play Album"
        >
          <Shuffle className="w-4 h-4" />
        </button>
      </div>

      {/* Track List */}
      <div className="p-8 max-w-7xl mx-auto">
        <div className="rounded-2xl bg-neutral-900/40 border border-neutral-800/80 overflow-hidden divide-y divide-neutral-800/60">
          {tracks.map((track, i) => {
            const isCurrent = currentTrack?.id === track.id;
            return (
              <div
                key={track.id}
                onClick={() => onPlayTrack(track, tracks)}
                className={`p-3.5 px-5 flex items-center justify-between gap-4 hover:bg-neutral-800/60 transition-colors group cursor-pointer ${
                  isCurrent ? 'bg-neutral-800/80' : ''
                }`}
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <span className="w-6 text-center text-xs font-mono text-neutral-400">
                    {i + 1}
                  </span>
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

                <div className="flex items-center gap-3">
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
                  <span className="text-xs font-mono text-neutral-400">
                    {formatTime(track.duration)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
