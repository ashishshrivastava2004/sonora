import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Track,
  Playlist,
  Album,
  Artist,
  EqualizerConfig,
  ConnectedDevice,
  ViewTab,
  AIRecommendationMix,
} from './types';
import {
  INITIAL_TRACKS,
  INITIAL_PLAYLISTS,
  INITIAL_ALBUMS,
  INITIAL_ARTISTS,
  INITIAL_AI_RECOMMENDATIONS,
  DEFAULT_EQUALIZER,
} from './data/musicData';
import { audioEngine } from './services/audioEngine';
import { offlineStorage } from './services/offlineStorage';

// Components
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { PlayerBar } from './components/PlayerBar';
import { FullscreenPlayer } from './components/FullscreenPlayer';
import { EqualizerModal } from './components/EqualizerModal';
import { DeviceHandoffModal } from './components/DeviceHandoffModal';
import { QueueDrawer } from './components/QueueDrawer';
import { PlaylistModal } from './components/PlaylistModal';

// Views
import { HomeView } from './components/views/HomeView';
import { ExploreView } from './components/views/ExploreView';
import { LibraryView } from './components/views/LibraryView';
import { AIDiscoveryView } from './components/views/AIDiscoveryView';
import { OfflineView } from './components/views/OfflineView';
import { PlaylistDetailView } from './components/views/PlaylistDetailView';
import { AlbumDetailView } from './components/views/AlbumDetailView';
import { ArtistDetailView } from './components/views/ArtistDetailView';
import { SearchView } from './components/views/SearchView';

