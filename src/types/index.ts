export type ExpenseStatus = 'pending' | 'approved' | 'reimbursed';

export type PaymentMode =
  | 'Cash'
  | 'UPI'
  | 'Bank Transfer'
  | 'Credit Card'
  | 'Debit Card'
  | 'Cheque';

export interface Category {
  id: string;
  name: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  categoryId: string;
  categoryName: string;
  paymentMode: PaymentMode;
  expenseBy: string;
  comments?: string;
  expenseDate: string;
  billImage?: string;
  status: ExpenseStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  role?: 'admin' | 'user';
  hostelName?: string;
  currency?: string;
  darkMode?: boolean;
}
