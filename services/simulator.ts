import { Account, RecurringItem, OneTimeTransaction, SimulationResult, SimulationPoint, Alert, TransactionEvent } from '../types';

export const SIMULATION_MONTHS = 24;

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const isSameDay = (d1: Date, d2: Date): boolean => {
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
};

const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const runSimulation = (
  accounts: Account[], 
  recurringItems: RecurringItem[],
  oneTimeTransactions: OneTimeTransaction[] = []
): SimulationResult => {
  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + SIMULATION_MONTHS);

  // Initialize running balances
  const currentBalances: Record<string, number> = {};
  const accountMap: Record<string, Account> = {};
  
  accounts.forEach(acc => {
    currentBalances[acc.id] = acc.initialBalance;
    accountMap[acc.id] = acc;
  });

  const dailyData: SimulationPoint[] = [];
  const monthlyData: SimulationPoint[] = [];
  const eventData: SimulationPoint[] = [];
  const alerts: Alert[] = [];
  
  let currentDate = new Date(startDate);
  
  // Track min/max for summary
  let minNetWorth = Infinity;
  let maxNetWorth = -Infinity;

  // Pre-process items for performance
  const processedRecurring = recurringItems.map(item => ({
    ...item,
    startDateObj: new Date(item.startDate),
  }));

  const processedOneTime = oneTimeTransactions.map(item => ({
    ...item,
    dateObj: new Date(item.date),
  }));

  // Track previous balances to detect when threshold is crossed
  const previousBalances: Record<string, number> = { ...currentBalances };

  while (currentDate <= endDate) {
    const dateStr = formatDate(currentDate);
    let transactionHappened = false;
    const dailyEvents: TransactionEvent[] = [];
    
    // 1. Process Recurring Transactions
    processedRecurring.forEach(item => {
      let triggers = false;
      const start = item.startDateObj;
      
      if (currentDate >= start) {
        const diffTime = currentDate.getTime() - start.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (item.frequency === 'weekly') {
          triggers = diffDays % 7 === 0;
        } else if (item.frequency === 'bi-weekly') {
          triggers = diffDays % 14 === 0;
        } else if (item.frequency === 'monthly') {
          triggers = currentDate.getDate() === start.getDate();
        } else if (item.frequency === 'yearly') {
           triggers = currentDate.getDate() === start.getDate() && currentDate.getMonth() === start.getMonth();
        }
      }

      if (triggers) {
        const amount = item.type === 'income' ? item.amount : -item.amount;
        if (currentBalances[item.accountId] !== undefined) {
          currentBalances[item.accountId] += amount;
          transactionHappened = true;
          dailyEvents.push({
            name: item.name,
            amount: amount,
            type: item.type
          });
        }
      }
    });

    // 2. Process One-Time Transactions
    processedOneTime.forEach(item => {
      if (isSameDay(currentDate, item.dateObj)) {
        const amount = item.type === 'income' ? item.amount : -item.amount;
        if (currentBalances[item.accountId] !== undefined) {
          currentBalances[item.accountId] += amount;
          transactionHappened = true;
          dailyEvents.push({
             name: item.name,
             amount: amount,
             type: item.type
          });
        }
      }
    });

    // 3. Check for Low Balance Alerts
    Object.keys(currentBalances).forEach(accId => {
      const acc = accountMap[accId];
      const currentBal = currentBalances[accId];
      const prevBal = previousBalances[accId];
      
      if (acc.minBalanceThreshold !== undefined) {
        if (currentBal < acc.minBalanceThreshold && prevBal >= acc.minBalanceThreshold) {
          alerts.push({
            date: dateStr,
            accountId: accId,
            accountName: acc.name,
            balance: Number(currentBal.toFixed(2)),
            threshold: acc.minBalanceThreshold,
            message: `Balance below threshold ($${acc.minBalanceThreshold})`
          });
        }
      }
      
      previousBalances[accId] = currentBal;
    });

    // 4. Record Data Points
    let total = 0;
    const point: SimulationPoint = { date: dateStr, total: 0 };
    
    // Attach events if any
    if (dailyEvents.length > 0) {
        point.events = dailyEvents;
    }

    Object.keys(currentBalances).forEach(accId => {
      point[accId] = Number(currentBalances[accId].toFixed(2));
      total += currentBalances[accId];
    });
    point.total = Number(total.toFixed(2));

    if (point.total < minNetWorth) minNetWorth = point.total;
    if (point.total > maxNetWorth) maxNetWorth = point.total;

    dailyData.push(point);

    const isStart = isSameDay(currentDate, startDate);
    const isEnd = isSameDay(currentDate, endDate);

    if (currentDate.getDate() === 1 || isEnd) {
        monthlyData.push(point);
    }

    // Event data: Start, End, or any day a transaction happened
    if (isStart || isEnd || transactionHappened) {
        eventData.push(point);
    }

    currentDate = addDays(currentDate, 1);
  }

  return {
    dailyData,
    monthlyData,
    eventData,
    finalNetWorth: monthlyData[monthlyData.length - 1]?.total || 0,
    minNetWorth: minNetWorth === Infinity ? 0 : minNetWorth,
    maxNetWorth: maxNetWorth === -Infinity ? 0 : maxNetWorth,
    alerts
  };
};