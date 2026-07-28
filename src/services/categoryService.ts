import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Category } from '../types';

const categoriesCollection = collection(db, 'categories');

export const listCategories = async () => {
  const querySnapshot = await getDocs(query(categoriesCollection, orderBy('name', 'asc')));
  return querySnapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as Category));
};

export const createCategory = async (name: string) => {
  const docRef = await addDoc(categoriesCollection, {
    name,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateCategory = async (id: string, name: string) => {
  await updateDoc(doc(db, 'categories', id), { name, updatedAt: serverTimestamp() });
};

export const deleteCategory = async (id: string) => {
  await deleteDoc(doc(db, 'categories', id));
};
