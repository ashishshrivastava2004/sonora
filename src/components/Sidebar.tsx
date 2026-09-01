import React from 'react';
import {
  Home,
  Compass,
  Radio,
  Sparkles,
  Library,
  DownloadCloud,
  Sliders,
  PlusCircle,
  Music,
  Cloud,
  CheckCircle2,
  Disc3,
  Flame,
  Volume2,
} from 'lucide-react';
import { ViewTab, Playlist } from '../types';

interface SidebarProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  playlists: Playlist[];
  selectedPlaylistId: string | null;
  onSelectPlaylist: (id: string) => void;
  onOpenCreatePlaylist: () => void;
  onOpenEqualizer: () => void;
  isCloudSynced: boolean;
  isOfflineMode: boolean;
  offlineCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  playlists,
  selectedPlaylistId,
  onSelectPlaylist,
  onOpenCreatePlaylist,
  onOpenEqualizer,
  isCloudSynced,
  isOfflineMode,
  offlineCount,
}) => {
  return (
    <aside
      id="sonora-sidebar"
      className="w-64 flex-shrink-0 bg-neutral-950/80 backdrop-blur-xl border-r border-neutral-800/60 flex flex-col h-full select-none z-30"
    >
      {/* Brand Header */}
      <div className="p-5 pb-4 flex items-center justify-between border-b border-neutral-900/60">
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => onSelectTab('home')}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 p-[1px] shadow-lg shadow-rose-950/40">
            <div className="w-full h-full bg-neutral-950 rounded-[11px] flex items-center justify-center">
              <Disc3 className="w-5 h-5 text-amber-400 animate-spin-slow group-hover:text-rose-400 transition-colors" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight text-white font-display">
                Sonora
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Hi-Res
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 font-medium">Lossless Audio Studio</p>
          </div>
        </div>

        <div
          title={isCloudSynced ? 'Cloud Synced across devices' : 'Syncing...'}
          className="flex items-center gap-1 px-2 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-[10px] text-neutral-400"
        >
          <Cloud className={`w-3 h-3 ${isCloudSynced ? 'text-emerald-400' : 'text-amber-400 animate-pulse'}`} />
          <span>Sync</span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-neutral-800">
        {/* Main Menu */}
        <div className="space-y-1">
          <button
            id="nav-home-btn"
            onClick={() => onSelectTab('home')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              currentTab === 'home'
                ? 'bg-neutral-800/80 text-white shadow-sm border border-neutral-700/50'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/50'
            }`}
          >
            <Home className={`w-4 h-4 ${currentTab === 'home' ? 'text-rose-400' : ''}`} />
            <span>Home</span>
          </button>

          <button
            id="nav-explore-btn"
            onClick={() => onSelectTab('explore')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              currentTab === 'explore'
                ? 'bg-neutral-800/80 text-white shadow-sm border border-neutral-700/50'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/50'
            }`}
          >
            <Compass className={`w-4 h-4 ${currentTab === 'explore' ? 'text-cyan-400' : ''}`} />
            <span>Explore & Charts</span>
          </button>

          <button
            id="nav-radio-dj-btn"
            onClick={() => onSelectTab('radio-dj')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              currentTab === 'radio-dj'
                ? 'bg-neutral-800/80 text-white shadow-sm border border-neutral-700/50'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/50'
            }`}
          >
            <Radio className={`w-4 h-4 ${currentTab === 'radio-dj' ? 'text-amber-400' : ''}`} />
            <div className="flex items-center justify-between flex-1">
              <span>Radio & Aura DJ</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                LIVE
              </span>
            </div>
          </button>

          <button
            id="nav-ai-discovery-btn"
            onClick={() => onSelectTab('ai-discovery')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              currentTab === 'ai-discovery'
                ? 'bg-gradient-to-r from-indigo-950/80 to-purple-950/80 text-white shadow-sm border border-indigo-500/30'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/50'
            }`}
          >
            <Sparkles className={`w-4 h-4 ${currentTab === 'ai-discovery' ? 'text-indigo-400' : 'text-indigo-400/80'}`} />
            <div className="flex items-center justify-between flex-1">
              <span>AI Genius Hub</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
                Gemini
              </span>
            </div>
          </button>
        </div>

        {/* Library Section */}
        <div>
          <p className="px-3 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">
            My Collection
          </p>
          <div className="space-y-1">
            <button
              id="nav-library-btn"
              onClick={() => onSelectTab('library')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                currentTab === 'library'
                  ? 'bg-neutral-800/80 text-white shadow-sm border border-neutral-700/50'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/50'
              }`}
            >
              <Library className={`w-4 h-4 ${currentTab === 'library' ? 'text-emerald-400' : ''}`} />
              <span>Library & Liked</span>
            </button>

            <button
              id="nav-offline-btn"
              onClick={() => onSelectTab('offline')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                currentTab === 'offline'
                  ? 'bg-neutral-800/80 text-white shadow-sm border border-neutral-700/50'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/50'
              }`}
            >
              <DownloadCloud className={`w-4 h-4 ${currentTab === 'offline' ? 'text-sky-400' : ''}`} />
              <div className="flex items-center justify-between flex-1">
                <span>Offline Vault</span>
                {offlineCount > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-mono">
                    {offlineCount}
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Playlists Section */}
        <div>
          <div className="flex items-center justify-between px-3 mb-2">
            <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
              Playlists
            </p>
            <button
              id="create-playlist-btn"
              onClick={onOpenCreatePlaylist}
              className="text-neutral-400 hover:text-white hover:bg-neutral-900 p-1 rounded-lg transition-colors"
              title="Create new playlist"
            >
              <PlusCircle className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1">
            {playlists.map((playlist) => {
              const isSelected = currentTab === 'playlist' && selectedPlaylistId === playlist.id;
              return (
                <button
                  key={playlist.id}
                  id={`playlist-nav-${playlist.id}`}
                  onClick={() => onSelectPlaylist(playlist.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-left truncate transition-all ${
                    isSelected
                      ? 'bg-neutral-800/90 text-white border border-neutral-700/60 font-semibold'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/40'
                  }`}
                >
                  <div className="w-5 h-5 rounded bg-neutral-800 flex items-center justify-center flex-shrink-0">
                    <Music className="w-3 h-3 text-neutral-400" />
                  </div>
                  <span className="truncate flex-1">{playlist.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Footer / Equalizer Trigger */}
      <div className="p-3 border-t border-neutral-900/80 bg-neutral-950/60 space-y-2">
        <button
          id="open-eq-sidebar-btn"
          onClick={onOpenEqualizer}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800/80 text-xs font-medium text-neutral-300 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <Sliders className="w-4 h-4 text-amber-400" />
            <span>10-Band EQ & DSP</span>
          </div>
          <span className="text-[10px] text-neutral-400 font-mono">192kHz</span>
        </button>

        {isOfflineMode && (
          <div className="px-3 py-2 rounded-xl bg-sky-950/40 border border-sky-800/30 flex items-center gap-2 text-[11px] text-sky-300">
            <DownloadCloud className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">Offline Mode Active</span>
          </div>
        )}
      </div>
    </aside>
  );
};
