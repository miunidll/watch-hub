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
    console.log('🔄 Saving watch progress:', {
      userId,
      contentId: progress.contentId,
      timestamp: progress.timestamp,
      seasonId: progress.seasonId,
      episodeId: progress.episodeId,
    });

    const progressRef = doc(db, 'watchProgress', `${userId}_${progress.contentId}`);
    await setDoc(progressRef, {
      ...progress,
      userId,
      updatedAt: Date.now(),
    });

    console.log('✅ Watch progress saved successfully!');
    return { success: true };
  } catch (error) {
    console.error('❌ Error saving watch progress:', error);
    return { success: false, error };
  }
};

export const getWatchProgress = async (
  userId: string,
  contentId: string
): Promise<WatchProgress | null> => {
  try {
    console.log('📖 Loading watch progress:', { userId, contentId });
    
    const progressRef = doc(db, 'watchProgress', `${userId}_${contentId}`);
    const progressSnap = await getDoc(progressRef);
    
    if (progressSnap.exists()) {
      const data = progressSnap.data() as WatchProgress;
      console.log('✅ Watch progress loaded:', data);
      return data;
    }
    
    console.log('ℹ️ No watch progress found for this content');
    return null;
  } catch (error) {
    console.error('❌ Error loading watch progress:', error);
    return null;
  }
};
