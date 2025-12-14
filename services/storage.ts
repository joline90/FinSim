import { UserProfile, Account, RecurringItem } from '../types';

const STORAGE_KEY = 'finsim_data_v1';

// Default data for a new or demo user
export const DEFAULT_ACCOUNTS: Account[] = [
  { id: '1', name: 'Checking (Chase)', initialBalance: 15000, color: '#0ea5e9', minBalanceThreshold: 5000 },
  { id: '2', name: 'Savings (HYSA)', initialBalance: 50000, color: '#f59e0b' }
];

export const DEFAULT_ITEMS: RecurringItem[] = [
  { 
    id: '1', 
    name: 'Salary', 
    amount: 12000, 
    type: 'income', 
    frequency: 'monthly', 
    accountId: '1', 
    startDate: new Date().toISOString().split('T')[0] 
  },
  { 
    id: '2', 
    name: 'Rent', 
    amount: 3500, 
    type: 'expense', 
    frequency: 'monthly', 
    accountId: '1', 
    startDate: new Date().toISOString().split('T')[0] 
  },
  { 
    id: '3', 
    name: 'Savings Deposit', 
    amount: 2000, 
    type: 'expense', 
    frequency: 'monthly', 
    accountId: '1', 
    startDate: new Date().toISOString().split('T')[0] 
  },
  {
    id: '4', 
    name: 'Savings Interest/In', 
    amount: 2000, 
    type: 'income', 
    frequency: 'monthly', 
    accountId: '2', 
    startDate: new Date().toISOString().split('T')[0] 
  }
];

export const createDefaultUser = (name: string = 'Demo User'): UserProfile => ({
  id: crypto.randomUUID(),
  name,
  accounts: [...DEFAULT_ACCOUNTS],
  recurringItems: [...DEFAULT_ITEMS],
  oneTimeTransactions: []
});

export const createEmptyUser = (name: string): UserProfile => ({
    id: crypto.randomUUID(),
    name,
    accounts: [],
    recurringItems: [],
    oneTimeTransactions: []
});

export const loadUsers = (): UserProfile[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("Failed to load data", e);
  }
  return [createDefaultUser()];
};

export const saveUsers = (users: UserProfile[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  } catch (e) {
    console.error("Failed to save data", e);
  }
};