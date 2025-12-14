import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Users, UserPlus, Check, ChevronDown, User } from 'lucide-react';

interface Props {
  users: UserProfile[];
  currentUserId: string;
  onSwitchUser: (id: string) => void;
  onAddUser: (name: string) => void;
}

export const UserMenu: React.FC<Props> = ({ users, currentUserId, onSwitchUser, onAddUser }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newUserName, setNewUserName] = useState('');

  const currentUser = users.find(u => u.id === currentUserId);

  const handleAdd = () => {
    if (newUserName.trim()) {
      onAddUser(newUserName.trim());
      setNewUserName('');
      setIsAdding(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
      >
        <div className="bg-brand-100 text-brand-700 p-1 rounded-full">
            <User className="w-4 h-4" />
        </div>
        <span className="text-sm font-medium text-slate-700 max-w-[100px] truncate">
            {currentUser?.name || 'User'}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => { setIsOpen(false); setIsAdding(false); }}></div>
          <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-100 z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-2 border-b border-slate-100 bg-slate-50/50">
              <span className="text-xs font-semibold text-slate-500 px-2 uppercase tracking-wider">Switch Profile</span>
            </div>
            
            <div className="max-h-60 overflow-y-auto py-1">
              {users.map(user => (
                <button
                  key={user.id}
                  onClick={() => {
                    onSwitchUser(user.id);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm flex items-center justify-between hover:bg-slate-50 transition-colors group"
                >
                  <span className={`${user.id === currentUserId ? 'font-semibold text-brand-700' : 'text-slate-700'}`}>
                    {user.name}
                  </span>
                  {user.id === currentUserId && (
                    <Check className="w-4 h-4 text-brand-600" />
                  )}
                </button>
              ))}
            </div>

            <div className="border-t border-slate-100 p-2">
              {isAdding ? (
                <div className="flex gap-2 p-1">
                  <input
                    type="text"
                    autoFocus
                    placeholder="User Name"
                    className="flex-1 min-w-0 text-sm border border-slate-300 rounded px-2 py-1 focus:ring-2 focus:ring-brand-500 outline-none"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                  />
                  <button 
                    onClick={handleAdd}
                    className="bg-brand-600 text-white p-1.5 rounded hover:bg-brand-700"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsAdding(true)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Add New Profile</span>
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};