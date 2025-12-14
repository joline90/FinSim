import React, { useState, useEffect, useRef } from 'react';
import { Account, RecurringItem, OneTimeTransaction, SimulationResult, UserProfile } from './types';
import { runSimulation } from './services/simulator';
import { analyzeFinancialPlan } from './services/geminiService';
import { loadUsers, saveUsers, createEmptyUser } from './services/storage';
import { AccountList } from './components/AccountList';
import { RecurringList } from './components/RecurringList';
import { Dashboard } from './components/Dashboard';
import { UserMenu } from './components/UserMenu';
import { LayoutDashboard } from 'lucide-react';

const App: React.FC = () => {
  // Master State
  const [users, setUsers] = useState<UserProfile[]>(() => loadUsers());
  const [currentUserId, setCurrentUserId] = useState<string>(() => users[0]?.id || '');
  
  // Initialize Workspace State from the current user
  const initialUser = users.find(u => u.id === currentUserId) || users[0];
  
  // Workspace State (Active Editing)
  const [accounts, setAccounts] = useState<Account[]>(initialUser.accounts);
  const [items, setItems] = useState<RecurringItem[]>(initialUser.recurringItems);
  const [oneTimeTransactions, setOneTimeTransactions] = useState<OneTimeTransaction[]>(initialUser.oneTimeTransactions);
  
  // Simulation State
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);

  // Use a ref to prevent sync loop during user switching
  const isSwitchingUser = useRef(false);

  // 1. Run Simulation whenever data changes
  useEffect(() => {
    const result = runSimulation(accounts, items, oneTimeTransactions);
    setSimulation(result);
  }, [accounts, items, oneTimeTransactions]);

  // 2. Sync Workspace Data -> Master User List (Auto-save)
  useEffect(() => {
    if (isSwitchingUser.current) return;

    setUsers(prevUsers => {
      const updatedUsers = prevUsers.map(user => {
        if (user.id === currentUserId) {
          return {
            ...user,
            accounts,
            recurringItems: items,
            oneTimeTransactions
          };
        }
        return user;
      });
      // Persist to local storage
      saveUsers(updatedUsers);
      return updatedUsers;
    });
  }, [accounts, items, oneTimeTransactions, currentUserId]);

  // 3. Handle User Switching
  const handleSwitchUser = (userId: string) => {
    const targetUser = users.find(u => u.id === userId);
    if (targetUser) {
      isSwitchingUser.current = true;
      // Clear AI advice for new user context
      setAiAdvice(null);
      
      // Update workspace
      setAccounts(targetUser.accounts);
      setItems(targetUser.recurringItems);
      setOneTimeTransactions(targetUser.oneTimeTransactions);
      setCurrentUserId(userId);
      
      // Allow sync to resume after render cycle
      setTimeout(() => {
        isSwitchingUser.current = false;
      }, 0);
    }
  };

  // 4. Handle Add User
  const handleAddUser = (name: string) => {
    const newUser = createEmptyUser(name);
    // Add to master list immediately
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    saveUsers(updatedUsers);
    
    // Switch to new user
    handleSwitchUser(newUser.id);
  };

  const handleAnalyze = async () => {
    if (!simulation) return;
    setIsAnalyzing(true);
    setAiAdvice(null);
    const advice = await analyzeFinancialPlan(accounts, items, simulation);
    setAiAdvice(advice);
    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-brand-600 text-white p-1.5 rounded-lg">
                <LayoutDashboard className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">FinSim <span className="text-slate-400 font-normal text-sm ml-1">Personal Finance Simulator</span></h1>
            </div>
            
            <div className="flex items-center gap-4">
              <UserMenu 
                users={users} 
                currentUserId={currentUserId} 
                onSwitchUser={handleSwitchUser} 
                onAddUser={handleAddUser}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-8rem)] min-h-[800px]">
          
          {/* Left Sidebar: Controls */}
          <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-6 overflow-hidden">
             <div className="flex-1 min-h-0">
               <AccountList accounts={accounts} setAccounts={setAccounts} />
             </div>
             <div className="flex-1 min-h-0">
               <RecurringList 
                  recurringItems={items} 
                  setRecurringItems={setItems}
                  oneTimeTransactions={oneTimeTransactions}
                  setOneTimeTransactions={setOneTimeTransactions}
                  accounts={accounts} 
                />
             </div>
          </div>

          {/* Right Main Area: Visualization */}
          <div className="lg:col-span-8 xl:col-span-9 h-full">
            {simulation ? (
              <Dashboard 
                simulation={simulation} 
                accounts={accounts}
                onAnalyze={handleAnalyze}
                isAnalyzing={isAnalyzing}
                aiAdvice={aiAdvice}
              />
            ) : (
               <div className="h-full flex items-center justify-center bg-white rounded-xl border border-dashed border-slate-300">
                  <p className="text-slate-400">Calculating data...</p>
               </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;