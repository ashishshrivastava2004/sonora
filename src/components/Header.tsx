import React, { useState } from 'react';
import {
  Search,
  Cast,
  Cloud,
  Wifi,
  WifiOff,
  Sliders,
  Sparkles,
  User,
  Check,
  Laptop,
  Smartphone,
  Speaker,
  Volume2,
} from 'lucide-react';
import { ConnectedDevice } from '../types';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenSearch: () => void;
  onOpenDeviceModal: () => void;
  onOpenEqualizer: () => void;
  activeDevice: ConnectedDevice | null;
  isOfflineMode: boolean;
  onToggleOfflineMode: () => void;
  isCloudSynced: boolean;
  onTriggerCloudSync: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  onOpenSearch,
  onOpenDeviceModal,
  onOpenEqualizer,
  activeDevice,
  isOfflineMode,
  onToggleOfflineMode,
  isCloudSynced,
  onTriggerCloudSync,
}) => {
  const getDeviceIcon = (type?: string) => {
    switch (type) {
      case 'mobile':
        return <Smartphone className="w-3.5 h-3.5" />;
      case 'speaker':
        return <Speaker className="w-3.5 h-3.5" />;
      default:
        return <Laptop className="w-3.5 h-3.5" />;
    }
  };

  return (
    <header
      id="sonora-header"
      className="h-16 px-6 bg-neutral-950/70 backdrop-blur-xl border-b border-neutral-900/60 flex items-center justify-between gap-4 sticky top-0 z-20"
    >
      {/* Search Bar */}
      <div className="flex-1 max-w-md relative">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 pointer-events-none" />
          <input
            id="global-search-input"
            type="text"
            placeholder="Search songs, artists, albums, or lyrics..."
            value={searchQuery}
            onChange={(e) => {
              onSearchChange(e.target.value);
              if (e.target.value.trim().length > 0) {
                onOpenSearch();
              }
            }}
            onFocus={() => {
              if (searchQuery.trim().length > 0) onOpenSearch();
            }}
            className="w-full pl-10 pr-4 py-2 bg-neutral-900/90 hover:bg-neutral-900 border border-neutral-800/80 focus:border-amber-500/50 rounded-full text-sm text-neutral-200 placeholder-neutral-400 focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Offline Mode Toggle Button */}
        <button
          id="toggle-offline-mode-btn"
          onClick={onToggleOfflineMode}
          title={isOfflineMode ? 'Disable Offline Mode' : 'Enable Offline Only Mode'}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
            isOfflineMode
              ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 shadow-sm shadow-sky-950/50'
              : 'bg-neutral-900/80 text-neutral-400 border-neutral-800 hover:text-neutral-200'
          }`}
        >
          {isOfflineMode ? <WifiOff className="w-3.5 h-3.5 text-sky-400" /> : <Wifi className="w-3.5 h-3.5" />}
          <span>{isOfflineMode ? 'Offline Mode' : 'Online'}</span>
        </button>

        {/* Device Handoff / AirPlay Button */}
        <button
          id="open-device-handoff-btn"
          onClick={onOpenDeviceModal}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-800 text-xs font-medium text-neutral-300 transition-all group"
        >
          <Cast className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
          <div className="flex items-center gap-1.5">
            {getDeviceIcon(activeDevice?.type)}
            <span className="max-w-[130px] truncate">{activeDevice ? activeDevice.name : 'AirPlay / Devices'}</span>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </button>

        {/* Cloud Sync Manual Trigger */}
        <button
          id="trigger-cloud-sync-btn"
          onClick={onTriggerCloudSync}
          title="Force Cloud Synchronization"
          className="p-2 rounded-full bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white transition-colors"
        >
          <Cloud className={`w-4 h-4 ${isCloudSynced ? 'text-emerald-400' : 'text-amber-400 animate-spin'}`} />
        </button>

        {/* Equalizer Quick Button */}
        <button
          id="header-eq-btn"
          onClick={onOpenEqualizer}
          title="Open Audio Equalizer"
          className="p-2 rounded-full bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-amber-400 transition-colors"
        >
          <Sliders className="w-4 h-4" />
        </button>

        {/* User Profile Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-neutral-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 p-[1.5px] cursor-pointer">
            <div className="w-full h-full rounded-full bg-neutral-950 flex items-center justify-center text-xs font-bold text-amber-300">
              S
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
