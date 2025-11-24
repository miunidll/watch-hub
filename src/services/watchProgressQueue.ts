import { saveWatchProgress, WatchProgress } from './watchProgress';

interface QueuedSave {
  progress: WatchProgress;
  userId: string;
  retries: number;
  timestamp: number;
}

class WatchProgressQueue {
  private queue: Map<string, QueuedSave> = new Map();
  private processing = false;
  private maxRetries = 3;
  private retryDelay = 1000; // Start with 1 second

  // Generate a unique key for each save
  private getKey(userId: string, progress: WatchProgress): string {
    return progress.seasonId && progress.episodeId
      ? `${userId}_${progress.contentId}_${progress.seasonId}_${progress.episodeId}`
      : `${userId}_${progress.contentId}`;
  }

  enqueue(userId: string, progress: WatchProgress) {
    const key = this.getKey(userId, progress);
    
    this.queue.set(key, {
      progress,
      userId,
      retries: 0,
      timestamp: Date.now()
    });
    
    if (!this.processing) {
      this.processQueue();
    }
  }

  // Process the queue with retry logic
  private async processQueue() {
    if (this.processing || this.queue.size === 0) return;
    
    this.processing = true;

    const itemsToProcess = Array.from(this.queue.entries());

    for (const [key, item] of itemsToProcess) {
      const episodeInfo = `S${item.progress.seasonId}-E${item.progress.episodeId}`;
      
      try {
        const result = await saveWatchProgress(item.userId, item.progress);
        
        if (result.success) {
          console.log(`✅ [QUEUE] Successfully saved ${episodeInfo}`);
          this.queue.delete(key);
        } else {
          throw new Error('Save failed: ' + (result.error?.message || 'Unknown error'));
        }
      } catch (error) {
        item.retries++;
        
        if (item.retries >= this.maxRetries) {
          this.queue.delete(key);
        } else {
          const delay = this.retryDelay * Math.pow(2, item.retries - 1);
          setTimeout(() => {
            this.processQueue();
          }, delay);
        }
      }
    }

    this.processing = false;
    
    // Check if there are more items to process
    if (this.queue.size > 0) {
      setTimeout(() => this.processQueue(), 100);
    }
  }

  // Get queue status for debugging
  getStatus() {
    return {
      queueSize: this.queue.size,
      processing: this.processing,
      items: Array.from(this.queue.entries()).map(([key, item]) => ({
        key,
        retries: item.retries,
        age: Date.now() - item.timestamp
      }))
    };
  }
}

// Singleton instance
export const watchProgressQueue = new WatchProgressQueue();
