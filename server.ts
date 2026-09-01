import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import CryptoJS from 'crypto-js';
import { INITIAL_TRACKS, INITIAL_ALBUMS, INITIAL_ARTISTS, INITIAL_PLAYLISTS, INITIAL_DEVICES, DEFAULT_EQUALIZER } from './src/data/musicData';
import { Track, Playlist, ConnectedDevice, CloudSyncPayload } from './src/types';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-Memory Cloud Store
let tracksStore: Track[] = [...INITIAL_TRACKS];
let playlistsStore: Playlist[] = [...INITIAL_PLAYLISTS];
let devicesStore: ConnectedDevice[] = [...INITIAL_DEVICES];
let cloudSyncState: CloudSyncPayload = {
  lastSynced: new Date().toISOString(),
  activeDeviceId: 'device-web-current',
  likedTrackIds: ['track-1', 'track-2', 'track-4', 'track-6', 'track-8', 'track-10', 'track-11'],
  customPlaylists: playlistsStore,
  recentlyPlayedTrackIds: ['track-1', 'track-3', 'track-5'],
  equalizer: DEFAULT_EQUALIZER,
};

// ----------------------------------------------------
// MUSIC-API (JIOSAAVN / STREAMING / MUSICBRAINZ UTILS)
// ----------------------------------------------------

/**
 * Decrypts encrypted media URLs from the Music-API / JioSaavn engine
 * Key: '38346591' using DES-ECB
 */
function decryptMediaUrl(encryptedUrl: string): string | null {
  try {
    if (!encryptedUrl) return null;
    const key = CryptoJS.enc.Utf8.parse('38346591');
    const decrypted = CryptoJS.DES.decrypt(
      encryptedUrl,
      key,
      { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 }
    );
    const raw = decrypted.toString(CryptoJS.enc.Utf8);
    if (!raw) return null;
    return raw.replace(/_96\./, '_320.').replace(/_160\./, '_320.');
  } catch (e) {
    return null;
  }
}

/**
 * Formats song payload into Sonora Track model
 */
