import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: 'AIzaSyAw9i4G75j674J27Pon0XQs5fvFgqtWnLE',
  authDomain: 'annapurnahostel-6f423.firebaseapp.com',
  projectId: 'annapurnahostel-6f423',
  storageBucket: 'annapurnahostel-6f423.firebasestorage.app',
  messagingSenderId: '909234124701',
  appId: '1:909234124701:web:04c9b41e5d6a9e19eb2174',
  measurementId: 'G-7WF33N0D9P',
}

const app = initializeApp(firebaseConfig)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null

export default app
