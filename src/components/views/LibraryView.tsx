import React from 'react';
import {
  Library,
  Heart,
  PlusCircle,
  Play,
  Music,
  DownloadCloud,
  Disc3,
  User,
} from 'lucide-react';
import { Track, Playlist, Album, Artist } from '../../types';

interface LibraryViewProps {
  likedTracks: Track[];
  playlists: Playlist[];
  albums: Album[];
  artists: Artist[];
  onPlayLiked: () => void;
  onSelectPlaylist: (id: string) => void;
  onSelectAlbum: (id: string) => void;
  onSelectArtist: (id: string) => void;
  onOpenCreatePlaylist: () => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  likedTracks,
  playlists,
  albums,
  artists,
  onPlayLiked,
  onSelectPlaylist,
  onSelectAlbum,
  onSelectArtist,
  onOpenCreatePlaylist,
}) => {
  return (
    <div id="sonora-library-view" className="p-8 space-y-10 max-w-7xl mx-auto animate-fade-in select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Library className="w-4 h-4" />
            <span>Personal Collection</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight font-display">
            My Library
          </h1>
        </div>

        <button
          onClick={onOpenCreatePlaylist}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-lg transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Playlist</span>
        </button>
      </div>

      {/* Hero: Liked Songs Card */}
      <div
        onClick={onPlayLiked}
        className="p-8 rounded-3xl bg-gradient-to-tr from-rose-950 via-purple-950 to-indigo-950 border border-rose-500/30 shadow-2xl cursor-pointer hover:scale-[1.01] transition-transform flex flex-col md:flex-row items-center justify-between gap-6 group"
      >
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center shadow-xl shadow-rose-950/50">
            <Heart className="w-10 h-10 fill-white text-white" />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-white group-hover:text-rose-200 transition-colors">
              Favorite Liked Songs
            </h2>
            <p className="text-sm text-neutral-300">
              {likedTracks.length} high-fidelity tracks saved to your local and cloud library
            </p>
          </div>
        </div>

        <button className="w-12 h-12 rounded-full bg-white text-neutral-950 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
          <Play className="w-6 h-6 fill-current ml-0.5" />
        </button>
      </div>

      {/* Playlists Grid */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold text-white">Your Playlists ({playlists.length})</h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
          {playlists.map((pl) => (
            <div
              key={pl.id}
              onClick={() => onSelectPlaylist(pl.id)}
              className="group bg-neutral-900/60 hover:bg-neutral-800/80 border border-neutral-800 p-4 rounded-2xl cursor-pointer transition-all hover:-translate-y-1 space-y-3"
            >
              <div className="aspect-square rounded-xl overflow-hidden shadow bg-neutral-950">
                <img
                  src={pl.coverUrl}
                  alt={pl.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white truncate group-hover:text-amber-400">
                  {pl.title}
                </h4>
                <p className="text-xs text-neutral-400 truncate">{pl.trackIds.length} tracks</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Saved Artists */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold text-white">Artists</h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {artists.map((art) => (
            <div
              key={art.id}
              onClick={() => onSelectArtist(art.id)}
              className="p-3 text-center rounded-2xl bg-neutral-900/40 hover:bg-neutral-800/60 border border-neutral-800/80 cursor-pointer transition-all hover:-translate-y-1 space-y-2 group"
            >
              <img
                src={art.avatarUrl}
                alt={art.name}
                className="w-20 h-20 mx-auto rounded-full object-cover shadow-md group-hover:scale-105 transition-transform"
              />
              <div>
                <h5 className="font-bold text-xs text-white truncate group-hover:text-amber-400">
                  {art.name}
                </h5>
                <p className="text-[10px] text-neutral-400">Artist</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
