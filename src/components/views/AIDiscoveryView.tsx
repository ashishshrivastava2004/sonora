import React, { useState } from 'react';
import {
  Sparkles,
  Radio,
  Wand2,
  Play,
  Flame,
  Layers,
  Music,
  RefreshCw,
  Sliders,
  Volume2,
  Check,
  Disc3,
} from 'lucide-react';
import { Track, Playlist } from '../../types';

interface AIDiscoveryViewProps {
  tracks: Track[];
  currentTrack: Track | null;
  onPlayTrack: (track: Track, queueList?: Track[]) => void;
  onSaveNewPlaylist: (playlist: {
    title: string;
    description: string;
    coverUrl: string;
    trackIds: string[];
    isPublic: boolean;
    gradient: string;
  }) => Promise<void>;
  isDJEnabled: boolean;
  onToggleDJ: () => void;
}

export const AIDiscoveryView: React.FC<AIDiscoveryViewProps> = ({
  tracks,
  currentTrack,
  onPlayTrack,
  onSaveNewPlaylist,
  isDJEnabled,
  onToggleDJ,
}) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<{
    title: string;
    description: string;
    vibe: string;
    tracks: Track[];
  } | null>(null);

  const [djTone, setDjTone] = useState<'chill' | 'audiophile' | 'energetic'>('chill');
  const [djCommentary, setDjCommentary] = useState<string | null>(null);
  const [isLoadingDJ, setIsLoadingDJ] = useState(false);

  // Prompt suggestions
  const PROMPT_SUGGESTIONS = [
    'Deep coding session at 2 AM with dark cyberpunk basslines',
    'Warm acoustic guitar sunset drive along the Pacific Coast',
    'Audiophile high-frequency spatial master mix with crisp acoustics',
    'Midnight meditation and binaural ambient soundscapes',
  ];

  const handleGeneratePlaylist = async (userPrompt: string) => {
    if (!userPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const res = await fetch('/api/gemini/generate-playlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userPrompt }),
      });
      const data = await res.json();
      setGeneratedResult(data);
    } catch (err) {
      console.error('Failed to generate playlist:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFetchDJCommentary = async () => {
    if (!currentTrack) return;
    setIsLoadingDJ(true);
    try {
      const res = await fetch('/api/gemini/dj-commentary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentTrack,
          nextTrack: tracks[1],
          timeOfDay: 'late-night',
          mood: djTone,
        }),
      });
      const data = await res.json();
      setDjCommentary(data.commentary);
    } catch (err) {
      console.error('Failed to get DJ commentary:', err);
    } finally {
      setIsLoadingDJ(false);
    }
  };

  const handleSaveToLibrary = async () => {
    if (!generatedResult) return;
    await onSaveNewPlaylist({
      title: generatedResult.title,
      description: generatedResult.description,
      coverUrl:
        generatedResult.tracks[0]?.coverUrl ||
        'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop',
      trackIds: generatedResult.tracks.map((t) => t.id),
      isPublic: true,
      gradient: 'from-indigo-950 via-purple-950 to-neutral-950',
    });
    alert(`Playlist "${generatedResult.title}" saved to your Library!`);
  };

  return (
    <div id="sonora-ai-discovery-view" className="p-8 space-y-10 max-w-6xl mx-auto animate-fade-in select-none">
      {/* Header Billboard */}
      <div className="relative rounded-3xl overflow-hidden p-8 md:p-10 border border-indigo-500/30 bg-gradient-to-r from-indigo-950 via-neutral-900 to-purple-950 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>Gemini 2.5 Music Engine</span>
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight font-display">
            Aura AI Music Intelligence
          </h1>
          <p className="text-sm text-neutral-300 leading-relaxed">
            Generate custom soundscapes with natural language, hear live intelligent radio host commentary, and harmonize your sonic signature in real time.
          </p>
        </div>
      </div>

      {/* 1. Prompt to Playlist Generator */}
      <section className="p-6 md:p-8 rounded-3xl bg-neutral-900/60 border border-neutral-800 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center shadow-lg">
            <Wand2 className="w-5 h-5 text-neutral-950" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Prompt-to-Playlist Creator</h2>
            <p className="text-xs text-neutral-400">
              Describe any mood, scenario, tempo, or imagery to conjure a tracklist
            </p>
          </div>
        </div>

        {/* Search input */}
        <div className="space-y-3">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="e.g. Synthwave drive through neo-Tokyo neon rain..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleGeneratePlaylist(prompt);
              }}
              className="flex-1 px-5 py-3.5 bg-neutral-950 border border-neutral-700/80 rounded-2xl text-sm text-white focus:border-indigo-500 focus:outline-none placeholder-neutral-500 shadow-inner"
            />
            <button
              onClick={() => handleGeneratePlaylist(prompt)}
              disabled={isGenerating || !prompt.trim()}
              className="px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-sm shadow-xl shadow-indigo-950 flex items-center gap-2 transition-all"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Generate Mix</span>
                </>
              )}
            </button>
          </div>

          {/* Prompt chips */}
          <div className="flex flex-wrap gap-2 pt-1">
            {PROMPT_SUGGESTIONS.map((sug, i) => (
              <button
                key={i}
                onClick={() => {
                  setPrompt(sug);
                  handleGeneratePlaylist(sug);
                }}
                className="text-xs px-3 py-1.5 rounded-xl bg-neutral-800/80 hover:bg-neutral-800 text-neutral-300 border border-neutral-700/60 transition-colors"
              >
                {sug}
              </button>
            ))}
          </div>
        </div>

        {/* Result Area */}
        {generatedResult && (
          <div className="p-6 rounded-2xl bg-neutral-950/80 border border-indigo-500/30 space-y-4 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
              <div>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                  {generatedResult.vibe}
                </span>
                <h3 className="text-xl font-bold text-white mt-1">{generatedResult.title}</h3>
                <p className="text-xs text-neutral-400 mt-0.5">{generatedResult.description}</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => onPlayTrack(generatedResult.tracks[0], generatedResult.tracks)}
                  className="px-4 py-2 rounded-xl bg-white text-neutral-950 font-bold text-xs flex items-center gap-2 hover:scale-105 transition-transform"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Play All</span>
                </button>

                <button
                  onClick={handleSaveToLibrary}
                  className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold border border-neutral-700 transition-colors"
                >
                  Save Playlist
                </button>
              </div>
            </div>

            {/* Generated tracks list */}
            <div className="space-y-2">
              {generatedResult.tracks.map((trk, i) => (
                <div
                  key={trk.id}
                  onClick={() => onPlayTrack(trk, generatedResult.tracks)}
                  className="p-2.5 rounded-xl hover:bg-neutral-800/60 flex items-center justify-between cursor-pointer group transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="w-5 text-center text-xs font-mono text-neutral-400">
                      {i + 1}
                    </span>
                    <img
                      src={trk.coverUrl}
                      alt={trk.title}
                      className="w-9 h-9 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-white group-hover:text-amber-400 truncate">
                        {trk.title}
                      </p>
                      <p className="text-[11px] text-neutral-400 truncate">{trk.artist}</p>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-900 text-neutral-400">
                    {trk.genre}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 2. Aura AI Radio DJ Commentary Studio */}
      <section className="p-6 md:p-8 rounded-3xl bg-neutral-900/60 border border-neutral-800 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <Radio className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Aura AI DJ Live Host Studio</h2>
              <p className="text-xs text-neutral-400">
                Personalized intelligent speech transitions between songs
              </p>
            </div>
          </div>

          <button
            onClick={onToggleDJ}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
              isDJEnabled
                ? 'bg-amber-500 text-neutral-950 border-amber-400 shadow-md shadow-amber-950'
                : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-750'
            }`}
          >
            {isDJEnabled ? 'DJ Voice Active' : 'Enable DJ Broadcast'}
          </button>
        </div>

        {/* Tone Selection & Trigger */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Host Persona:
            </span>
            {(['chill', 'audiophile', 'energetic'] as const).map((tone) => (
              <button
                key={tone}
                onClick={() => setDjTone(tone)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-all ${
                  djTone === tone
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'bg-neutral-950 text-neutral-400 border border-neutral-800'
                }`}
              >
                {tone === 'chill'
                  ? '🌙 Late Night Chill'
                  : tone === 'audiophile'
                  ? '🎧 Hi-Fi Purist'
                  : '⚡ High Energy'}
              </button>
            ))}

            <button
              onClick={handleFetchDJCommentary}
              disabled={isLoadingDJ || !currentTrack}
              className="ml-auto px-4 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-white flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {isLoadingDJ ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span>Sample DJ Host Voice</span>
            </button>
          </div>

          {/* DJ Speech box */}
          {djCommentary && (
            <div className="p-5 rounded-2xl bg-neutral-950/80 border border-amber-500/30 space-y-2 animate-fade-in">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                <Volume2 className="w-4 h-4" />
                <span>On-Air DJ Host Audio Track</span>
              </div>
              <p className="text-sm text-neutral-200 italic font-serif leading-relaxed">
                "{djCommentary}"
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
