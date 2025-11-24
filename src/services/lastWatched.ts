import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export interface LastWatchedEpisode {
  contentId: string;
  seasonId: string;
  episodeId: string;
  timestamp: number;
  updatedAt: number;
}

export const saveLastWatchedEpisode = async (
  userId: string,
  data: LastWatchedEpisode
): Promise<void> => {
  try {
    const docId = `${userId}_${data.contentId}`;
    const lastWatchedRef = doc(db, 'lastWatched', docId);
    
    await setDoc(lastWatchedRef, {
      ...data,
      userId,
      updatedAt: Date.now(),
    }, { merge: true });
    
    console.log('✅ Last watched episode saved');
  } catch (error) {
    console.error('❌ Error saving last watched episode:', error);
  }
};

export const getLastWatchedEpisode = async (
  userId: string,
  contentId: string
): Promise<LastWatchedEpisode | null> => {
  try {
    const docId = `${userId}_${contentId}`;
    const lastWatchedRef = doc(db, 'lastWatched', docId);
    const snapshot = await getDoc(lastWatchedRef);
    
    if (snapshot.exists()) {
      const data = snapshot.data() as LastWatchedEpisode;
      console.log('✅ Last watched episode loaded:', data);
      return data;
    }
    
    console.log('ℹ️ No last watched episode found');
    return null;
  } catch (error) {
    console.error('❌ Error getting last watched episode:', error);
    return null;
  }
};
