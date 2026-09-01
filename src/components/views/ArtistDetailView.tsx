import React from 'react';
import { Play, Shuffle, Heart, Disc3, CheckCircle2 } from 'lucide-react';
import { Artist, Track, Album } from '../../types';
import { formatTime, formatNumber } from '../../utils/formatters';

interface ArtistDetailViewProps {
  artist: Artist;
  tracks: Track[];
  albums: Album[];
  currentTrack: Track | null;
  isPlaying: boolean;
  onPlayTrack: (track: Track, queueList?: Track[]) => void;
  onSelectAlbum: (albumId: string) => void;
  onToggleLike: (trackId: string) => void;
}

export const ArtistDetailView: React.FC<ArtistDetailViewProps> = ({
  artist,
  tracks,
  albums,
  currentTrack,
  isPlaying,
  onPlayTrack,
  onSelectAlbum,
  onToggleLike,
}) => {
  return (
    <div id="sonora-artist-detail-view" className="animate-fade-in select-none">
      {/* Header Banner */}
      <div className="relative h-80 md:h-96 w-full overflow-hidden flex items-end p-8 md:p-12 border-b border-neutral-800">
        <img
          src={artist.avatarUrl}
          alt={artist.name}
          className="absolute inset-0 w-full h-full object-cover object-center filter brightness-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent" />

        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 fill-cyan-400 text-neutral-950" />
            <span>Verified Sonora Artist</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight font-display">
            {artist.name}
          </h1>

          <p className="text-xs md:text-sm text-neutral-300 font-mono">
            {formatNumber(artist.monthlyListeners)} monthly listeners • {artist.genre}
          </p>

          <p className="text-xs text-neutral-300 line-clamp-2 max-w-xl">{artist.bio}</p>
        </div>
      </div>

      <div className="p-8 max-w-7xl mx-auto space-y-10">
        {/* Popular Tracks */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white">Popular Master Tracks</h2>

          <div className="rounded-2xl bg-neutral-900/40 border border-neutral-800 overflow-hidden divide-y divide-neutral-800/60">
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
                      <p className="text-xs text-neutral-400 truncate">{track.album}</p>
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
        </section>

        {/* Discography */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white">Discography</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            {albums.map((alb) => (
              <div
                key={alb.id}
                onClick={() => onSelectAlbum(alb.id)}
                className="group bg-neutral-900/60 hover:bg-neutral-850 border border-neutral-800 p-3.5 rounded-2xl cursor-pointer transition-all hover:-translate-y-1 space-y-2.5"
              >
                <div className="aspect-square rounded-xl overflow-hidden bg-neutral-950">
                  <img
                    src={alb.coverUrl}
                    alt={alb.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white truncate group-hover:text-amber-400">
                    {alb.title}
                  </h4>
                  <p className="text-xs text-neutral-400">{alb.year} • Album</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
