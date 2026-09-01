import React from 'react';
import { Compass, Sparkles, Play, Headphones, Disc3, Radio } from 'lucide-react';
import { Track, Album } from '../../types';

interface ExploreViewProps {
  tracks: Track[];
  albums: Album[];
  onPlayTrack: (track: Track, queueList?: Track[]) => void;
  onSelectAlbum: (id: string) => void;
  onFilterGenre: (genre: string) => void;
}

const GENRE_CARDS = [
  { name: 'Synthwave & Cyberpunk', color: 'from-fuchsia-950 via-purple-900 to-black', count: '14 Masters' },
  { name: 'Acoustic & Folk', color: 'from-amber-950 via-orange-950 to-black', count: '9 Masters' },
  { name: 'Ambient & Binaural', color: 'from-cyan-950 via-teal-950 to-black', count: '12 Masters' },
  { name: 'Electronic & Club', color: 'from-rose-950 via-pink-950 to-black', count: '18 Masters' },
  { name: 'Orchestral Cinematic', color: 'from-indigo-950 via-slate-900 to-black', count: '8 Masters' },
  { name: 'Audiophile 192kHz Vault', color: 'from-emerald-950 via-teal-900 to-black', count: '22 Masters' },
];

export const ExploreView: React.FC<ExploreViewProps> = ({
  tracks,
  albums,
  onPlayTrack,
  onSelectAlbum,
  onFilterGenre,
}) => {
  return (
    <div id="sonora-explore-view" className="p-8 space-y-10 max-w-7xl mx-auto animate-fade-in select-none">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
          <Compass className="w-4 h-4" />
          <span>Discover & Audiophile Categories</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight font-display">
          Explore Hi-Res Audio
        </h1>
        <p className="text-sm text-neutral-400">
          Browse by acoustic textures, spatial audio recordings, and genre categories.
        </p>
      </div>

      {/* Genre Grid */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-white">Browse by Sonic Vibe</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
          {GENRE_CARDS.map((card, i) => (
            <div
              key={i}
              onClick={() => onFilterGenre(card.name)}
              className={`p-6 rounded-2xl bg-gradient-to-br ${card.color} border border-white/10 hover:border-white/20 shadow-xl cursor-pointer transition-all hover:-translate-y-1 flex flex-col justify-between h-36 group`}
            >
              <span className="text-[10px] font-mono text-neutral-300">{card.count}</span>
              <div>
                <h3 className="font-bold text-base text-white group-hover:text-amber-300 transition-colors">
                  {card.name}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Spatial Audio Showcase */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Spatial Audio 3D Masters</h2>
            <p className="text-xs text-neutral-400">
              Engineered with binaural reverberation and spatial head tracking depth
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {(tracks || []).filter((t) => t?.spatialSupport).map((track) => (
            <div
              key={track.id}
              onClick={() => onPlayTrack(track, tracks)}
              className="p-4 rounded-2xl bg-neutral-900/60 hover:bg-neutral-800/80 border border-neutral-800 flex items-center gap-4 cursor-pointer transition-all hover:-translate-y-1 group"
            >
              <img
                src={track.coverUrl}
                alt={track.title}
                className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  Dolby Atmos 3D
                </span>
                <h4 className="font-semibold text-sm text-white truncate mt-1 group-hover:text-amber-300">
                  {track.title}
                </h4>
                <p className="text-xs text-neutral-400 truncate">{track.artist}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
