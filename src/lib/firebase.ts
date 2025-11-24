import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration - users should replace with their own config
const firebaseConfig = {
  apiKey: "AIzaSyDVEDyaRPd_IfiSpvAfhKyV2eskcyv8nCA",
  authDomain: "miunet-80973.firebaseapp.com",
  projectId: "miunet-80973",
  storageBucket: "miunet-80973.firebasestorage.app",
  messagingSenderId: "371262973976",
  appId: "1:371262973976:web:545db8f5b80fc55f9afb6d",
  measurementId: "G-EVN6FGSK8P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
