import React, { useState, useEffect } from 'react';
import { Search, Music, Disc3, User, Play, Heart, Clock, Globe, Sparkles, Radio, Loader2, Info, ExternalLink } from 'lucide-react';
import { Track, Album, Artist } from '../../types';
import { formatTime } from '../../utils/formatters';

interface SearchViewProps {
  query: string;
  tracks: Track[];
  albums: Album[];
  artists: Artist[];
  currentTrack: Track | null;
  isPlaying: boolean;
  onPlayTrack: (track: Track, queueList?: Track[]) => void;
  onSelectAlbum: (albumId: string) => void;
  onSelectArtist: (artistId: string) => void;
  onToggleLike: (trackId: string) => void;
}

export const SearchView: React.FC<SearchViewProps> = ({
  query,
  tracks,
  albums,
  artists,
  currentTrack,
  isPlaying,
  onPlayTrack,
  onSelectAlbum,
  onSelectArtist,
  onToggleLike,
}) => {
  const [qualityFilter, setQualityFilter] = useState<string>('ALL');
  const [sourceFilter, setSourceFilter] = useState<'ALL' | 'MUSIC_API' | 'STUDIO'>('ALL');
  const [apiResults, setApiResults] = useState<Track[]>([]);
  const [isLoadingApi, setIsLoadingApi] = useState<boolean>(false);
  const [trendingPicks, setTrendingPicks] = useState<Track[]>([]);
  const [selectedMbTrack, setSelectedMbTrack] = useState<{ track: Track; mbData: any } | null>(null);
  const [isLoadingMb, setIsLoadingMb] = useState<boolean>(false);

  const q = (query || '').toLowerCase().trim();

  // Fetch live Music-API results when query changes
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setApiResults([]);
      setIsLoadingApi(false);
      return;
    }

    const timeout = setTimeout(async () => {
      setIsLoadingApi(true);
      try {
        const res = await fetch(`/api/music-api/search?q=${encodeURIComponent(query)}&limit=20`);
        if (res.ok) {
          const data = await res.json();
          setApiResults(data.songs || []);
        }
      } catch (err) {
        console.warn('Live search error:', err);
      } finally {
        setIsLoadingApi(false);
      }
    }, 350);

    return () => clearTimeout(timeout);
  }, [query]);

  // Fetch trending picks on mount
  useEffect(() => {
    fetch('/api/music-api/trending')
      .then((r) => r.json())
      .then((d) => {
        if (d.trending?.length) {
          setTrendingPicks(d.trending);
        }
      })
      .catch(() => {});
  }, []);

  // Filter local catalog
  const filteredLocalTracks = (tracks || []).filter((t) => {
    if (!t) return false;
    const matchesQuery =
      !q ||
      (t.title && t.title.toLowerCase().includes(q)) ||
      (t.artist && t.artist.toLowerCase().includes(q)) ||
      (t.album && t.album.toLowerCase().includes(q)) ||
      (t.genre && t.genre.toLowerCase().includes(q)) ||
      (Array.isArray(t.lyrics) && t.lyrics.some((l) => l?.text && l.text.toLowerCase().includes(q)));

    const matchesQuality =
      qualityFilter === 'ALL' || t.audioQuality === qualityFilter;

    return Boolean(matchesQuery && matchesQuality);
  });

  // Combine results based on source filter
  let combinedTracks: Track[] = [];
  if (sourceFilter === 'MUSIC_API') {
    combinedTracks = apiResults;
  } else if (sourceFilter === 'STUDIO') {
    combinedTracks = filteredLocalTracks;
  } else {
    // If we have API results, display them primarily along with local matches
    const apiIds = new Set(apiResults.map((t) => t.id));
    combinedTracks = [...apiResults, ...filteredLocalTracks.filter((t) => !apiIds.has(t.id))];
  }

  // If query is empty and no search yet, show trending picks
  const displayTracks = query ? combinedTracks : (trendingPicks.length ? trendingPicks : filteredLocalTracks);

  const filteredAlbums = (albums || []).filter((a) => {
    if (!a) return false;
    return (
      !q ||
      (a.title && a.title.toLowerCase().includes(q)) ||
      (a.artist && a.artist.toLowerCase().includes(q)) ||
      (a.genre && a.genre.toLowerCase().includes(q))
    );
  });

  const filteredArtists = (artists || []).filter((art) => {
    if (!art) return false;
    return (
      !q ||
      (art.name && art.name.toLowerCase().includes(q)) ||
      (art.genre && art.genre.toLowerCase().includes(q))
    );
  });

  // Lookup MusicBrainz recording metadata
  const handleInspectMusicBrainz = async (track: Track, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoadingMb(true);
    try {
      const res = await fetch(`/api/musicbrainz/recording?query=${encodeURIComponent(`${track.title} ${track.artist}`)}`);
      const data = await res.json();
      setSelectedMbTrack({ track, mbData: data.recordings?.[0] || null });
    } catch (err) {
      console.warn('MB fetch error:', err);
      setSelectedMbTrack({ track, mbData: null });
    } finally {
      setIsLoadingMb(false);
    }
  };

  return (
    <div id="sonora-search-view" className="p-8 space-y-8 max-w-7xl mx-auto animate-fade-in select-none">
      {/* Search Header */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-1 uppercase tracking-wider">
              <Globe className="w-3.5 h-3.5" />
              <span>Music-API Live Streaming & Audio Search</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">
              {query ? `Results for "${query}"` : 'Search & Stream Millions of Songs'}
            </h1>
          </div>

          {/* Quick Source Switcher */}
          <div className="flex items-center gap-1 bg-neutral-900/80 p-1 rounded-xl border border-neutral-800 self-start">
            <button
              onClick={() => setSourceFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                sourceFilter === 'ALL'
                  ? 'bg-amber-500 text-neutral-950 font-bold shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              All Sources
            </button>
            <button
              onClick={() => setSourceFilter('MUSIC_API')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                sourceFilter === 'MUSIC_API'
                  ? 'bg-amber-500 text-neutral-950 font-bold shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Radio className="w-3 h-3 text-amber-500" />
              Music-API (320k)
            </button>
            <button
              onClick={() => setSourceFilter('STUDIO')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                sourceFilter === 'STUDIO'
                  ? 'bg-amber-500 text-neutral-950 font-bold shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Studio Vault
            </button>
          </div>
        </div>

        {/* Quality Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {[
            { id: 'ALL', label: 'All Formats' },
            { id: 'HI_RES_LOSSLESS', label: '320kbps Master & Hi-Res' },
            { id: 'DOLBY_ATMOS', label: 'Dolby Atmos 3D' },
            { id: 'LOSSLESS', label: 'ALAC Lossless' },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setQualityFilter(pill.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                qualityFilter === pill.id
                  ? 'bg-neutral-200 text-neutral-950 font-bold shadow-sm'
                  : 'bg-neutral-900/60 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              {pill.label}
            </button>
          ))}

          {isLoadingApi && (
            <div className="flex items-center gap-2 text-xs text-amber-400 font-mono pl-3 animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Fetching 320kbps streams from Music-API...</span>
            </div>
          )}
        </div>
      </div>

      {/* Suggested Hot Search Keywords when no query */}
      {!query && (
        <div className="space-y-2">
          <p className="text-xs font-mono text-neutral-400 uppercase">Popular Live Searches</p>
          <div className="flex flex-wrap gap-2">
            {['The Weeknd', 'Daft Punk', 'Taylor Swift', 'Billie Eilish', 'Coldplay', 'Arijit Singh', 'Dua Lipa', 'Kendrick Lamar', 'Synthwave Hits'].map((artist) => (
              <button
                key={artist}
                onClick={() => {
                  const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
                  if (searchInput) {
                    searchInput.value = artist;
                    searchInput.dispatchEvent(new Event('input', { bubbles: true }));
                  }
                }}
                className="px-3 py-1 rounded-lg text-xs bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-amber-400 border border-neutral-800 transition-colors"
              >
                {artist}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Songs Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>{query ? `Songs (${displayTracks.length})` : 'Trending & Global Hits'}</span>
            {!query && <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">Live Stream Ready</span>}
          </h3>
          <span className="text-xs text-neutral-400 font-mono">
            Powered by Music-API Engine & WebAudio DSP
          </span>
        </div>

        {displayTracks.length === 0 && !isLoadingApi ? (
          <div className="p-12 text-center text-neutral-400 bg-neutral-900/30 rounded-2xl border border-neutral-800">
            <Search className="w-8 h-8 mx-auto text-neutral-600 mb-2" />
            <p>No songs found matching your search query.</p>
          </div>
        ) : (
          <div className="rounded-2xl bg-neutral-900/40 border border-neutral-800 overflow-hidden divide-y divide-neutral-800/60">
            {displayTracks.map((track, i) => {
              const isCurrent = currentTrack?.id === track.id;
              return (
                <div
                  key={track.id}
                  onClick={() => onPlayTrack(track, displayTracks)}
                  className={`p-3.5 px-5 flex items-center justify-between gap-4 hover:bg-neutral-800/60 transition-colors group cursor-pointer ${
                    isCurrent ? 'bg-neutral-800/80 border-l-2 border-l-amber-500' : ''
                  }`}
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <span className="w-6 text-center text-xs font-mono text-neutral-400">
                      {isCurrent && isPlaying ? (
                        <div className="flex items-end justify-center gap-0.5 h-3">
                          <div className="w-0.5 bg-amber-400 h-full animate-bounce" />
                          <div className="w-0.5 bg-amber-400 h-2/3 animate-bounce" style={{ animationDelay: '0.15s' }} />
                          <div className="w-0.5 bg-amber-400 h-1/2 animate-bounce" style={{ animationDelay: '0.3s' }} />
                        </div>
                      ) : (
                        i + 1
                      )}
                    </span>
                    <img
                      src={track.coverUrl}
                      alt={track.title}
                      className="w-11 h-11 rounded-lg object-cover flex-shrink-0 shadow-md group-hover:scale-105 transition-transform"
                      loading="lazy"
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
                        {track.audioUrl && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex-shrink-0">
                            320k Stream
                          </span>
                        )}
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-400 flex-shrink-0 hidden sm:inline-block">
                          {track.audioQuality.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 truncate">{track.artist}</p>
                    </div>
                  </div>

                  <div className="hidden md:block w-1/4 text-xs text-neutral-400 truncate">
                    {track.album}
                  </div>

                  <div className="flex items-center gap-3">
                    {/* MusicBrainz Metadata Inspection Button */}
                    <button
                      title="Inspect MusicBrainz Metadata & Credits"
                      onClick={(e) => handleInspectMusicBrainz(track, e)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-cyan-400 hover:bg-neutral-800 transition-colors"
                    >
                      <Info className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleLike(track.id);
                      }}
                      className="text-neutral-400 hover:text-rose-400 transition-colors p-1"
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${track.liked ? 'fill-rose-500 text-rose-500' : ''}`}
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
        )}
      </div>

      {/* MusicBrainz Metadata Modal Drawer */}
      {selectedMbTrack && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-scale-in">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={selectedMbTrack.track.coverUrl}
                  alt={selectedMbTrack.track.title}
                  className="w-14 h-14 rounded-xl object-cover"
                />
                <div>
                  <h4 className="text-base font-bold text-white">{selectedMbTrack.track.title}</h4>
                  <p className="text-xs text-neutral-400">{selectedMbTrack.track.artist}</p>
                  <span className="text-[10px] font-mono text-cyan-400">MusicBrainz Encyclopedia Verified</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedMbTrack(null)}
                className="text-neutral-400 hover:text-white text-xs px-2.5 py-1 rounded-lg bg-neutral-800"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 bg-neutral-950 p-4 rounded-xl border border-neutral-800/80 text-xs">
              <div className="flex justify-between border-b border-neutral-800 pb-2">
                <span className="text-neutral-400">Streaming Engine:</span>
                <span className="font-mono text-amber-400">mohd-baquir-qureshi / music-api (320kbps)</span>
              </div>
              <div className="flex justify-between border-b border-neutral-800 pb-2">
                <span className="text-neutral-400">Audio Master Quality:</span>
                <span className="font-mono text-emerald-400">{selectedMbTrack.track.formatInfo.bitrate}</span>
              </div>
              {selectedMbTrack.mbData ? (
                <>
                  <div className="flex justify-between border-b border-neutral-800 pb-2">
                    <span className="text-neutral-400">MusicBrainz ID:</span>
                    <span className="font-mono text-neutral-300 truncate max-w-[200px]">{selectedMbTrack.mbData.id}</span>
                  </div>
                  {selectedMbTrack.mbData.releases?.[0] && (
                    <div className="flex justify-between border-b border-neutral-800 pb-2">
                      <span className="text-neutral-400">Release Date & Country:</span>
                      <span className="text-neutral-300">
                        {selectedMbTrack.mbData.releases[0].date || 'N/A'} ({selectedMbTrack.mbData.releases[0].country || 'Global'})
                      </span>
                    </div>
                  )}
                  {selectedMbTrack.mbData.tags?.length > 0 && (
                    <div className="space-y-1 pt-1">
                      <span className="text-neutral-400 block">Acoustic Tags & Genres:</span>
                      <div className="flex flex-wrap gap-1">
                        {selectedMbTrack.mbData.tags.map((t: string) => (
                          <span key={t} className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/50 text-[10px]">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-neutral-400 text-[11px] py-1">
                  Metadata retrieved from live stream manifest and studio headers.
                </p>
              )}
            </div>

            <button
              onClick={() => {
                onPlayTrack(selectedMbTrack.track, displayTracks);
                setSelectedMbTrack(null);
              }}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition-colors flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              Play in Studio Master Fidelity
            </button>
          </div>
        </div>
      )}

      {/* Artists & Albums Results */}
      {filteredArtists.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">Artists</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {filteredArtists.map((art) => (
              <div
                key={art.id}
                onClick={() => onSelectArtist(art.id)}
                className="p-3 text-center rounded-2xl bg-neutral-900/40 hover:bg-neutral-800/60 border border-neutral-800 cursor-pointer transition-all hover:-translate-y-1 space-y-2 group"
              >
                <img
                  src={art.avatarUrl}
                  alt={art.name}
                  className="w-16 h-16 mx-auto rounded-full object-cover shadow"
                />
                <h5 className="font-bold text-xs text-white truncate group-hover:text-amber-400">
                  {art.name}
                </h5>
              </div>
            ))}
          </div>
        </div>
      )}

      {filteredAlbums.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">Albums</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {filteredAlbums.map((alb) => (
              <div
                key={alb.id}
                onClick={() => onSelectAlbum(alb.id)}
                className="p-3 rounded-2xl bg-neutral-900/40 hover:bg-neutral-800/60 border border-neutral-800 cursor-pointer transition-all hover:-translate-y-1 space-y-2 group"
              >
                <img
                  src={alb.coverUrl}
                  alt={alb.title}
                  className="w-full aspect-square rounded-xl object-cover"
                />
                <h5 className="font-bold text-xs text-white truncate group-hover:text-amber-400">
                  {alb.title}
                </h5>
                <p className="text-[11px] text-neutral-400 truncate">{alb.artist}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
