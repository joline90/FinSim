import React, { useState } from 'react';
import { Account } from '../types';
import { Plus, Trash2, Wallet, AlertTriangle, Edit2, X, Save } from 'lucide-react';

interface Props {
  accounts: Account[];
  setAccounts: React.Dispatch<React.SetStateAction<Account[]>>;
}

const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef'];

export const AccountList: React.FC<Props> = ({ accounts, setAccounts }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [threshold, setThreshold] = useState('');

  const handleSave = () => {
    if (!name) return;

    if (editingId) {
      // Update existing account
      setAccounts(accounts.map(acc => {
        if (acc.id === editingId) {
          return {
            ...acc,
            name,
            initialBalance: parseFloat(balance) || 0,
            minBalanceThreshold: threshold ? parseFloat(threshold) : undefined,
          };
        }
        return acc;
      }));
      resetForm();
    } else {
      // Add new account
      const color = COLORS[accounts.length % COLORS.length];
      const newAccount: Account = {
        id: crypto.randomUUID(),
        name,
        initialBalance: parseFloat(balance) || 0,
        minBalanceThreshold: threshold ? parseFloat(threshold) : undefined,
        color,
      };
      setAccounts([...accounts, newAccount]);
      resetForm();
    }
  };

  const handleEdit = (acc: Account) => {
    setEditingId(acc.id);
    setName(acc.name);
    setBalance(acc.initialBalance.toString());
    setThreshold(acc.minBalanceThreshold?.toString() || '');
  };

  const removeAccount = (id: string) => {
    setAccounts(accounts.filter(a => a.id !== id));
    if (editingId === id) resetForm();
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setBalance('');
    setThreshold('');
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Wallet className="w-5 h-5 text-brand-600" />
        <h2 className="text-lg font-semibold text-slate-800">Accounts</h2>
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto max-h-[250px] mb-4 pr-1">
        {accounts.length === 0 && (
          <p className="text-slate-400 text-sm text-center py-4">No accounts. Please add one.</p>
        )}
        {accounts.map(acc => (
          <div 
            key={acc.id} 
            className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${editingId === acc.id ? 'bg-brand-50 border-brand-200' : 'bg-slate-50 border-slate-200 group hover:border-brand-200'}`}
          >
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: acc.color }}></div>
              <div>
                <div className="font-medium text-slate-700">{acc.name}</div>
                <div className="text-xs text-slate-500 flex items-center gap-2">
                  <span>Start: ${acc.initialBalance.toLocaleString()}</span>
                  {acc.minBalanceThreshold !== undefined && (
                    <span className="flex items-center text-amber-600 bg-amber-50 px-1 rounded">
                       <AlertTriangle className="w-3 h-3 mr-0.5" />
                       Alert: {acc.minBalanceThreshold}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => handleEdit(acc)} 
                className="p-1.5 text-slate-400 hover:text-brand-600 rounded hover:bg-white"
                title="Edit Account"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => removeAccount(acc.id)} 
                className="p-1.5 text-slate-400 hover:text-red-500 rounded hover:bg-white"
                title="Delete Account"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-slate-100">
        <div className="space-y-2 mb-2">
          <input
            type="text"
            placeholder="Account Name (e.g., Checking)"
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-2">
            <input
                type="number"
                placeholder="Initial Balance"
                className="px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={balance}
                onChange={e => setBalance(e.target.value)}
            />
            <input
                type="number"
                placeholder="Alert Threshold"
                className="px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={threshold}
                onChange={e => setThreshold(e.target.value)}
                title="Trigger alert when balance drops below this amount"
            />
          </div>
        </div>
        
        {editingId ? (
           <div className="flex gap-2">
             <button
               onClick={resetForm}
               className="flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-md text-sm font-medium transition-colors"
             >
               <X className="w-4 h-4" /> Cancel
             </button>
             <button
               onClick={handleSave}
               className="flex-1 flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white py-2 rounded-md text-sm font-medium transition-colors"
             >
               <Save className="w-4 h-4" /> Save
             </button>
           </div>
        ) : (
          <button
            onClick={handleSave}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white py-2 rounded-md text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Account
          </button>
        )}
      </div>
    </div>
  );
};