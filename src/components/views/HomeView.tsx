import React from 'react';
import {
  Play,
  Pause,
  Sparkles,
  Disc3,
  Heart,
  Plus,
  Radio,
  Sliders,
  ChevronRight,
  TrendingUp,
  Volume2,
  Headphones,
  Compass,
} from 'lucide-react';
import { Track, Album, Artist, Playlist, AIRecommendationMix } from '../../types';
import { formatTime, formatNumber } from '../../utils/formatters';

interface HomeViewProps {
  tracks: Track[];
  albums: Album[];
  artists: Artist[];
  playlists: Playlist[];
  aiRecommendations: AIRecommendationMix[];
  currentTrack: Track | null;
  isPlaying: boolean;
  onPlayTrack: (track: Track, queueList?: Track[]) => void;
  onSelectAlbum: (id: string) => void;
  onSelectArtist: (id: string) => void;
  onSelectPlaylist: (id: string) => void;
  onToggleLike: (trackId: string) => void;
  onOpenAIDiscovery: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  tracks,
  albums,
  artists,
  playlists,
  aiRecommendations,
  currentTrack,
  isPlaying,
  onPlayTrack,
  onSelectAlbum,
  onSelectArtist,
  onSelectPlaylist,
  onToggleLike,
  onOpenAIDiscovery,
}) => {
  const [liveTrending, setLiveTrending] = React.useState<Track[]>([]);

  React.useEffect(() => {
    fetch('/api/music-api/trending')
      .then((r) => r.json())
      .then((d) => {
        if (d.trending?.length) {
          setLiveTrending(d.trending);
        }
      })
      .catch(() => {});
  }, []);

  const featuredTrack = tracks[0] || null;

  return (
    <div id="sonora-home-view" className="p-8 space-y-10 max-w-7xl mx-auto animate-fade-in select-none">
      {/* Hero Featured Billboard (Apple Music / Amazon Music flagship banner) */}
      {featuredTrack && (
        <div className="relative rounded-3xl overflow-hidden border border-neutral-800/80 shadow-2xl bg-gradient-to-r from-neutral-900 via-indigo-950/60 to-black p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 group">
          {/* Dynamic Backdrop */}
          <div
            className="absolute inset-0 opacity-30 blur-3xl pointer-events-none"
            style={{
              background: `radial-gradient(circle at 70% 30%, ${featuredTrack.color || '#6366f1'}, transparent 60%)`,
            }}
          />

          <div className="relative z-10 max-w-xl space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono tracking-widest px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                Master Studio Spotlight
              </span>
              <span className="text-[10px] uppercase font-mono tracking-widest px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">
                192 kHz Lossless
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight font-display">
              {featuredTrack.title}
            </h1>

            <p className="text-sm md:text-base text-neutral-300 leading-relaxed">
              {featuredTrack.notesDescription ||
                'Recorded in high-fidelity 24-bit 192kHz studio masters with immersive binaural 3D spatial acoustics.'}
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                id="hero-play-btn"
                onClick={() => onPlayTrack(featuredTrack, tracks)}
                className="flex items-center gap-2.5 px-6 py-3 rounded-full bg-white text-neutral-950 font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/10"
              >
                {currentTrack?.id === featuredTrack.id && isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 fill-current text-neutral-950" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current text-neutral-950" />
                    <span>Play Master Track</span>
                  </>
                )}
              </button>

              <button
                onClick={() => onToggleLike(featuredTrack.id)}
                className="p-3 rounded-full bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-700/80 text-white transition-colors"
                title="Add to Favorites"
              >
                <Heart
                  className={`w-5 h-5 ${featuredTrack.liked ? 'fill-rose-500 text-rose-500' : ''}`}
                />
              </button>
            </div>
          </div>

          <div className="relative z-10 flex-shrink-0 w-64 md:w-80 aspect-square rounded-2xl overflow-hidden shadow-2xl border border-neutral-700/60">
            <img
              src={featuredTrack.coverUrl}
              alt={featuredTrack.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </div>
        </div>
      )}

      {/* Gemini AI Personalized Discovery Mixes */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Personalized AI Discovery
              </h2>
              <p className="text-xs text-neutral-400">
                Crafted in real-time by Gemini based on your listening habits
              </p>
            </div>
          </div>

          <button
            onClick={onOpenAIDiscovery}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
          >
            <span>Open AI Studio Hub</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {aiRecommendations.map((mix) => {
            const mixTracks = tracks.filter((t) => mix.trackIds.includes(t.id));
            return (
              <div
                key={mix.id}
                id={`ai-mix-card-${mix.id}`}
                onClick={() => {
                  if (mixTracks.length > 0) {
                    onPlayTrack(mixTracks[0], mixTracks);
                  }
                }}
                className={`group p-6 rounded-2xl bg-gradient-to-br ${mix.coverGradient} border border-white/10 hover:border-white/20 shadow-xl cursor-pointer transition-all hover:-translate-y-1 flex flex-col justify-between space-y-4`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-black/40 text-amber-300 border border-white/10">
                      {mix.vibe}
                    </span>
                    <Sparkles className="w-4 h-4 text-amber-300/80" />
                  </div>
                  <h3 className="font-bold text-lg text-white group-hover:text-amber-200 transition-colors">
                    {mix.title}
                  </h3>
                  <p className="text-xs text-neutral-300 leading-relaxed font-normal">
                    {mix.tagline}
                  </p>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-neutral-400">
                  <span className="truncate max-w-[200px] text-[11px] text-neutral-300 italic">
                    "{mix.reason}"
                  </span>
                  <button className="w-8 h-8 rounded-full bg-white text-neutral-950 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg flex-shrink-0">
                    <Play className="w-4 h-4 fill-current ml-0.5 text-neutral-950" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Flagship Curated Playlists */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white tracking-tight">
            Spatial & Lossless Vault
          </h2>
          <span className="text-xs text-neutral-400">Pure 24-bit studio sound</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
          {playlists.map((pl) => (
            <div
              key={pl.id}
              onClick={() => onSelectPlaylist(pl.id)}
              className="group bg-neutral-900/60 hover:bg-neutral-850 border border-neutral-800/80 hover:border-neutral-700 p-4 rounded-2xl cursor-pointer transition-all hover:-translate-y-1 space-y-3"
            >
              <div className="relative aspect-square rounded-xl overflow-hidden shadow-md bg-neutral-950">
                <img
                  src={pl.coverUrl}
                  alt={pl.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <div className="w-10 h-10 rounded-full bg-white text-neutral-950 flex items-center justify-center shadow-lg">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-sm text-white truncate group-hover:text-amber-400 transition-colors">
                  {pl.title}
                </h4>
                <p className="text-xs text-neutral-400 truncate mt-0.5">{pl.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Top Tracks Chart */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              Top 10 Global Hi-Res Stream
            </h2>
          </div>
          <span className="text-xs text-neutral-400">Updated Hourly</span>
        </div>

        <div className="rounded-2xl bg-neutral-900/40 border border-neutral-800/80 overflow-hidden divide-y divide-neutral-800/60">
          {tracks.slice(0, 7).map((track, index) => {
            const isCurrent = currentTrack?.id === track.id;
            return (
              <div
                key={track.id}
                id={`track-row-${track.id}`}
                className={`p-3.5 px-5 flex items-center justify-between gap-4 hover:bg-neutral-800/60 transition-colors group cursor-pointer ${
                  isCurrent ? 'bg-neutral-800/80' : ''
                }`}
                onClick={() => onPlayTrack(track, tracks)}
              >
                {/* Index / Play Icon */}
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="w-6 text-center text-xs font-mono font-bold text-neutral-400 group-hover:hidden">
                    {isCurrent && isPlaying ? (
                      <Volume2 className="w-4 h-4 text-amber-400 animate-pulse mx-auto" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className="w-6 hidden group-hover:flex items-center justify-center">
                    {isCurrent && isPlaying ? (
                      <Pause className="w-4 h-4 text-amber-400" />
                    ) : (
                      <Play className="w-4 h-4 text-white fill-current ml-0.5" />
                    )}
                  </div>

                  <img
                    src={track.coverUrl}
                    alt={track.title}
                    className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p
                        className={`text-sm font-semibold truncate ${
                          isCurrent ? 'text-amber-400' : 'text-white group-hover:text-amber-300'
                        }`}
                      >
                        {track.title}
                      </p>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-400 border border-neutral-700">
                        {track.audioQuality === 'HI_RES_LOSSLESS'
                          ? '192kHz'
                          : track.audioQuality === 'DOLBY_ATMOS'
                          ? 'Atmos'
                          : 'Lossless'}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 truncate">{track.artist}</p>
                  </div>
                </div>

                {/* Album */}
                <div
                  className="hidden md:block w-1/4 text-xs text-neutral-400 truncate hover:text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectAlbum(track.albumId);
                  }}
                >
                  {track.album}
                </div>

                {/* Plays */}
                <div className="hidden sm:block text-xs font-mono text-neutral-400 w-20 text-right">
                  {formatNumber(track.plays)}
                </div>

                {/* Like & Duration */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleLike(track.id);
                    }}
                    className="text-neutral-400 hover:text-rose-400 transition-colors p-1"
                  >
                    <Heart
                      className={`w-4 h-4 ${track.liked ? 'fill-rose-500 text-rose-500' : ''}`}
                    />
                  </button>
                  <span className="text-xs font-mono text-neutral-400 w-10 text-right">
                    {formatTime(track.duration)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Live Streaming Hits from Music-API */}
      {liveTrending.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className="w-5 h-5 text-amber-400" />
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Global Live Streaming (320kbps Master)
                </h2>
                <p className="text-xs text-neutral-400">
                  Direct live stream via Music-API engine with WebAudio DSP remastering
                </p>
              </div>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Live API
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {liveTrending.slice(0, 6).map((track) => (
              <div
                key={track.id}
                onClick={() => onPlayTrack(track, liveTrending)}
                className="group bg-neutral-900/40 hover:bg-neutral-800/80 border border-neutral-800/80 p-3 rounded-2xl cursor-pointer transition-all hover:-translate-y-1 space-y-2"
              >
                <div className="relative aspect-square rounded-xl overflow-hidden bg-neutral-950 shadow-md">
                  <img
                    src={track.coverUrl}
                    alt={track.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <div className="w-9 h-9 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center shadow-lg">
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-xs text-white truncate group-hover:text-amber-400 transition-colors">
                    {track.title}
                  </h4>
                  <p className="text-[11px] text-neutral-400 truncate">{track.artist}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Featured Albums */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white tracking-tight">Studio Master Albums</h2>
          <span className="text-xs text-neutral-400">Direct from artists</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-5">
          {albums.map((album) => (
            <div
              key={album.id}
              onClick={() => onSelectAlbum(album.id)}
              className="group bg-neutral-900/40 hover:bg-neutral-800/80 border border-neutral-800/80 p-3.5 rounded-2xl cursor-pointer transition-all hover:-translate-y-1 space-y-2.5"
            >
              <div className="relative aspect-square rounded-xl overflow-hidden bg-neutral-950">
                <img
                  src={album.coverUrl}
                  alt={album.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white truncate group-hover:text-amber-400 transition-colors">
                  {album.title}
                </h4>
                <p className="text-xs text-neutral-400 truncate">{album.artist}</p>
                <span className="text-[10px] font-mono text-neutral-500">{album.genre}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
