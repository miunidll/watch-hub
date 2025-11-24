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
    const progressRef = doc(db, 'watchProgress', `${userId}_${progress.contentId}`);
    await setDoc(progressRef, {
      ...progress,
      userId,
      updatedAt: Date.now(),
    });
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};

export const getWatchProgress = async (
  userId: string,
  contentId: string
): Promise<WatchProgress | null> => {
  try {
    const progressRef = doc(db, 'watchProgress', `${userId}_${contentId}`);
    const progressSnap = await getDoc(progressRef);
    
    if (progressSnap.exists()) {
      return progressSnap.data() as WatchProgress;
    }
    
    return null;
  } catch (error) {
    return null;
  }
};
