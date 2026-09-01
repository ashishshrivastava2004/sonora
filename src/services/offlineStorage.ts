import { Track, OfflineTrackRecord } from '../types';

const DB_NAME = 'sonora_offline_storage_v1';
const STORE_NAME = 'offline_tracks';
const DB_VERSION = 1;

class OfflineStorageManager {
  private db: IDBDatabase | null = null;
  private isInitialized: boolean = false;

  private async getDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        this.isInitialized = true;
        resolve(this.db);
      };

      request.onerror = (event) => {
        console.error('IndexedDB open error:', event);
        reject(request.error);
      };
    });
  }

  public async saveOfflineTrack(
    track: Track,
    onProgress?: (percent: number) => void
  ): Promise<OfflineTrackRecord> {
    const db = await this.getDB();

    // Estimate file size based on high-res format
    let approxSizeBytes = 18 * 1024 * 1024; // 18MB for lossless
    if (track.audioQuality === 'HI_RES_LOSSLESS') {
      approxSizeBytes = 68 * 1024 * 1024; // 68MB for 24-bit 192kHz master
    } else if (track.audioQuality === 'DOLBY_ATMOS') {
      approxSizeBytes = 42 * 1024 * 1024; // 42MB for multichannel spatial
    }

    // Simulate chunked download progress
    for (let progress = 10; progress <= 100; progress += 15) {
      if (onProgress) onProgress(Math.min(100, progress));
      await new Promise((res) => setTimeout(res, 80));
    }

    const record: OfflineTrackRecord = {
      id: track.id,
      track,
      downloadedAt: new Date().toISOString(),
      sizeBytes: approxSizeBytes,
      cachedAudioBlob: `cached://sonora.lossless.flac/${track.id}`,
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const putRequest = store.put(record);

      putRequest.onsuccess = () => {
        resolve(record);
      };

      putRequest.onerror = () => {
        reject(putRequest.error);
      };
    });
  }

  public async saveTrack(track: Track): Promise<OfflineTrackRecord> {
    return this.saveOfflineTrack(track);
  }

  public async removeOfflineTrack(trackId: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const deleteRequest = store.delete(trackId);

      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject(deleteRequest.error);
    });
  }

  public async removeTrack(trackId: string): Promise<void> {
    return this.removeOfflineTrack(trackId);
  }

  public async isTrackDownloaded(trackId: string): Promise<boolean> {
    const db = await this.getDB();
    return new Promise((resolve) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const getRequest = store.get(trackId);

      getRequest.onsuccess = () => {
        resolve(!!getRequest.result);
      };
      getRequest.onerror = () => {
        resolve(false);
      };
    });
  }

  public async getAllOfflineTracks(): Promise<OfflineTrackRecord[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const getAllRequest = store.getAll();

      getAllRequest.onsuccess = () => {
        resolve(getAllRequest.result || []);
      };
      getAllRequest.onerror = () => {
        reject(getAllRequest.error);
      };
    });
  }

  public async getAllTracks(): Promise<Track[]> {
    const records = await this.getAllOfflineTracks();
    return records.map((r) => r.track);
  }

  public async clearAllOfflineStorage(): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const clearRequest = store.clear();

      clearRequest.onsuccess = () => resolve();
      clearRequest.onerror = () => reject(clearRequest.error);
    });
  }

  public async clearAll(): Promise<void> {
    return this.clearAllOfflineStorage();
  }

  public async getStorageUsage(): Promise<{ usedBytes: number; count: number }> {
    const records = await this.getAllOfflineTracks();
    const usedBytes = records.reduce((acc, curr) => acc + (curr.sizeBytes || 0), 0);
    return {
      usedBytes,
      count: records.length,
    };
  }

  public async getStorageEstimate(): Promise<{ used: number; quota: number }> {
    const usage = await this.getStorageUsage();
    return {
      used: usage.usedBytes,
      quota: 1024 * 1024 * 1024, // 1 GB allocation
    };
  }
}

export const offlineStorage = new OfflineStorageManager();
