import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export interface WatchProgress {
  contentId: string;
  contentType: 'movie' | 'tv';
  timestamp: number;
  seasonId?: string;
  episodeId?: string;
  updatedAt: number;
}

export const saveWatchProgress = async (
  userId: string,
  progress: WatchProgress,
  retryCount = 0
): Promise<{ success: boolean; error?: any }> => {
  const maxRetries = 3;
  
  try {
    // For TV shows, include BOTH season and episode ID to handle duplicate episode numbers
    const docId = progress.contentType === 'tv' && progress.seasonId && progress.episodeId
      ? `${userId}_${progress.contentId}_${progress.seasonId}_${progress.episodeId}`
      : `${userId}_${progress.contentId}`;
    
    console.log(`🔄 Firestore save attempt ${retryCount + 1}:`, { 
      docId, 
      timestamp: progress.timestamp,
      seasonId: progress.seasonId,
      episodeId: progress.episodeId 
    });
    
    const progressRef = doc(db, 'watchProgress', docId);
    
    // Use setDoc with merge to avoid conflicts
    await setDoc(progressRef, {
      ...progress,
      userId,
      updatedAt: Date.now(),
    }, { merge: true });
    
    console.log('✅ Firestore saved successfully');
    return { success: true };
  } catch (error: any) {
    console.error(`❌ Firestore error (attempt ${retryCount + 1}):`, error);
    
    // Retry logic with exponential backoff
    if (retryCount < maxRetries) {
      const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
      console.log(`⏳ Retrying in ${delay}ms...`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return saveWatchProgress(userId, progress, retryCount + 1);
    }
    
    return { success: false, error };
  }
};

export const getWatchProgress = async (
  userId: string,
  contentId: string,
  seasonId?: string,
  episodeId?: string
): Promise<WatchProgress | null> => {
  try {
    // For TV shows with season and episode ID, get episode-specific progress
    const docId = seasonId && episodeId
      ? `${userId}_${contentId}_${seasonId}_${episodeId}`
      : `${userId}_${contentId}`;
    
    const progressRef = doc(db, 'watchProgress', docId);
    const progressSnap = await getDoc(progressRef);
    
    if (progressSnap.exists()) {
      return progressSnap.data() as WatchProgress;
    }
    
    return null;
  } catch (error) {
    return null;
  }
};
