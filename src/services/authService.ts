import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth } from './firebase';

const allowedEmails = new Set([
  'rajasekhar.paati@gmail.com',
  'arjun.vendra@gmail.com',
  'ashok.babu208@gmail.com',
]);

const isAllowedEmail = (email?: string) => !!email && allowedEmails.has(email.toLowerCase());

export const registerUser = async (email: string, password: string, displayName?: string) => {
  if (!isAllowedEmail(email)) {
    throw new Error('Only authorized Gmail accounts may sign in.');
  }

  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName) {
    await updateProfile(userCredential.user, { displayName });
  }
  return userCredential.user;
};

export const loginUser = async (email: string, password: string) => {
  if (!isAllowedEmail(email)) {
    throw new Error('Only authorized Gmail accounts may sign in.');
  }

  return signInWithEmailAndPassword(auth, email, password);
};

export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const userCredential = await signInWithPopup(auth, provider);
  const email = userCredential.user.email?.toLowerCase() ?? '';

  if (!isAllowedEmail(email)) {
    await signOut(auth);
    throw new Error('Only authorized Gmail accounts may sign in.');
  }

  return userCredential.user;
};

export const resetPassword = async (email: string) =>
  sendPasswordResetEmail(auth, email);

export const logoutUser = async () => signOut(auth);
