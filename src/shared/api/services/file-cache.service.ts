import {inject, Injectable, OnDestroy} from '@angular/core';
import {FileService} from '../../../entities/file/api/file.service';
import {firstValueFrom} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileCacheService implements OnDestroy {
  private readonly fileService = inject(FileService);
  private readonly cache = new Map<string, string>();
  private readonly pendingRequests = new Map<string, Promise<string | null>>();

  async getFileUrl(fileId: string | null): Promise<string | null> {
    if (!fileId || fileId.trim() === '') {
      return null;
    }

    // Return from cache if available
    if (this.cache.has(fileId)) {
      return this.cache.get(fileId)!;
    }

    // Wait for a pending request if already in progress
    if (this.pendingRequests.has(fileId)) {
      return this.pendingRequests.get(fileId)!;
    }

    // Fetch and cache new file
    const requestPromise = this.fetchAndCacheFile(fileId);
    this.pendingRequests.set(fileId, requestPromise);

    try {
      return await requestPromise;
    } finally {
      this.pendingRequests.delete(fileId);
    }
  }

  private async fetchAndCacheFile(fileId: string): Promise<string | null> {
    try {
      const blobUrl = await firstValueFrom(
        this.fileService.viewFileAsUrl(fileId)
      );

      this.cache.set(fileId, blobUrl);
      return blobUrl;

    } catch (error: any) {
      console.error('Error loading file:', fileId, error);
      return null;
    }
  }

  async preloadFiles(fileIds: (string | null)[]): Promise<void> {
    const validIds = fileIds.filter(id => id !== null && id.trim() !== '');

    if (validIds.length === 0) {
      return;
    }

    const promises = validIds.map(id => this.getFileUrl(id!));

    try {
      await Promise.all(promises);
    } catch (error) {
      console.warn('Some files failed to preload:', error);
    }
  }

  isCached(fileId: string | null): boolean {
    if (!fileId) return false;
    return this.cache.has(fileId);
  }

  invalidate(fileId: string | null): void {
    if (!fileId) return;

    if (this.cache.has(fileId)) {
      const blobUrl = this.cache.get(fileId)!;
      URL.revokeObjectURL(blobUrl);
      this.cache.delete(fileId);
    }
  }

  clearAll(): void {
    this.cache.forEach((blobUrl) => {
      URL.revokeObjectURL(blobUrl);
    });

    this.cache.clear();
    this.pendingRequests.clear();
  }

  getCacheStats(): { size: number; pendingRequests: number } {
    return {
      size: this.cache.size,
      pendingRequests: this.pendingRequests.size
    };
  }

  ngOnDestroy(): void {
    this.clearAll();
  }
}
