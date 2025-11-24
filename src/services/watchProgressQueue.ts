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

  // Add or update a save in the queue
  enqueue(userId: string, progress: WatchProgress) {
    const key = this.getKey(userId, progress);
    
    // Update existing or add new
    this.queue.set(key, {
      progress,
      userId,
      retries: 0,
      timestamp: Date.now()
    });

    console.log(`📝 Queued save for ${key}, queue size: ${this.queue.size}`);
    
    // Start processing if not already running
    if (!this.processing) {
      this.processQueue();
    }
  }

  // Process the queue with retry logic
  private async processQueue() {
    if (this.processing || this.queue.size === 0) return;
    
    this.processing = true;
    console.log(`🔄 Processing queue with ${this.queue.size} items`);

    const itemsToProcess = Array.from(this.queue.entries());

    for (const [key, item] of itemsToProcess) {
      try {
        console.log(`💾 Attempting save for ${key} (attempt ${item.retries + 1}/${this.maxRetries})`);
        
        const result = await saveWatchProgress(item.userId, item.progress);
        
        if (result.success) {
          console.log(`✅ Successfully saved ${key}`);
          this.queue.delete(key);
        } else {
          throw new Error('Save failed');
        }
      } catch (error) {
        console.error(`❌ Save failed for ${key}:`, error);
        
        item.retries++;
        
        if (item.retries >= this.maxRetries) {
          console.error(`🚫 Max retries reached for ${key}, removing from queue`);
          this.queue.delete(key);
        } else {
          // Exponential backoff
          const delay = this.retryDelay * Math.pow(2, item.retries - 1);
          console.log(`⏳ Will retry ${key} in ${delay}ms`);
          
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
