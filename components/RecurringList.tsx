import React, { useState } from 'react';
import { Account, Frequency, RecurringItem, TransactionType, OneTimeTransaction } from '../types';
import { Plus, Trash2, Repeat, CalendarClock, ArrowUpCircle, ArrowDownCircle, Edit2, X, Save } from 'lucide-react';

interface Props {
  recurringItems: RecurringItem[];
  setRecurringItems: React.Dispatch<React.SetStateAction<RecurringItem[]>>;
  oneTimeTransactions: OneTimeTransaction[];
  setOneTimeTransactions: React.Dispatch<React.SetStateAction<OneTimeTransaction[]>>;
  accounts: Account[];
}

type Tab = 'recurring' | 'single';

export const RecurringList: React.FC<Props> = ({ 
    recurringItems, 
    setRecurringItems, 
    oneTimeTransactions,
    setOneTimeTransactions,
    accounts 
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('recurring');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [frequency, setFrequency] = useState<Frequency>('monthly');
  const [accountId, setAccountId] = useState<string>('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    resetForm();
  };

  const handleSaveRecurring = () => {
    if (!name || !amount || !accountId) return;

    if (editingId) {
        setRecurringItems(recurringItems.map(item => 
            item.id === editingId 
            ? { ...item, name, amount: parseFloat(amount), type, frequency, accountId, startDate }
            : item
        ));
    } else {
        const newItem: RecurringItem = {
            id: crypto.randomUUID(),
            name,
            amount: parseFloat(amount),
            type,
            frequency,
            accountId,
            startDate
        };
        setRecurringItems([...recurringItems, newItem]);
    }
    resetForm();
  };

  const addOneTime = () => {
    if (!name || !amount || !accountId) return;
    const newItem: OneTimeTransaction = {
      id: crypto.randomUUID(),
      name,
      amount: parseFloat(amount),
      type,
      date: startDate,
      accountId
    };
    setOneTimeTransactions([...oneTimeTransactions, newItem]);
    resetForm();
  };

  const startEditRecurring = (item: RecurringItem) => {
      setEditingId(item.id);
      setName(item.name);
      setAmount(item.amount.toString());
      setType(item.type);
      setFrequency(item.frequency);
      setAccountId(item.accountId);
      setStartDate(item.startDate);
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setAmount('');
  };

  const removeItem = (id: string, isRecurring: boolean) => {
    if (isRecurring) {
        setRecurringItems(recurringItems.filter(i => i.id !== id));
        if (editingId === id) resetForm();
    } else {
        setOneTimeTransactions(oneTimeTransactions.filter(i => i.id !== id));
    }
  };

  const getAccountName = (id: string) => accounts.find(a => a.id === id)?.name || 'Unknown';

  const freqMap: Record<Frequency, string> = {
    'weekly': 'Weekly',
    'bi-weekly': 'Bi-weekly',
    'monthly': 'Monthly',
    'yearly': 'Yearly'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 h-full flex flex-col overflow-hidden">
      {/* Tabs Header */}
      <div className="flex border-b border-slate-100">
        <button 
            onClick={() => handleTabChange('recurring')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'recurring' ? 'text-brand-600 bg-brand-50/50 border-b-2 border-brand-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
            <Repeat className="w-4 h-4" /> Recurring
        </button>
        <button 
            onClick={() => handleTabChange('single')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'single' ? 'text-brand-600 bg-brand-50/50 border-b-2 border-brand-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
            <CalendarClock className="w-4 h-4" /> Single Txn
        </button>
      </div>

      <div className="p-4 flex-1 overflow-y-auto max-h-[300px] space-y-3">
        {activeTab === 'recurring' ? (
             recurringItems.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-4">No recurring plans</p>
             ) : (
                recurringItems.map(item => (
                    <div 
                        key={item.id} 
                        className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${editingId === item.id ? 'bg-brand-50 border-brand-200' : 'bg-slate-50 border-slate-200'}`}
                    >
                        <div className="flex items-center gap-3">
                            {item.type === 'income' ? (
                                <ArrowUpCircle className="w-5 h-5 text-emerald-500" />
                            ) : (
                                <ArrowDownCircle className="w-5 h-5 text-red-500" />
                            )}
                            <div>
                                <div className="font-medium text-slate-700">{item.name}</div>
                                <div className="text-xs text-slate-500">
                                {freqMap[item.frequency]} · {getAccountName(item.accountId)} · ${item.amount.toLocaleString()}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button 
                                onClick={() => startEditRecurring(item)} 
                                className="p-1.5 text-slate-400 hover:text-brand-600 transition-colors"
                                title="Edit"
                            >
                                <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={() => removeItem(item.id, true)} 
                                className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                                title="Delete"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))
             )
        ) : (
            oneTimeTransactions.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-4">No single transactions</p>
             ) : (
                oneTimeTransactions.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-3">
                        {item.type === 'income' ? (
                            <ArrowUpCircle className="w-5 h-5 text-emerald-500" />
                        ) : (
                            <ArrowDownCircle className="w-5 h-5 text-red-500" />
                        )}
                        <div>
                            <div className="font-medium text-slate-700">{item.name}</div>
                            <div className="text-xs text-slate-500">
                            {item.date} · {getAccountName(item.accountId)} · ${item.amount.toLocaleString()}
                            </div>
                        </div>
                        </div>
                        <button onClick={() => removeItem(item.id, false)} className="text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))
             )
        )}
      </div>

      <div className="p-4 border-t border-slate-100 space-y-3 bg-white z-10">
        <div className="grid grid-cols-2 gap-2">
            <div className="flex bg-slate-100 rounded-md p-1">
                <button 
                    onClick={() => setType('income')}
                    className={`flex-1 text-xs py-1.5 rounded font-medium transition-all ${type === 'income' ? 'bg-white shadow text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}
                >Income</button>
                <button 
                    onClick={() => setType('expense')}
                    className={`flex-1 text-xs py-1.5 rounded font-medium transition-all ${type === 'expense' ? 'bg-white shadow text-red-600' : 'text-slate-500 hover:text-slate-700'}`}
                >Expense</button>
            </div>
            <input
                type="date"
                className="px-3 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-brand-500 outline-none"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
            />
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            placeholder="Desc (e.g. Bonus)"
            className="px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-brand-500 outline-none"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <input
            type="number"
            placeholder="Amount"
            className="px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-brand-500 outline-none"
            value={amount}
            onChange={e => setAmount(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
           {activeTab === 'recurring' && (
             <select
                className="px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-brand-500 outline-none bg-white"
                value={frequency}
                onChange={e => setFrequency(e.target.value as Frequency)}
             >
                <option value="weekly">Weekly</option>
                <option value="bi-weekly">Bi-weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
             </select>
           )}
          <select
            className={`px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-brand-500 outline-none bg-white ${activeTab === 'single' ? 'col-span-2' : ''}`}
            value={accountId}
            onChange={e => setAccountId(e.target.value)}
          >
            <option value="" disabled>Select Account</option>
            {accounts.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>

        {editingId && activeTab === 'recurring' ? (
           <div className="flex gap-2">
             <button
               onClick={resetForm}
               className="flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-md text-sm font-medium transition-colors"
             >
               <X className="w-4 h-4" /> Cancel
             </button>
             <button
               onClick={handleSaveRecurring}
               className="flex-1 flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white py-2 rounded-md text-sm font-medium transition-colors"
             >
               <Save className="w-4 h-4" /> Save
             </button>
           </div>
        ) : (
          <button
            onClick={activeTab === 'recurring' ? handleSaveRecurring : addOneTime}
            disabled={accounts.length === 0}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-2 rounded-md text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" /> 
            {activeTab === 'recurring' ? 'Add Recurring' : 'Add Transaction'}
          </button>
        )}
      </div>
    </div>
  );
};