function formatSongToTrack(s: any): Track {
  const encUrl = s.more_info?.encrypted_media_url || s.encrypted_media_url;
  const decryptedUrl = encUrl ? decryptMediaUrl(encUrl) : null;
  const mediaUrl = decryptedUrl || s.media_url || (s.downloadUrl ? (Array.isArray(s.downloadUrl) ? s.downloadUrl[s.downloadUrl.length - 1]?.url : s.downloadUrl) : undefined);

  const durationSec = parseInt(s.more_info?.duration || s.duration || '210', 10) || 210;
  let cover = s.image || s.more_info?.image || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800';
  if (Array.isArray(cover)) {
    cover = cover[cover.length - 1]?.url || cover[0]?.url || cover;
  }
  if (typeof cover === 'string') {
    cover = cover.replace(/150x150/, '500x500').replace(/50x50/, '500x500');
  }

  const artistName = s.more_info?.artistMap?.primary_artists?.[0]?.name 
    || s.more_info?.singers 
    || s.subtitle 
    || s.artist 
    || (Array.isArray(s.artists?.primary) ? s.artists.primary.map((a: any) => a.name).join(', ') : 'Unknown Artist');

  const cleanTitle = (s.title || s.song || s.name || 'Untitled')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/<[^>]*>?/gm, '');

  const albumName = (s.more_info?.album || s.album?.name || s.album || cleanTitle)
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/<[^>]*>?/gm, '');

  const colors = ['#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6', '#10b981', '#06b6d4', '#f43f5e'];
  const color = colors[Math.abs(cleanTitle.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % colors.length];

  return {
    id: `music-api-${s.id || Math.random().toString(36).substring(2, 9)}`,
    title: cleanTitle,
    artist: String(artistName).replace(/&amp;/g, '&').replace(/&#039;/g, "'").replace(/<[^>]*>?/gm, ''),
    artistId: `art-${s.more_info?.artistMap?.primary_artists?.[0]?.id || 'api'}`,
    album: albumName,
    albumId: `alb-${s.more_info?.album_id || 'api'}`,
    coverUrl: cover,
    duration: durationSec,
    genre: s.language ? `${s.language.charAt(0).toUpperCase() + s.language.slice(1)} Global` : 'Pop / Global',
    year: parseInt(s.year || s.more_info?.release_date?.substring(0, 4) || '2024', 10) || 2024,
    audioQuality: s.more_info?.['320kbps'] === 'true' || s.more_info?.is_dolby_content ? 'HI_RES_LOSSLESS' : 'LOSSLESS',
    audioUrl: mediaUrl || undefined,
    source: 'music-api',
    formatInfo: {
      sampleRate: '96 kHz',
      bitDepth: '24-bit',
      bitrate: s.more_info?.['320kbps'] === 'true' ? '320 kbps Master (Hi-Res)' : '256 kbps ALAC Lossless',
      format: 'AAC / ALAC Studio Master',
    },
    lyrics: [
      { time: 0, text: `♪ ${cleanTitle} ♪` },
      { time: 6, text: `Artist: ${artistName}` },
      { time: 14, text: 'Streaming live master audio via Sonora API' },
      { time: 24, text: 'Lossless bit-perfect playback' },
    ],
    tempo: 124,
    key: 'C Major',
    energy: 0.85,
    danceability: 0.78,
    mood: ['Energetic', 'Studio Master', 'Atmospheric'],
    audioTheme: 'electronic',
    notesDescription: 'Live high-fidelity audio stream fetched directly via the Music API engine.',
    spatialSupport: true,
    plays: parseInt(s.play_count || '245000', 10) || 245000,
    liked: false,
    color,
  };
}

// Initialize Gemini Client
let geminiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI {
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

// ----------------------------------------------------
// REST API ROUTES
// ----------------------------------------------------

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Catalog Endpoints
app.get('/api/tracks', (req, res) => {
  res.json(tracksStore);
});

app.get('/api/albums', (req, res) => {
  res.json(INITIAL_ALBUMS);
});

app.get('/api/artists', (req, res) => {
  res.json(INITIAL_ARTISTS);
});

app.get('/api/playlists', (req, res) => {
  res.json(playlistsStore);
});

app.post('/api/playlists', (req, res) => {
  const { title, description, coverUrl, trackIds, isPublic, gradient } = req.body;
  const newPlaylist: Playlist = {
    id: `playlist-${Date.now()}`,
    title: title || 'New Playlist',
    description: description || 'Created by you on Sonora',
    coverUrl: coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop',
    createdBy: 'You',
    trackIds: Array.isArray(trackIds) ? trackIds : [],
    createdAt: new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString().split('T')[0],
    isPublic: !!isPublic,
    isPinned: false,
    gradient: gradient || 'from-indigo-900 via-neutral-900 to-black',
  };

  playlistsStore.unshift(newPlaylist);
  cloudSyncState.customPlaylists = playlistsStore;
  cloudSyncState.lastSynced = new Date().toISOString();

  res.status(201).json(newPlaylist);
});

app.put('/api/playlists/:id', (req, res) => {
  const { id } = req.params;
  const index = playlistsStore.findIndex((p) => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Playlist not found' });
  }

  playlistsStore[index] = {
    ...playlistsStore[index],
    ...req.body,
    updatedAt: new Date().toISOString().split('T')[0],
  };

  cloudSyncState.customPlaylists = playlistsStore;
  cloudSyncState.lastSynced = new Date().toISOString();

  res.json(playlistsStore[index]);
});

app.delete('/api/playlists/:id', (req, res) => {
  const { id } = req.params;
  playlistsStore = playlistsStore.filter((p) => p.id !== id);
  cloudSyncState.customPlaylists = playlistsStore;
  cloudSyncState.lastSynced = new Date().toISOString();
  res.json({ success: true, id });
});

app.post('/api/tracks/:id/like', (req, res) => {
  const { id } = req.params;
  const track = tracksStore.find((t) => t.id === id);
  if (!track) {
    return res.status(404).json({ error: 'Track not found' });
  }

  track.liked = !track.liked;
  if (track.liked) {
    if (!cloudSyncState.likedTrackIds.includes(id)) {
      cloudSyncState.likedTrackIds.push(id);
    }
  } else {
    cloudSyncState.likedTrackIds = cloudSyncState.likedTrackIds.filter((tId) => tId !== id);
  }
  cloudSyncState.lastSynced = new Date().toISOString();

  res.json({ id: track.id, liked: track.liked });
});

// ----------------------------------------------------
// MUSIC-API & MUSICBRAINZ ENDPOINTS
// ----------------------------------------------------

/**
 * Search songs, albums, and artists via Music-API (JioSaavn engine)
 */
app.get('/api/music-api/search', async (req, res) => {
  try {
    const q = String(req.query.q || '').trim();
    const limit = Math.min(parseInt(String(req.query.limit || '15'), 10) || 15, 30);

    if (!q) {
      return res.json({ songs: [], total: 0 });
    }

    const saavnUrl = `https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&_marker=0&api_version=4&ctx=web6dot0&n=${limit}&p=1&q=${encodeURIComponent(q)}`;

    const saavnRes = await fetch(saavnUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        Accept: 'application/json',
      },
    });

    if (!saavnRes.ok) {
      throw new Error(`Music-API upstream error: ${saavnRes.statusText}`);
    }

    const data = await saavnRes.json();
    const rawResults = data.results || [];
    const songs: Track[] = rawResults.map(formatSongToTrack);

    res.json({
      query: q,
      total: data.total || songs.length,
      songs,
    });
  } catch (error: any) {
    console.error('Music-API search error:', error);
    // Fallback: search internal catalog
    const q = String(req.query.q || '').toLowerCase();
    const matched = tracksStore.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        t.album.toLowerCase().includes(q)
    );
    res.json({ query: q, total: matched.length, songs: matched, fallback: true });
  }
});

