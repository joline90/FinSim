export type Frequency = 'weekly' | 'bi-weekly' | 'monthly' | 'yearly';

export type TransactionType = 'income' | 'expense';

export interface Account {
  id: string;
  name: string;
  initialBalance: number;
  color: string;
  minBalanceThreshold?: number; // Optional safety threshold
}

export interface RecurringItem {
  id: string;
  name: string;
  amount: number;
  type: TransactionType;
  frequency: Frequency;
  accountId: string;
  startDate: string; // ISO Date string YYYY-MM-DD
}

export interface OneTimeTransaction {
  id: string;
  name: string;
  amount: number;
  type: TransactionType;
  date: string; // ISO Date string YYYY-MM-DD
  accountId: string;
}

export interface TransactionEvent {
  name: string;
  amount: number; // Signed amount
  type: TransactionType;
}

export interface SimulationPoint {
  date: string; // ISO Date string YYYY-MM-DD
  total: number;
  events?: TransactionEvent[];
  [accountId: string]: number | string | TransactionEvent[] | undefined; // Dynamic keys
}

export interface Alert {
  date: string;
  accountId: string;
  accountName: string;
  balance: number;
  threshold: number;
  message: string;
}

export interface SimulationResult {
  dailyData: SimulationPoint[];
  monthlyData: SimulationPoint[];
  eventData: SimulationPoint[];
  finalNetWorth: number;
  minNetWorth: number;
  maxNetWorth: number;
  alerts: Alert[];
}

export interface UserProfile {
  id: string;
  name: string;
  accounts: Account[];
  recurringItems: RecurringItem[];
  oneTimeTransactions: OneTimeTransaction[];
}