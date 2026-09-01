import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, Mic2, BookOpen, RefreshCw, Music2, Quote } from 'lucide-react';
import { Track, LyricLine } from '../types';

interface SyncedLyricsViewProps {
  track: Track;
  currentTime: number;
  onSeekToLyric: (time: number) => void;
  dominantColor?: string;
}

export const SyncedLyricsView: React.FC<SyncedLyricsViewProps> = ({
  track,
  currentTime,
  onSeekToLyric,
  dominantColor = '#6366f1',
}) => {
  const [activeTab, setActiveTab] = useState<'lyrics' | 'insights'>('lyrics');
  const [insights, setInsights] = useState<{
    poeticMeaning?: string;
    keyThemes?: string[];
    audioMasterNote?: string;
    triviaFact?: string;
  } | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);

  const activeLyricRef = useRef<HTMLParagraphElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Determine current active lyric index
  let activeIndex = -1;
  for (let i = 0; i < track.lyrics.length; i++) {
    if (currentTime >= track.lyrics[i].time) {
      activeIndex = i;
    } else {
      break;
    }
  }

  // Smooth auto-scroll lyrics into view
  useEffect(() => {
    if (activeLyricRef.current && containerRef.current && activeTab === 'lyrics') {
      activeLyricRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeIndex, activeTab]);

  // Fetch AI Insights for the song
  const fetchInsights = async () => {
    setIsLoadingInsights(true);
    try {
      const res = await fetch('/api/gemini/lyrics-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackTitle: track.title,
          artistName: track.artist,
          lyrics: track.lyrics,
          genre: track.genre,
        }),
      });
      const data = await res.json();
      setInsights(data);
    } catch (err) {
      console.error('Failed to load insights:', err);
    } finally {
      setIsLoadingInsights(false);
    }
  };

  useEffect(() => {
    setInsights(null);
    if (activeTab === 'insights') {
      fetchInsights();
    }
  }, [track.id, activeTab]);

  return (
    <div
      id="sonora-synced-lyrics"
      className="h-full flex flex-col overflow-hidden relative select-none"
    >
      {/* Top Tabs */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800/80 bg-neutral-950/40 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <button
            id="tab-lyrics-btn"
            onClick={() => setActiveTab('lyrics')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'lyrics'
                ? 'bg-white text-neutral-950 shadow-md'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
            }`}
          >
            <Mic2 className="w-3.5 h-3.5" />
            <span>Time-Synced Lyrics</span>
          </button>

          <button
            id="tab-insights-btn"
            onClick={() => setActiveTab('insights')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'insights'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI Song Insights</span>
          </button>
        </div>

        <span className="text-[11px] font-mono text-neutral-400">
          {track.title} • {track.formatInfo.sampleRate}
        </span>
      </div>

      {/* Content Body */}
      {activeTab === 'lyrics' ? (
        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto px-8 py-16 space-y-7 scroll-smooth scrollbar-none"
        >
          {track.lyrics.map((line, idx) => {
            const isActive = idx === activeIndex;
            const isPast = idx < activeIndex;

            return (
              <p
                key={idx}
                ref={isActive ? activeLyricRef : null}
                onClick={() => onSeekToLyric(line.time)}
                className={`cursor-pointer transition-all duration-300 transform ${
                  isActive
                    ? 'text-3xl md:text-4xl font-extrabold text-white scale-105 origin-left'
                    : isPast
                    ? 'text-2xl md:text-3xl font-semibold text-neutral-400 hover:text-neutral-200'
                    : 'text-2xl md:text-3xl font-semibold text-neutral-400 hover:text-neutral-200'
                } ${line.isChorus ? 'italic' : ''}`}
                style={{
                  textShadow: isActive
                    ? `0 0 35px ${dominantColor}88, 0 0 10px rgba(255,255,255,0.4)`
                    : 'none',
                }}
              >
                {line.text}
              </p>
            );
          })}
        </div>
      ) : (
        /* AI Insights Tab */
        <div className="flex-1 overflow-y-auto p-8 space-y-6 max-w-3xl mx-auto">
          {isLoadingInsights ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-neutral-400">
              <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
              <p className="text-sm">Analyzing song poetry, mastering notes & themes...</p>
            </div>
          ) : insights ? (
            <div className="space-y-6 animate-fade-in">
              {/* Meaning Card */}
              <div className="p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 shadow-xl space-y-3">
                <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                  <Quote className="w-4 h-4" />
                  <span>Poetic Essence & Meaning</span>
                </div>
                <p className="text-base text-neutral-200 leading-relaxed font-serif">
                  {insights.poeticMeaning}
                </p>
              </div>

              {/* Key Themes */}
              <div className="p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-3">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  <span>Lyrical Themes</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {insights.keyThemes?.map((theme, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-full bg-neutral-800 text-neutral-200 text-xs font-medium border border-neutral-700"
                    >
                      {theme}
                    </span>
                  ))}
                </div>
              </div>

              {/* Master Note & Trivia */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-2">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    Hi-Res Audio Mastering Note
                  </span>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    {insights.audioMasterNote}
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-2">
                  <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                    Studio & Artistic Trivia
                  </span>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    {insights.triviaFact}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-neutral-400">
              <button
                onClick={fetchInsights}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-950 transition-colors"
              >
                Generate AI Insights for {track.title}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