/**
 * Get trending global and master tracks via Music-API
 */
app.get('/api/music-api/trending', async (req, res) => {
  try {
    const queries = ['Top Global Hits', 'Trending Today', 'Billboard Hot 100'];
    const randomQuery = queries[Math.floor(Math.random() * queries.length)];
    const saavnUrl = `https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&_marker=0&api_version=4&ctx=web6dot0&n=12&p=1&q=${encodeURIComponent(randomQuery)}`;

    const saavnRes = await fetch(saavnUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
    });

    if (saavnRes.ok) {
      const data = await saavnRes.json();
      const rawResults = data.results || [];
      const songs: Track[] = rawResults.map(formatSongToTrack);
      if (songs.length > 0) {
        return res.json({ trending: songs });
      }
    }

    res.json({ trending: tracksStore.slice(0, 8) });
  } catch (err) {
    console.error('Trending fetch error:', err);
    res.json({ trending: tracksStore.slice(0, 8) });
  }
});

/**
 * Get individual song details by Saavn ID
 */
app.get('/api/music-api/song/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const saavnId = id.replace(/^music-api-/, '');
    const songUrl = `https://www.jiosaavn.com/api.php?__call=song.getDetails&_format=json&_marker=0&api_version=4&ctx=web6dot0&pids=${encodeURIComponent(saavnId)}`;

    const response = await fetch(songUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });

    if (response.ok) {
      const data = await response.json();
      const songData = data[saavnId] || data.songs?.[0];
      if (songData) {
        const track = formatSongToTrack(songData);
        return res.json(track);
      }
    }

    const localTrack = tracksStore.find((t) => t.id === id);
    if (localTrack) return res.json(localTrack);
    res.status(404).json({ error: 'Song not found' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * High-performance audio streaming reverse proxy
 * Forwards Range headers and audio bytes cleanly to allow byte-range seeking and playback
 */
app.get('/api/music-api/stream', async (req, res) => {
  try {
    const streamUrl = String(req.query.url || '');
    if (!streamUrl || (!streamUrl.startsWith('http://') && !streamUrl.startsWith('https://'))) {
      return res.status(400).json({ error: 'Valid audio stream URL is required' });
    }

    const headers: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    };

    if (req.headers.range) {
      headers['Range'] = req.headers.range;
    }

    const upstream = await fetch(streamUrl, { headers });

    res.status(upstream.status);
    upstream.headers.forEach((value, name) => {
      const lower = name.toLowerCase();
      if (
        lower === 'content-type' ||
        lower === 'content-length' ||
        lower === 'content-range' ||
        lower === 'accept-ranges'
      ) {
        res.setHeader(name, value);
      }
    });

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=3600');

    if (!upstream.body) {
      return res.end();
    }

    // Convert web ReadableStream to node readable
    const { Readable } = await import('stream');
    const nodeStream = Readable.fromWeb(upstream.body as any);
    nodeStream.pipe(res);
  } catch (err: any) {
    console.error('Audio stream proxy error:', err);
    if (!res.headersSent) {
      res.status(502).json({ error: 'Failed to proxy audio stream' });
    }
  }
});

/**
 * MusicBrainz API Metadata & Recording Lookup
 * Documentation: https://musicbrainz.org/doc/MusicBrainz_API
 */
app.get('/api/musicbrainz/recording', async (req, res) => {
  try {
    const query = String(req.query.query || '').trim();
    if (!query) {
      return res.json({ recordings: [] });
    }

    const mbUrl = `https://musicbrainz.org/ws/2/recording?query=${encodeURIComponent(query)}&fmt=json&limit=5`;
    const response = await fetch(mbUrl, {
      headers: {
        'User-Agent': 'SonoraMusicStudio/1.0.0 ( contact@sonoramusic.internal )',
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'MusicBrainz API rate limit or error' });
    }

    const data = await response.json();
    const recordings = (data.recordings || []).map((r: any) => ({
      id: r.id,
      title: r.title,
      artist: r['artist-credit']?.map((a: any) => a.name).join(', ') || 'Unknown',
      releases: (r.releases || []).map((rel: any) => ({
        id: rel.id,
        title: rel.title,
        date: rel.date,
        country: rel.country,
        trackCount: rel['track-count'],
      })),
      isrcs: r.isrcs || [],
      tags: (r.tags || []).map((t: any) => t.name),
      disambiguation: r.disambiguation,
    }));

    res.json({ query, recordings });
  } catch (err: any) {
    console.error('MusicBrainz error:', err);
    res.json({ recordings: [], error: err.message });
  }
});

// Connected Devices & Handoff
app.get('/api/devices', (req, res) => {
  res.json(devicesStore);
});

app.post('/api/devices/transfer', (req, res) => {
  const { deviceId } = req.body;
  const targetDevice = devicesStore.find((d) => d.id === deviceId);
  if (!targetDevice) {
    return res.status(404).json({ error: 'Device not found' });
  }

  devicesStore = devicesStore.map((d) => ({
    ...d,
    isActive: d.id === deviceId,
    lastActive: d.id === deviceId ? 'Active now' : 'Just now',
  }));

  cloudSyncState.activeDeviceId = deviceId;
  cloudSyncState.lastSynced = new Date().toISOString();

  res.json({
    success: true,
    activeDevice: targetDevice,
    devices: devicesStore,
    message: `Playback seamlessly transferred to ${targetDevice.name}`,
  });
});

// Cloud Sync endpoints
app.get('/api/cloud-sync', (req, res) => {
  res.json(cloudSyncState);
});

app.post('/api/cloud-sync', (req, res) => {
  const { likedTrackIds, customPlaylists, equalizer, recentlyPlayedTrackIds, activeDeviceId } = req.body;

  if (Array.isArray(likedTrackIds)) cloudSyncState.likedTrackIds = likedTrackIds;
  if (Array.isArray(customPlaylists)) {
    cloudSyncState.customPlaylists = customPlaylists;
    playlistsStore = customPlaylists;
  }
  if (equalizer) cloudSyncState.equalizer = equalizer;
  if (Array.isArray(recentlyPlayedTrackIds)) cloudSyncState.recentlyPlayedTrackIds = recentlyPlayedTrackIds;
  if (activeDeviceId) cloudSyncState.activeDeviceId = activeDeviceId;

  cloudSyncState.lastSynced = new Date().toISOString();

  res.json({
    success: true,
    lastSynced: cloudSyncState.lastSynced,
    state: cloudSyncState,
  });
});

// ----------------------------------------------------
// GEMINI AI ENDPOINTS
// ----------------------------------------------------

/**
 * AI Personalized Recommendations
 */
app.post('/api/gemini/recommendations', async (req, res) => {
  try {
    const { listeningHistory, favoriteGenres, currentMood } = req.body;
    const ai = getGemini();

    const catalogSummary = tracksStore.map((t) => ({
      id: t.id,
      title: t.title,
      artist: t.artist,
      genre: t.genre,
      mood: t.mood,
      audioTheme: t.audioTheme,
      tempo: t.tempo,
    }));

    const prompt = `You are the lead AI music curator for Sonora, a high-fidelity streaming platform like Apple Music.
Given the user's current mood "${currentMood || 'Focus & Relax'}", preferred genres: "${favoriteGenres?.join(', ') || 'Synthwave, Lo-Fi, Ambient'}", and listening history track IDs: "${listeningHistory?.join(', ') || 'track-1, track-3'}", analyze which tracks from our catalog best match their vibe and create 3 personalized discovery mixes.

Here is the available catalog:
${JSON.stringify(catalogSummary)}

Return a JSON array of 3 recommendation mixes with the following schema:
- title: catchy editorial playlist title (e.g. "Neon Velocity & Cyber Flow", "Serene Acoustic Reflections")
- tagline: short poetic description explaining the sound vibe
- reason: specific AI explanation of why this was curated for the listener
- vibe: 2-3 word vibe label
- trackIds: array of 3-5 track IDs matching the theme from the catalog
- coverGradient: Tailwind gradient string (e.g. "from-indigo-900 via-purple-900 to-black")`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              tagline: { type: Type.STRING },
              reason: { type: Type.STRING },
              vibe: { type: Type.STRING },
              trackIds: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              coverGradient: { type: Type.STRING },
            },
            required: ['title', 'tagline', 'reason', 'vibe', 'trackIds', 'coverGradient'],
          },
        },
      },
    });

    const parsed = JSON.parse(response.text || '[]');
    const formatted = parsed.map((item: any, idx: number) => ({
      id: `ai-mix-${Date.now()}-${idx}`,
      ...item,
    }));

    res.json(formatted);
  } catch (error: any) {
    console.error('Gemini recommendations error:', error);
    // Fallback if API key not available or rate limit
    res.json([
      {
        id: `ai-mix-fallback-1`,
        title: 'Sonora Adaptive Deep Focus',
        tagline: 'High-bitrate synthesized soundscapes tailored to keep your mental state in flow.',
        reason: 'Selected based on your affinity for atmospheric synths and rhythmic lo-fi tempos.',
        vibe: 'Focus & Electronic',
        trackIds: ['track-1', 'track-3', 'track-8', 'track-10'],
        coverGradient: 'from-cyan-900 via-indigo-900 to-slate-950',
      },
      {
        id: `ai-mix-fallback-2`,
        title: 'Golden Sunset Acoustic Lounge',
        tagline: 'Warm analog tape textures, velvety vocals, and intimate strings.',
        reason: 'Curated for late afternoon relaxation and mindful unwinding.',
        vibe: 'Organic & Warm',
        trackIds: ['track-2', 'track-6', 'track-11', 'track-7'],
        coverGradient: 'from-amber-800 via-rose-900 to-stone-950',
      },
    ]);
  }
});

