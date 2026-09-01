import React from 'react';
import { X, Sliders, Volume2, Sparkles, Waves, RefreshCw, Check } from 'lucide-react';
import { EqualizerConfig } from '../types';
import { EQ_PRESETS } from '../data/musicData';
import { AudioSpectrumCanvas } from './AudioSpectrumCanvas';

interface EqualizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  equalizer: EqualizerConfig;
  onUpdateEqualizer: (config: EqualizerConfig) => void;
  isPlaying: boolean;
  dominantColor?: string;
}

export const EqualizerModal: React.FC<EqualizerModalProps> = ({
  isOpen,
  onClose,
  equalizer,
  onUpdateEqualizer,
  isPlaying,
  dominantColor = '#6366f1',
}) => {
  if (!isOpen) return null;

  const handleBandChange = (index: number, newGain: number) => {
    const updatedBands = equalizer.bands.map((band, idx) =>
      idx === index ? { ...band, gain: newGain } : band
    );
    onUpdateEqualizer({
      ...equalizer,
      preset: 'Custom',
      bands: updatedBands,
    });
  };

  const handleApplyPreset = (presetName: string) => {
    const preset = EQ_PRESETS[presetName];
    if (!preset) return;

    const updatedBands = equalizer.bands.map((band, idx) => ({
      ...band,
      gain: preset.bands[idx] ?? 0,
    }));

    onUpdateEqualizer({
      ...equalizer,
      preset: presetName,
      bands: updatedBands,
      bassBoost: preset.bassBoost,
      spatialAudio: preset.spatialAudio,
      spatialSpread: preset.spatialSpread,
    });
  };

  const handleReset = () => {
    handleApplyPreset('Flat / Studio Reference');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in select-none">
      <div
        id="sonora-equalizer-modal"
        className="w-full max-w-2xl bg-neutral-900/95 border border-neutral-800/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 p-[1px]">
              <div className="w-full h-full bg-neutral-950 rounded-[11px] flex items-center justify-center">
                <Sliders className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">10-Band Graphic Equalizer</h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono border border-amber-500/30">
                  DSP Studio
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                High-Resolution WebAudio Digital Signal Processing
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Enable Toggle */}
            <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-300 font-medium bg-neutral-800/60 px-3 py-1.5 rounded-full border border-neutral-700/60">
              <span>{equalizer.enabled ? 'DSP Active' : 'Bypass'}</span>
              <input
                id="eq-toggle-enabled"
                type="checkbox"
                checked={equalizer.enabled}
                onChange={(e) =>
                  onUpdateEqualizer({ ...equalizer, enabled: e.target.checked })
                }
                className="w-4 h-4 rounded accent-amber-500 cursor-pointer"
              />
            </label>

            <button
              id="close-eq-modal-btn"
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Preset Buttons */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Acoustic Presets
              </span>
              <button
                onClick={handleReset}
                className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset Flat</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {Object.keys(EQ_PRESETS).map((presetKey) => {
                const isActive = equalizer.preset === presetKey;
                return (
                  <button
                    key={presetKey}
                    id={`eq-preset-${presetKey}`}
                    onClick={() => handleApplyPreset(presetKey)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-amber-500 text-neutral-950 font-bold shadow-md shadow-amber-500/20'
                        : 'bg-neutral-800/80 text-neutral-300 hover:bg-neutral-800 border border-neutral-750'
                    }`}
                  >
                    {presetKey}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Real-time Spectrum Bar preview inside EQ */}
          <div className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-800 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono">
              <span>Real-Time Frequency Response</span>
              <span className="text-amber-400">24-bit / 192kHz DAC Output</span>
            </div>
            <AudioSpectrumCanvas
              isPlaying={isPlaying && equalizer.enabled}
              color={dominantColor}
              height={36}
              barCount={24}
            />
          </div>

          {/* 10 Vertical Sliders */}
          <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800/80">
            <div className="grid grid-cols-10 gap-2 items-end justify-items-center h-48 pt-4 pb-2">
              {equalizer.bands.map((band, idx) => (
                <div key={band.freq} className="flex flex-col items-center h-full justify-between w-full">
                  <span className="text-[10px] font-mono text-neutral-400">
                    {band.gain > 0 ? `+${band.gain}` : band.gain}
                  </span>

                  <div className="relative h-28 flex items-center justify-center">
                    <input
                      type="range"
                      min="-12"
                      max="12"
                      step="0.5"
                      disabled={!equalizer.enabled}
                      value={band.gain}
                      onChange={(e) => handleBandChange(idx, parseFloat(e.target.value))}
                      className="h-28 -rotate-90 w-24 bg-neutral-800 rounded-lg appearance-none accent-amber-400 cursor-pointer disabled:opacity-40"
                    />
                  </div>

                  <span className="text-[10px] font-mono text-neutral-300 font-semibold mt-1">
                    {band.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Spatial 3D Audio, Bass Boost, & Preamp */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Bass Boost */}
            <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800 flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-300">Bass Booster</span>
                <span className="text-xs font-mono text-amber-400">{equalizer.bassBoost}%</span>
              </div>
              <input
                id="eq-bass-boost-slider"
                type="range"
                min="0"
                max="100"
                disabled={!equalizer.enabled}
                value={equalizer.bassBoost}
                onChange={(e) =>
                  onUpdateEqualizer({
                    ...equalizer,
                    preset: 'Custom',
                    bassBoost: parseInt(e.target.value),
                  })
                }
                className="w-full h-1.5 bg-neutral-800 rounded-full accent-amber-400 cursor-pointer"
              />
              <p className="text-[10px] text-neutral-400">Sub-60Hz harmonic resonance</p>
            </div>

            {/* Spatial Audio 3D */}
            <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800 flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-300">Spatial Audio 3D</span>
                <span className="text-xs font-mono text-violet-400">
                  {equalizer.spatialAudio ? `${equalizer.spatialSpread}%` : 'Off'}
                </span>
              </div>
              <input
                id="eq-spatial-spread-slider"
                type="range"
                min="0"
                max="100"
                disabled={!equalizer.enabled || !equalizer.spatialAudio}
                value={equalizer.spatialSpread}
                onChange={(e) =>
                  onUpdateEqualizer({
                    ...equalizer,
                    preset: 'Custom',
                    spatialSpread: parseInt(e.target.value),
                  })
                }
                className="w-full h-1.5 bg-neutral-800 rounded-full accent-violet-400 cursor-pointer"
              />
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-neutral-400">Binaural room acoustic model</p>
                <button
                  onClick={() =>
                    onUpdateEqualizer({
                      ...equalizer,
                      spatialAudio: !equalizer.spatialAudio,
                    })
                  }
                  className="text-[10px] text-violet-300 underline"
                >
                  {equalizer.spatialAudio ? 'Disable' : 'Enable'}
                </button>
              </div>
            </div>

            {/* Preamp */}
            <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800 flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-300">Preamp Gain</span>
                <span className="text-xs font-mono text-emerald-400">
                  {equalizer.preamp > 0 ? `+${equalizer.preamp}` : equalizer.preamp} dB
                </span>
              </div>
              <input
                id="eq-preamp-slider"
                type="range"
                min="-12"
                max="12"
                step="0.5"
                disabled={!equalizer.enabled}
                value={equalizer.preamp}
                onChange={(e) =>
                  onUpdateEqualizer({
                    ...equalizer,
                    preset: 'Custom',
                    preamp: parseFloat(e.target.value),
                  })
                }
                className="w-full h-1.5 bg-neutral-800 rounded-full accent-emerald-400 cursor-pointer"
              />
              <p className="text-[10px] text-neutral-400">Analog head-amp gain level</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950/90 flex items-center justify-between">
          <p className="text-xs text-neutral-400 font-mono">
            Output format: Direct Stream Digital / ALAC Bit-Perfect
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-lg transition-colors"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
