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
  progress: WatchProgress
) => {
  try {
    // For TV shows, include episode ID in the document ID to track per-episode progress
    const docId = progress.contentType === 'tv' && progress.episodeId
      ? `${userId}_${progress.contentId}_${progress.episodeId}`
      : `${userId}_${progress.contentId}`;
    
    console.log('🔄 Firestore save:', { docId, timestamp: progress.timestamp });
    
    const progressRef = doc(db, 'watchProgress', docId);
    await setDoc(progressRef, {
      ...progress,
      userId,
      updatedAt: Date.now(),
    });
    
    console.log('✅ Firestore saved successfully');
    return { success: true };
  } catch (error) {
    console.error('❌ Firestore error:', error);
    return { success: false, error };
  }
};

export const getWatchProgress = async (
  userId: string,
  contentId: string,
  episodeId?: string
): Promise<WatchProgress | null> => {
  try {
    // For TV shows with episode ID, get episode-specific progress
    const docId = episodeId
      ? `${userId}_${contentId}_${episodeId}`
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
