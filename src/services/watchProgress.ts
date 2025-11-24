import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export interface WatchProgress {
  contentId: string;
  contentType: 'movie' | 'tv';
  timestamp: number;
  seasonId?: string;
  episodeId?: string;
  updatedAt: number;
  autoplay?: boolean;
}

export const saveWatchProgress = async (
  userId: string,
  progress: WatchProgress,
  retryCount = 0
): Promise<{ success: boolean; error?: any }> => {
  const maxRetries = 3;
  
  try {
    const docId = progress.contentType === 'tv' && progress.seasonId && progress.episodeId
      ? `${userId}_${progress.contentId}_${progress.seasonId}_${progress.episodeId}`
      : `${userId}_${progress.contentId}`;
    
    const progressRef = doc(db, 'watchProgress', docId);
    
    await setDoc(progressRef, {
      ...progress,
      userId,
      updatedAt: Date.now(),
    }, { merge: true });
    
    return { success: true };
  } catch (error: any) {
    if (retryCount < maxRetries) {
      const delay = Math.pow(2, retryCount) * 1000;
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

// Get the most recent watch progress for any episode of a show
export const getLatestShowProgress = async (
  userId: string,
  contentId: string
): Promise<WatchProgress | null> => {
  try {
    const { collection, query, where, orderBy, limit, getDocs } = await import('firebase/firestore');
    
    const progressQuery = query(
      collection(db, 'watchProgress'),
      where('userId', '==', userId),
      where('contentId', '==', contentId),
      where('contentType', '==', 'tv'),
      orderBy('updatedAt', 'desc'),
      limit(1)
    );
    
    const snapshot = await getDocs(progressQuery);
    
    if (!snapshot.empty) {
      return snapshot.docs[0].data() as WatchProgress;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting latest show progress:', error);
    return null;
  }
};
