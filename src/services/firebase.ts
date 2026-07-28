import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Replace these Firebase config values with your project-specific settings.
const firebaseConfig = {
  apiKey: 'AIzaSyAw9i4G75j674J27Pon0XQs5fvFgqtWnLE',
  authDomain: 'annapurnahostel-6f423.firebaseapp.com',
  projectId: 'annapurnahostel-6f423',
  storageBucket: 'annapurnahostel-6f423.appspot.com',
  messagingSenderId: '909234124701',
  appId: '1:909234124701:web:04c9b41e5d6a9e19eb2174',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