export default function App() {
  // Catalog State
  const [tracks, setTracks] = useState<Track[]>(INITIAL_TRACKS);
  const [playlists, setPlaylists] = useState<Playlist[]>(INITIAL_PLAYLISTS);
  const [albums, setAlbums] = useState<Album[]>(INITIAL_ALBUMS);
  const [artists, setArtists] = useState<Artist[]>(INITIAL_ARTISTS);
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendationMix[]>(
    INITIAL_AI_RECOMMENDATIONS
  );

  // Playback State
  const [currentTrack, setCurrentTrack] = useState<Track | null>(INITIAL_TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(INITIAL_TRACKS[0]?.duration || 180);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('all');
  const [isDJEnabled, setIsDJEnabled] = useState(false);
  const [isAutoplay, setIsAutoplay] = useState(true);

  // Queue & History
  const [queue, setQueue] = useState<Track[]>(INITIAL_TRACKS.slice(1));
  const [history, setHistory] = useState<Track[]>([]);

  // Navigation & View
  const [currentTab, setCurrentTab] = useState<ViewTab>('home');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [selectedArtistId, setSelectedArtistId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Panels
  const [isEqualizerOpen, setIsEqualizerOpen] = useState(false);
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isLyricsOpen, setIsLyricsOpen] = useState(false);

  // DSP & Audio Config
  const [equalizer, setEqualizer] = useState<EqualizerConfig>(DEFAULT_EQUALIZER);

  // Cloud Sync & Connected Devices
  const [devices, setDevices] = useState<ConnectedDevice[]>([]);
  const [activeDeviceId, setActiveDeviceId] = useState<string>('dev-web');
  const [isCloudSynced, setIsCloudSynced] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Offline Engine
  const [downloadedTracks, setDownloadedTracks] = useState<Track[]>([]);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [storageUsage, setStorageUsage] = useState({ used: 0, quota: 500 * 1024 * 1024 });

  // 1. Initial Cloud Catalog & Sync Fetch
  const fetchCloudCatalog = useCallback(async () => {
    try {
      const res = await fetch('/api/catalog');
      if (res.ok) {
        const data = await res.json();
        if (data.tracks?.length) setTracks(data.tracks);
        if (data.playlists?.length) setPlaylists(data.playlists);
        if (data.albums?.length) setAlbums(data.albums);
        if (data.artists?.length) setArtists(data.artists);
        if (data.aiRecommendations?.length) setAiRecommendations(data.aiRecommendations);
      }
    } catch (err) {
      console.warn('Using local seed catalog fallback:', err);
    }
  }, []);

  const fetchCloudState = useCallback(async () => {
    try {
      const res = await fetch('/api/sync/state');
      if (res.ok) {
        const data = await res.json();
        if (data.devices) setDevices(data.devices);
        if (data.activeDeviceId) setActiveDeviceId(data.activeDeviceId);
        setIsCloudSynced(true);
      }
    } catch (err) {
      console.warn('Sync server unreachable:', err);
    }
  }, []);

  // 2. Load Offline Tracks from IndexedDB
  const refreshOfflineState = useCallback(async () => {
    try {
      const offlineList = await offlineStorage.getAllTracks();
      setDownloadedTracks(offlineList);
      const usage = await offlineStorage.getStorageEstimate();
      setStorageUsage(usage);
    } catch (err) {
      console.error('Failed to load offline storage:', err);
    }
  }, []);

  useEffect(() => {
    fetchCloudCatalog();
    fetchCloudState();
    refreshOfflineState();
  }, [fetchCloudCatalog, fetchCloudState, refreshOfflineState]);

  // 3. Audio Engine Callbacks
  useEffect(() => {
    audioEngine.setOnTimeUpdate((time) => {
      setCurrentTime(time);
    });

    audioEngine.setOnTrackEnd(() => {
      handleNextTrack(true);
    });
  }, [queue, repeatMode, currentTrack, isDJEnabled, isAutoplay]);

  // 4. Playback Logic
  const handlePlayTrack = async (track: Track, newQueue?: Track[]) => {
    // If in offline mode and track is not downloaded, prompt user
    if (isOfflineMode && !downloadedTracks.some((t) => t.id === track.id)) {
      alert('This track is not available offline. Disable Offline Mode to stream from cloud.');
      return;
    }

    setCurrentTrack(track);
    setDuration(track.duration);
    setCurrentTime(0);

    if (newQueue) {
      const filteredQueue = newQueue.filter((t) => t.id !== track.id);
      setQueue(filteredQueue);
    }

    // Add previous track to history
    if (currentTrack && currentTrack.id !== track.id) {
      setHistory((prev) => [currentTrack, ...prev.slice(0, 19)]);
    }

    try {
      await audioEngine.playTrack(track);
      setIsPlaying(true);
    } catch (err) {
      console.error('Playback failed:', err);
    }
  };

  const handleTogglePlay = async () => {
    if (!currentTrack) {
      if (tracks.length > 0) {
        handlePlayTrack(tracks[0]);
      }
      return;
    }

    if (isPlaying) {
      audioEngine.pause();
      setIsPlaying(false);
    } else {
      await audioEngine.resume();
      setIsPlaying(true);
    }
  };

  const handleNextTrack = async (auto = false) => {
    if (repeatMode === 'one' && auto && currentTrack) {
      audioEngine.seek(0);
      setCurrentTime(0);
      await audioEngine.resume();
      setIsPlaying(true);
      return;
    }

    if (queue.length > 0) {
      let nextIndex = 0;
      if (isShuffled) {
        nextIndex = Math.floor(Math.random() * queue.length);
      }
      const nextSong = queue[nextIndex];
      const newQueue = queue.filter((_, i) => i !== nextIndex);
      setQueue(newQueue);
      handlePlayTrack(nextSong);
    } else if (isAutoplay && tracks.length > 0) {
      // Pick random similar song from catalog
      const available = tracks.filter((t) => t.id !== currentTrack?.id);
      const randomTrack = available[Math.floor(Math.random() * available.length)];
      if (randomTrack) {
        handlePlayTrack(randomTrack);
      }
    } else if (repeatMode === 'all' && tracks.length > 0) {
      handlePlayTrack(tracks[0], tracks);
    } else {
      setIsPlaying(false);
    }
  };

  const handlePreviousTrack = () => {
    if (currentTime > 4) {
      audioEngine.seek(0);
      setCurrentTime(0);
    } else if (history.length > 0) {
      const prevTrack = history[0];
      setHistory((prev) => prev.slice(1));
      if (currentTrack) {
        setQueue((q) => [currentTrack, ...q]);
      }
      handlePlayTrack(prevTrack);
    } else {
      audioEngine.seek(0);
      setCurrentTime(0);
    }
  };

  const handleSeek = (targetTime: number) => {
    audioEngine.seek(targetTime);
    setCurrentTime(targetTime);
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    audioEngine.setVolume(newVolume);
  };

  const handleToggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      audioEngine.setVolume(volume || 0.85);
    } else {
      setIsMuted(true);
      audioEngine.setVolume(0);
    }
  };

  const handleToggleShuffle = () => {
    setIsShuffled((prev) => !prev);
  };

  const handleToggleRepeat = () => {
    setRepeatMode((prev) => (prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off'));
  };

  const handleToggleDJ = () => {
    setIsDJEnabled((prev) => !prev);
  };

  // 5. Like / Favorite Handlers
  const handleToggleLike = async (trackId: string) => {
    setTracks((prev) =>
      prev.map((t) => (t.id === trackId ? { ...t, liked: !t.liked } : t))
    );
    if (currentTrack && currentTrack.id === trackId) {
      setCurrentTrack((prev) => (prev ? { ...prev, liked: !prev.liked } : null));
    }

    try {
      await fetch('/api/tracks/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackId }),
      });
    } catch (err) {
      console.warn('Could not sync like to cloud:', err);
    }
  };

  // 6. Offline Download Handlers
  const handleDownloadTrack = async (track: Track) => {
    const isAlready = downloadedTracks.some((t) => t.id === track.id);
    if (isAlready) {
      await offlineStorage.removeTrack(track.id);
      await refreshOfflineState();
    } else {
      await offlineStorage.saveTrack(track);
      await refreshOfflineState();
    }
  };

  const handleRemoveDownloadedTrack = async (trackId: string) => {
    await offlineStorage.removeTrack(trackId);
    await refreshOfflineState();
  };

  const handleClearOfflineStorage = async () => {
    if (confirm('Are you sure you want to clear all offline downloaded tracks?')) {
      await offlineStorage.clearAll();
      await refreshOfflineState();
    }
  };

  // 7. Equalizer Update Handler
  const handleUpdateEqualizer = (config: EqualizerConfig) => {
    setEqualizer(config);
    audioEngine.applyEqualizer(config);
  };

  // 8. Device Handoff Handler
  const handleTransferDevice = async (deviceId: string) => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/devices/handoff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId,
          currentTrackId: currentTrack?.id,
          currentTime,
          isPlaying,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setActiveDeviceId(deviceId);
        setDevices(data.devices || []);
      }
    } catch (err) {
      console.error('Device handoff failed:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // 9. Playlist Management Handlers
  const handleSavePlaylist = async (data: {
    title: string;
    description: string;
    coverUrl: string;
    trackIds: string[];
    isPublic: boolean;
    gradient: string;
  }) => {
    try {
      const res = await fetch('/api/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const newPl = await res.json();
        setPlaylists((prev) => [...prev, newPl]);
        setSelectedPlaylistId(newPl.id);
        setCurrentTab('playlist');
      }
    } catch (err) {
      // Offline fallback
      const fallbackPl: Playlist = {
        id: `pl-${Date.now()}`,
        ...data,
        createdBy: 'You',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setPlaylists((prev) => [...prev, fallbackPl]);
      setSelectedPlaylistId(fallbackPl.id);
      setCurrentTab('playlist');
    }
  };

  const handleDeletePlaylist = async (id: string) => {
    if (confirm('Delete this playlist from your library?')) {
      try {
        await fetch(`/api/playlists/${id}`, { method: 'DELETE' });
      } catch (err) {
        console.warn('Offline delete fallback');
      }
      setPlaylists((prev) => prev.filter((p) => p.id !== id));
      setCurrentTab('library');
    }
  };

  // 10. Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.key === 'ArrowRight' && e.shiftKey) {
        handleNextTrack();
      } else if (e.key === 'ArrowLeft' && e.shiftKey) {
        handlePreviousTrack();
      } else if (e.key === 'm' || e.key === 'M') {
        handleToggleMute();
      } else if (e.key === 'f' || e.key === 'F') {
        setIsFullscreenOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, currentTrack, queue, history, volume, isMuted]);

  // Derived Values
  const activeDevice = devices.find((d) => d.id === activeDeviceId) || null;
  const likedTracks = tracks.filter((t) => t.liked);
  const selectedPlaylist = playlists.find((p) => p.id === selectedPlaylistId) || null;
  const selectedAlbum = albums.find((a) => a.id === selectedAlbumId) || null;
  const selectedArtist = artists.find((art) => art.id === selectedArtistId) || null;
  const isDownloaded = currentTrack
    ? downloadedTracks.some((t) => t.id === currentTrack.id)
    : false;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-neutral-950 text-neutral-100 font-sans antialiased">
      {/* 1. Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          setSelectedPlaylistId(null);
          setSelectedAlbumId(null);
          setSelectedArtistId(null);
        }}
        playlists={playlists}
        selectedPlaylistId={selectedPlaylistId}
        onSelectPlaylist={(id) => {
          setSelectedPlaylistId(id);
          setCurrentTab('playlist');
        }}
        onOpenCreatePlaylist={() => {
          setEditingPlaylist(null);
          setIsPlaylistModalOpen(true);
        }}
        onOpenEqualizer={() => setIsEqualizerOpen(true)}
        isCloudSynced={isCloudSynced}
        isOfflineMode={isOfflineMode}
        offlineCount={downloadedTracks.length}
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Header */}
        <Header
          searchQuery={searchQuery}
          onSearchChange={(q) => setSearchQuery(q)}
          onOpenSearch={() => setCurrentTab('search')}
          onOpenDeviceModal={() => setIsDeviceModalOpen(true)}
          onOpenEqualizer={() => setIsEqualizerOpen(true)}
          activeDevice={activeDevice}
          isOfflineMode={isOfflineMode}
          onToggleOfflineMode={() => setIsOfflineMode((prev) => !prev)}
          isCloudSynced={isCloudSynced}
          onTriggerCloudSync={fetchCloudState}
        />

        {/* Scrollable View Container */}
        <main className="flex-1 overflow-y-auto pb-6 scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent">
          {currentTab === 'home' && (
            <HomeView
              tracks={tracks}
              albums={albums}
              artists={artists}
              playlists={playlists}
              aiRecommendations={aiRecommendations}
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              onPlayTrack={handlePlayTrack}
              onSelectAlbum={(id) => {
                setSelectedAlbumId(id);
                setCurrentTab('album');
              }}
              onSelectArtist={(id) => {
                setSelectedArtistId(id);
                setCurrentTab('artist');
              }}
              onSelectPlaylist={(id) => {
                setSelectedPlaylistId(id);
                setCurrentTab('playlist');
              }}
              onToggleLike={handleToggleLike}
              onOpenAIDiscovery={() => setCurrentTab('ai-discovery')}
            />
          )}

          {currentTab === 'explore' && (
            <ExploreView
              tracks={tracks}
              albums={albums}
              onPlayTrack={handlePlayTrack}
              onSelectAlbum={(id) => {
                setSelectedAlbumId(id);
                setCurrentTab('album');
              }}
              onFilterGenre={(genre) => {
                setSearchQuery(genre);
                setCurrentTab('search');
              }}
            />
          )}

          {currentTab === 'library' && (
            <LibraryView
              likedTracks={likedTracks}
              playlists={playlists}
              albums={albums}
              artists={artists}
              onPlayLiked={() => {
                if (likedTracks.length > 0) {
                  handlePlayTrack(likedTracks[0], likedTracks);
                }
              }}
              onSelectPlaylist={(id) => {
                setSelectedPlaylistId(id);
                setCurrentTab('playlist');
              }}
              onSelectAlbum={(id) => {
                setSelectedAlbumId(id);
                setCurrentTab('album');
              }}
              onSelectArtist={(id) => {
                setSelectedArtistId(id);
                setCurrentTab('artist');
              }}
              onOpenCreatePlaylist={() => {
                setEditingPlaylist(null);
                setIsPlaylistModalOpen(true);
              }}
            />
          )}

          {currentTab === 'ai-discovery' && (
            <AIDiscoveryView
              tracks={tracks}
              currentTrack={currentTrack}
              onPlayTrack={handlePlayTrack}
              onSaveNewPlaylist={handleSavePlaylist}
              isDJEnabled={isDJEnabled}
              onToggleDJ={handleToggleDJ}
            />
          )}

          {currentTab === 'radio-dj' && (
            <AIDiscoveryView
              tracks={tracks}
              currentTrack={currentTrack}
              onPlayTrack={handlePlayTrack}
              onSaveNewPlaylist={handleSavePlaylist}
              isDJEnabled={isDJEnabled}
              onToggleDJ={handleToggleDJ}
            />
          )}

          {currentTab === 'offline' && (
            <OfflineView
              downloadedTracks={downloadedTracks}
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              onPlayTrack={handlePlayTrack}
              onRemoveDownloadedTrack={handleRemoveDownloadedTrack}
              onClearOfflineStorage={handleClearOfflineStorage}
              storageUsage={storageUsage}
              isOfflineMode={isOfflineMode}
              onToggleOfflineMode={() => setIsOfflineMode((prev) => !prev)}
            />
          )}

          {currentTab === 'playlist' && selectedPlaylist && (
            <PlaylistDetailView
              playlist={selectedPlaylist}
              tracks={tracks.filter((t) => selectedPlaylist.trackIds.includes(t.id))}
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              onPlayTrack={handlePlayTrack}
              onPlayAll={(shuffle) => {
                const plTracks = tracks.filter((t) =>
                  selectedPlaylist.trackIds.includes(t.id)
                );
                if (plTracks.length > 0) {
                  const startTrack = shuffle
                    ? plTracks[Math.floor(Math.random() * plTracks.length)]
                    : plTracks[0];
                  handlePlayTrack(startTrack, plTracks);
                }
              }}
              onDownloadAll={async () => {
                const plTracks = tracks.filter((t) =>
                  selectedPlaylist.trackIds.includes(t.id)
                );
                for (const t of plTracks) {
                  await offlineStorage.saveTrack(t);
                }
                await refreshOfflineState();
                alert(`Downloaded all tracks in ${selectedPlaylist.title} for offline!`);
              }}
              onEditPlaylist={() => {
                setEditingPlaylist(selectedPlaylist);
                setIsPlaylistModalOpen(true);
              }}
              onDeletePlaylist={handleDeletePlaylist}
              onToggleLike={handleToggleLike}
              onDownloadTrack={handleDownloadTrack}
              downloadedIds={downloadedTracks.map((t) => t.id)}
            />
          )}

          {currentTab === 'album' && selectedAlbum && (
            <AlbumDetailView
              album={selectedAlbum}
              tracks={tracks.filter((t) => selectedAlbum.trackIds.includes(t.id))}
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              onPlayTrack={handlePlayTrack}
              onPlayAll={(shuffle) => {
                const albTracks = tracks.filter((t) =>
                  selectedAlbum.trackIds.includes(t.id)
                );
                if (albTracks.length > 0) {
                  const startTrack = shuffle
                    ? albTracks[Math.floor(Math.random() * albTracks.length)]
                    : albTracks[0];
                  handlePlayTrack(startTrack, albTracks);
                }
              }}
              onSelectArtist={(artistId) => {
                setSelectedArtistId(artistId);
                setCurrentTab('artist');
              }}
              onToggleLike={handleToggleLike}
            />
          )}

          {currentTab === 'artist' && selectedArtist && (
            <ArtistDetailView
              artist={selectedArtist}
              tracks={tracks.filter((t) => selectedArtist.trackIds.includes(t.id))}
              albums={albums.filter((a) => selectedArtist.albumIds.includes(a.id))}
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              onPlayTrack={handlePlayTrack}
              onSelectAlbum={(albumId) => {
                setSelectedAlbumId(albumId);
                setCurrentTab('album');
              }}
              onToggleLike={handleToggleLike}
            />
          )}

          {currentTab === 'search' && (
            <SearchView
              query={searchQuery}
              tracks={tracks}
              albums={albums}
              artists={artists}
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              onPlayTrack={handlePlayTrack}
              onSelectAlbum={(albumId) => {
                setSelectedAlbumId(albumId);
                setCurrentTab('album');
              }}
              onSelectArtist={(artistId) => {
                setSelectedArtistId(artistId);
                setCurrentTab('artist');
              }}
              onToggleLike={handleToggleLike}
            />
          )}
        </main>

        {/* 3. Bottom Player Bar */}
        <PlayerBar
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          volume={volume}
          isMuted={isMuted}
          isShuffled={isShuffled}
          repeatMode={repeatMode}
          isDJEnabled={isDJEnabled}
          isLyricsOpen={isLyricsOpen}
          isQueueOpen={isQueueOpen}
          isDownloaded={isDownloaded}
          onTogglePlay={handleTogglePlay}
          onPrevious={handlePreviousTrack}
          onNext={() => handleNextTrack(false)}
          onSeek={handleSeek}
          onVolumeChange={handleVolumeChange}
          onToggleMute={handleToggleMute}
          onToggleShuffle={handleToggleShuffle}
          onToggleRepeat={handleToggleRepeat}
          onToggleDJ={handleToggleDJ}
          onToggleLyrics={() => setIsLyricsOpen((prev) => !prev)}
          onToggleQueue={() => setIsQueueOpen((prev) => !prev)}
          onToggleLike={handleToggleLike}
          onDownloadTrack={handleDownloadTrack}
          onOpenFullscreen={() => setIsFullscreenOpen(true)}
          onOpenEqualizer={() => setIsEqualizerOpen(true)}
          onOpenDeviceModal={() => setIsDeviceModalOpen(true)}
        />
      </div>

      {/* Modals & Overlays */}
      {/* 4. Fullscreen Player */}
      <FullscreenPlayer
        isOpen={isFullscreenOpen}
        onClose={() => setIsFullscreenOpen(false)}
        track={currentTrack}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        isMuted={isMuted}
        isShuffled={isShuffled}
        repeatMode={repeatMode}
        isDJEnabled={isDJEnabled}
        isDownloaded={isDownloaded}
        onTogglePlay={handleTogglePlay}
        onPrevious={handlePreviousTrack}
        onNext={() => handleNextTrack(false)}
        onSeek={handleSeek}
        onVolumeChange={handleVolumeChange}
        onToggleMute={handleToggleMute}
        onToggleShuffle={handleToggleShuffle}
        onToggleRepeat={handleToggleRepeat}
        onToggleDJ={handleToggleDJ}
        onToggleLike={handleToggleLike}
        onDownloadTrack={handleDownloadTrack}
        onOpenEqualizer={() => setIsEqualizerOpen(true)}
      />

      {/* 5. 10-Band Graphic Equalizer */}
      <EqualizerModal
        isOpen={isEqualizerOpen}
        onClose={() => setIsEqualizerOpen(false)}
        equalizer={equalizer}
        onUpdateEqualizer={handleUpdateEqualizer}
        isPlaying={isPlaying}
        dominantColor={currentTrack?.color}
      />

      {/* 6. Device Handoff / AirPlay Modal */}
      <DeviceHandoffModal
        isOpen={isDeviceModalOpen}
        onClose={() => setIsDeviceModalOpen(false)}
        devices={devices}
        activeDeviceId={activeDeviceId}
        onTransferDevice={handleTransferDevice}
        isSyncing={isSyncing}
      />

      {/* 7. Up Next Queue Drawer */}
      <QueueDrawer
        isOpen={isQueueOpen}
        onClose={() => setIsQueueOpen(false)}
        currentTrack={currentTrack}
        queue={queue}
        history={history}
        onPlayTrack={handlePlayTrack}
        onRemoveFromQueue={(idx) => setQueue((prev) => prev.filter((_, i) => i !== idx))}
        onClearQueue={() => setQueue([])}
        isAutoplay={isAutoplay}
        onToggleAutoplay={() => setIsAutoplay((prev) => !prev)}
      />

      {/* 8. Playlist Modal */}
      <PlaylistModal
        isOpen={isPlaylistModalOpen}
        onClose={() => {
          setIsPlaylistModalOpen(false);
          setEditingPlaylist(null);
        }}
        onSavePlaylist={handleSavePlaylist}
        availableTracks={tracks}
        editingPlaylist={editingPlaylist}
      />
    </div>
  );
}
