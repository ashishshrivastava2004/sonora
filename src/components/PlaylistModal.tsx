import React, { useState } from 'react';
import { X, Music, Sparkles, Check } from 'lucide-react';
import { Track, Playlist } from '../types';

interface PlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePlaylist: (data: {
    title: string;
    description: string;
    coverUrl: string;
    trackIds: string[];
    isPublic: boolean;
    gradient: string;
  }) => Promise<void>;
  availableTracks: Track[];
  editingPlaylist?: Playlist | null;
}

const GRADIENTS = [
  'from-indigo-900 via-purple-900 to-black',
  'from-rose-950 via-pink-950 to-black',
  'from-cyan-950 via-slate-900 to-black',
  'from-emerald-950 via-teal-950 to-black',
  'from-amber-950 via-orange-950 to-black',
  'from-violet-900 via-indigo-950 to-neutral-950',
];

export const PlaylistModal: React.FC<PlaylistModalProps> = ({
  isOpen,
  onClose,
  onSavePlaylist,
  availableTracks,
  editingPlaylist,
}) => {
  const [title, setTitle] = useState(editingPlaylist?.title || '');
  const [description, setDescription] = useState(editingPlaylist?.description || '');
  const [coverUrl, setCoverUrl] = useState(
    editingPlaylist?.coverUrl ||
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop'
  );
  const [selectedTrackIds, setSelectedTrackIds] = useState<string[]>(
    editingPlaylist?.trackIds || ['track-1', 'track-2']
  );
  const [isPublic, setIsPublic] = useState(editingPlaylist?.isPublic ?? true);
  const [selectedGradient, setSelectedGradient] = useState(
    editingPlaylist?.gradient || GRADIENTS[0]
  );
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const toggleTrack = (id: string) => {
    setSelectedTrackIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setIsSaving(true);
    try {
      await onSavePlaylist({
        title: title.trim(),
        description: description.trim(),
        coverUrl,
        trackIds: selectedTrackIds,
        isPublic,
        gradient: selectedGradient,
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div
        id="sonora-playlist-modal"
        className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center">
              <Music className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {editingPlaylist ? 'Edit Playlist' : 'Create New Playlist'}
              </h3>
              <p className="text-xs text-neutral-400">Add songs, description, and custom vibe</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1">
              Playlist Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Midnight Drive & Late Coding"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white focus:border-amber-500 focus:outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              rows={2}
              placeholder="Give your playlist a story or sound aesthetic..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white focus:border-amber-500 focus:outline-none resize-none"
            />
          </div>

          {/* Gradient Palette Selection */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
              Backdrop Atmosphere
            </label>
            <div className="flex gap-2">
              {GRADIENTS.map((grad, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedGradient(grad)}
                  className={`w-10 h-8 rounded-lg bg-gradient-to-r ${grad} cursor-pointer border-2 transition-transform ${
                    selectedGradient === grad ? 'border-amber-400 scale-110' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Track Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                Include Songs ({selectedTrackIds.length})
              </label>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-1 p-2 rounded-xl bg-neutral-950/80 border border-neutral-800">
              {availableTracks.map((track) => {
                const isSelected = selectedTrackIds.includes(track.id);
                return (
                  <div
                    key={track.id}
                    onClick={() => toggleTrack(track.id)}
                    className={`p-2 rounded-lg flex items-center justify-between cursor-pointer text-xs transition-colors ${
                      isSelected ? 'bg-neutral-800 text-white' : 'hover:bg-neutral-900 text-neutral-400'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={track.coverUrl}
                        alt={track.title}
                        className="w-6 h-6 rounded object-cover flex-shrink-0"
                      />
                      <span className="truncate font-medium">{track.title}</span>
                      <span className="text-neutral-500 truncate">• {track.artist}</span>
                    </div>

                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center border ${
                        isSelected ? 'bg-amber-500 border-amber-500 text-neutral-950' : 'border-neutral-700'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer buttons */}
          <div className="pt-3 border-t border-neutral-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-300 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving || !title.trim()}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-neutral-950 text-xs font-bold shadow-lg transition-colors"
            >
              {isSaving ? 'Saving...' : editingPlaylist ? 'Save Changes' : 'Create Playlist'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
