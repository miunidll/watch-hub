import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export interface UserSettings {
  autoplay: boolean;
  updatedAt: number;
}

export const saveUserSettings = async (
  userId: string,
  settings: Partial<UserSettings>
): Promise<void> => {
  try {
    const settingsRef = doc(db, 'userSettings', userId);
    
    await setDoc(settingsRef, {
      ...settings,
      updatedAt: Date.now(),
    }, { merge: true });
    
    console.log('✅ Settings saved:', settings);
  } catch (error) {
    console.error('❌ Error saving user settings:', error);
  }
};

export const getUserSettings = async (
  userId: string
): Promise<UserSettings | null> => {
  try {
    const settingsRef = doc(db, 'userSettings', userId);
    const settingsSnap = await getDoc(settingsRef);
    
    if (settingsSnap.exists()) {
      const data = settingsSnap.data() as UserSettings;
      console.log('✅ Settings loaded:', data);
      return data;
    }
    
    console.log('ℹ️ No settings found for user');
    return null;
  } catch (error) {
    console.error('❌ Error getting user settings:', error);
    return null;
  }
};
