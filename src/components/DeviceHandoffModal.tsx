import React, { useState } from 'react';
import { X, Cast, Laptop, Smartphone, Speaker, Check, RefreshCw, Volume2, Cloud, Sparkles } from 'lucide-react';
import { ConnectedDevice } from '../types';

interface DeviceHandoffModalProps {
  isOpen: boolean;
  onClose: () => void;
  devices: ConnectedDevice[];
  activeDeviceId: string;
  onTransferDevice: (deviceId: string) => Promise<void>;
  isSyncing: boolean;
}

export const DeviceHandoffModal: React.FC<DeviceHandoffModalProps> = ({
  isOpen,
  onClose,
  devices,
  activeDeviceId,
  onTransferDevice,
  isSyncing,
}) => {
  const [transferringId, setTransferringId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectDevice = async (device: ConnectedDevice) => {
    if (device.id === activeDeviceId) return;
    setTransferringId(device.id);
    try {
      await onTransferDevice(device.id);
    } finally {
      setTransferringId(null);
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'mobile':
        return <Smartphone className="w-5 h-5 text-rose-400" />;
      case 'speaker':
        return <Speaker className="w-5 h-5 text-cyan-400" />;
      default:
        return <Laptop className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in select-none">
      <div
        id="sonora-device-modal"
        className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-[1px]">
              <div className="w-full h-full bg-neutral-950 rounded-[11px] flex items-center justify-center">
                <Cast className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">AirPlay & Devices</h3>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                  Cloud Sync
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Seamless multi-device audio handoff
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Device List */}
        <div className="p-5 space-y-3">
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            Available Cloud Devices
          </p>

          <div className="space-y-2">
            {devices.map((device) => {
              const isActive = device.id === activeDeviceId;
              const isBusy = transferringId === device.id;

              return (
                <div
                  key={device.id}
                  id={`device-item-${device.id}`}
                  onClick={() => handleSelectDevice(device)}
                  className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    isActive
                      ? 'bg-neutral-800/90 border-amber-500/50 shadow-md shadow-amber-950/30'
                      : 'bg-neutral-950/50 border-neutral-800 hover:bg-neutral-800/40 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center flex-shrink-0">
                      {getDeviceIcon(device.type)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-white truncate">
                          {device.name}
                        </p>
                        {isActive && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Streaming
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-400 flex items-center gap-2">
                        <span>{device.lastActive}</span>
                        {device.battery !== undefined && (
                          <span>• {device.battery}% battery</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div>
                    {isBusy ? (
                      <RefreshCw className="w-5 h-5 text-amber-400 animate-spin" />
                    ) : isActive ? (
                      <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center text-neutral-950">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    ) : (
                      <button className="text-xs px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors">
                        Connect
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950/80 flex items-center justify-between text-xs text-neutral-400">
          <div className="flex items-center gap-1.5 text-neutral-300">
            <Cloud className="w-3.5 h-3.5 text-emerald-400" />
            <span>Synced across all your authorized devices</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