/**
 * AI Radio DJ Commentary Voice Intro
 */
app.post('/api/gemini/dj-commentary', async (req, res) => {
  try {
    const { currentTrackTitle, artistName, timeOfDay, userVibe, currentGenre } = req.body;
    const ai = getGemini();

    const prompt = `You are "Aura", the charismatic, ultra-knowledgeable host of Sonora Radio (similar to Apple Music 1 DJ).
The current time is ${timeOfDay || 'evening'}. The listener's current vibe is "${userVibe || 'Chill'}" and they are about to hear "${currentTrackTitle}" by ${artistName} (${currentGenre || 'Music'}).

Write a short, engaging, 2-3 sentence DJ radio host voice introduction that feels alive, smooth, and authentic. Highlight a cool detail about the audio fidelity, mood, or artist.

Return JSON with:
- title: DJ intro title (e.g. "Aura DJ Live • Late Night Sessions")
- text: The spoken script
- mood: e.g. "Warm & Energetic" or "Nocturnal & Smooth"
- hostName: "Aura DJ"`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            text: { type: Type.STRING },
            mood: { type: Type.STRING },
            hostName: { type: Type.STRING },
          },
          required: ['title', 'text', 'mood', 'hostName'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({
      id: `dj-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ...parsed,
    });
  } catch (error: any) {
    console.error('DJ commentary error:', error);
    res.json({
      id: `dj-${Date.now()}`,
      title: 'Aura DJ Live • Studio Master Broadcast',
      text: `Welcome back to Sonora. Next up we're spinning "${req.body.currentTrackTitle || 'this track'}" by ${req.body.artistName || 'the artist'} in pure uncompressed fidelity. Sit back and enjoy the soundscape.`,
      mood: 'Smooth & Warm',
      hostName: 'Aura DJ',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  }
});

/**
 * AI Natural Language Playlist Generator
 */
app.post('/api/gemini/generate-playlist', async (req, res) => {
  try {
    const { prompt: userPrompt } = req.body;
    const ai = getGemini();

    const catalogSummary = tracksStore.map((t) => ({
      id: t.id,
      title: t.title,
      artist: t.artist,
      genre: t.genre,
      mood: t.mood,
      audioTheme: t.audioTheme,
    }));

    const prompt = `You are Sonora's AI Playlist Architect.
The user requested: "${userPrompt}"

Select 4-7 relevant track IDs from the catalog below that best fulfill this prompt, and craft a gorgeous title, description, and color gradient.

Catalog:
${JSON.stringify(catalogSummary)}

Return JSON with:
- title: evocative playlist title
- description: description explaining the sonic curation
- trackIds: array of matching track IDs
- tags: array of 3-4 genre/mood tags
- gradient: Tailwind gradient (e.g. "from-fuchsia-900 via-purple-900 to-black")
- coverUrl: a fitting high quality Unsplash music image URL`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            trackIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            gradient: { type: Type.STRING },
            coverUrl: { type: Type.STRING },
          },
          required: ['title', 'description', 'trackIds', 'tags', 'gradient'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    const newPlaylist: Playlist = {
      id: `ai-playlist-${Date.now()}`,
      title: parsed.title || 'AI Generated Mix',
      description: parsed.description || `Curated for: "${userPrompt}"`,
      coverUrl: parsed.coverUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop',
      createdBy: 'Sonora AI Genius',
      trackIds: parsed.trackIds?.length ? parsed.trackIds : ['track-1', 'track-3', 'track-8'],
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      isPublic: true,
      tags: parsed.tags || ['AI Curated', 'Custom Mix'],
      gradient: parsed.gradient || 'from-violet-900 via-indigo-950 to-black',
    };

    playlistsStore.unshift(newPlaylist);
    cloudSyncState.customPlaylists = playlistsStore;
    cloudSyncState.lastSynced = new Date().toISOString();

    res.status(201).json(newPlaylist);
  } catch (error: any) {
    console.error('AI Playlist generation error:', error);
    const fallbackPlaylist: Playlist = {
      id: `ai-playlist-${Date.now()}`,
      title: `${req.body.prompt || 'Custom'} Sonic Journey`,
      description: `Curated mix matching your prompt: "${req.body.prompt}"`,
      coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop',
      createdBy: 'Sonora AI Genius',
      trackIds: ['track-1', 'track-2', 'track-4', 'track-10'],
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      isPublic: true,
      tags: ['AI Curated', 'Discovery'],
      gradient: 'from-blue-900 via-indigo-950 to-black',
    };
    playlistsStore.unshift(fallbackPlaylist);
    res.status(201).json(fallbackPlaylist);
  }
});

/**
 * AI Lyrics & Song Insights Deep Dive
 */
app.post('/api/gemini/lyrics-insights', async (req, res) => {
  try {
    const { trackTitle, artistName, lyrics, genre } = req.body;
    const ai = getGemini();

    const prompt = `Analyze this song for a high-end music streaming app (Sonora):
Track: "${trackTitle}" by ${artistName}
Genre: ${genre}
Lyrics:
${JSON.stringify(lyrics)}

Provide:
- poeticMeaning: A brief 2-sentence poetic breakdown of the emotional core and philosophy of the track
- keyThemes: Array of 3-4 key lyrical themes (e.g. "Escape & Freedom", "Nocturnal Longing")
- audioMasterNote: A note on how the instrumentation and Hi-Res audio mastering enhances the lyrical storytelling
- triviaFact: An interesting artistic fact or studio recording insight`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            poeticMeaning: { type: Type.STRING },
            keyThemes: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            audioMasterNote: { type: Type.STRING },
            triviaFact: { type: Type.STRING },
          },
          required: ['poeticMeaning', 'keyThemes', 'audioMasterNote', 'triviaFact'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Lyrics insight error:', error);
    res.json({
      poeticMeaning: `"${req.body.trackTitle}" explores the intersection of human longing and atmospheric space, contrasting intimate inner feelings with wide cinematic soundscapes.`,
      keyThemes: ['Immersion', 'Transcendence', 'Nocturnal Voyage'],
      audioMasterNote: 'Mastered in high-resolution 24-bit audio to capture micro-dynamics, vocal breath, and sub-bass resonance without compression artifacts.',
      triviaFact: 'The producers blended analog tube gear with modern binaural 3D panners for realistic spatial depth.',
    });
  }
});

// ----------------------------------------------------
// VITE MIDDLEWARE & SERVER STARTUP
// ----------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Sonora Music Server running on http://localhost:${PORT}`);
  });
}

startServer();
