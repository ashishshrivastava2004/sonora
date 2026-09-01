export type AudioQualityType = 'HI_RES_LOSSLESS' | 'LOSSLESS' | 'DOLBY_ATMOS' | 'HIGH_QUALITY';

export interface LyricLine {
  time: number; // in seconds
  text: string;
  translation?: string;
  isChorus?: boolean;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  album: string;
  albumId: string;
  coverUrl: string;
  duration: number; // in seconds
  genre: string;
  year: number;
  audioQuality: AudioQualityType;
  audioUrl?: string; // Real 320kbps streaming audio URL from music-api / Saavn CDN
  musicbrainzId?: string;
  source?: 'music-api' | 'local' | 'curated';
  formatInfo: {
    sampleRate: string; // e.g. "192 kHz" or "96 kHz"
    bitDepth: string; // e.g. "24-bit"
    bitrate: string; // e.g. "9216 kbps ALAC" or "320 kbps AAC"
    format: string; // e.g. "ALAC Lossless" or "AAC 320k Master"
  };
  lyrics: LyricLine[];
  tempo: number; // BPM
  key: string;
  energy: number; // 0 - 1
  danceability: number; // 0 - 1
  mood: string[];
  audioTheme: 'synthwave' | 'ambient' | 'lofi' | 'classical' | 'electronic' | 'acoustic' | 'rnb' | 'rock' | 'cinematic' | 'jazz';
  notesDescription?: string;
  spatialSupport: boolean;
  plays: number;
  liked?: boolean;
  color?: string; // Dominant hex color for gradient blur
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  createdBy: string;
  trackIds: string[];
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  isPinned?: boolean;
  tags?: string[];
  gradient?: string;
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  coverUrl: string;
  releaseDate: string;
  genre: string;
  trackIds: string[];
  audioQuality: AudioQualityType;
  description: string;
  gradient?: string;
}

export interface Artist {
  id: string;
  name: string;
  avatar: string;
  headerImg: string;
  bio: string;
  monthlyListeners: number;
  genres: string[];
  popularTrackIds: string[];
  albumIds: string[];
  verified: boolean;
}

export interface EQBand {
  freq: number;
  gain: number; // -12dB to +12dB
  label: string;
}

export interface EqualizerConfig {
  enabled: boolean;
  preset: string;
  bands: EQBand[];
  bassBoost: number; // 0 to 100
  spatialAudio: boolean;
  spatialSpread: number; // 0 to 100
  crossfadeSec: number; // 0 to 12
  preamp: number; // -12 to +12
}

export interface ConnectedDevice {
  id: string;
  name: string;
  type: 'desktop' | 'mobile' | 'speaker' | 'tablet' | 'car';
  isActive: boolean;
  lastActive: string;
  battery?: number;
  volume: number;
}

export interface CloudSyncPayload {
  lastSynced: string;
  activeDeviceId: string;
  likedTrackIds: string[];
  customPlaylists: Playlist[];
  recentlyPlayedTrackIds: string[];
  equalizer: EqualizerConfig;
}

export interface OfflineTrackRecord {
  id: string;
  track: Track;
  downloadedAt: string;
  sizeBytes: number;
  cachedAudioBlob?: string; // synthetic audio profile or base64
}

export interface DJCommentary {
  id: string;
  title: string;
  text: string;
  mood: string;
  hostName: string;
  timestamp: string;
}

export interface AIRecommendationMix {
  id: string;
  title: string;
  tagline: string;
  reason: string;
  trackIds: string[];
  vibe: string;
  coverGradient: string;
}

export type ViewTab = 
  | 'home'
  | 'explore'
  | 'library'
  | 'playlist'
  | 'album'
  | 'artist'
  | 'search'
  | 'radio-dj'
  | 'ai-discovery'
  | 'offline'
  | 'settings';
