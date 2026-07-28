import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Expense } from '../types';

const expensesCollection = collection(db, 'expenses');

export const createExpense = async (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
  const sanitizedExpense = Object.entries(expense).reduce<Record<string, unknown>>((acc, [key, value]) => {
    if (value !== undefined) {
      acc[key] = value;
    }
    return acc;
  }, {});

  const docRef = await addDoc(expensesCollection, {
    ...sanitizedExpense,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateExpense = async (id: string, data: Partial<Expense>) => {
  const expenseRef = doc(db, 'expenses', id);
  await updateDoc(expenseRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const deleteExpense = async (id: string) => {
  await deleteDoc(doc(db, 'expenses', id));
};

export const getExpenseById = async (id: string) => {
  const docSnap = await getDoc(doc(db, 'expenses', id));
  return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as Expense) : null;
};

export const listExpenses = async (userId: string) => {
  const querySnapshot = await getDocs(
    query(expensesCollection, where('createdBy', '==', userId)),
  );

  return querySnapshot.docs
    .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as Expense))
    .sort((a, b) => b.expenseDate.localeCompare(a.expenseDate));
};
