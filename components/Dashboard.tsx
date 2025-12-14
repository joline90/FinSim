import React, { useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Account, SimulationResult } from '../types';
import { Table, TrendingUp, TrendingDown, Bot, AlertTriangle } from 'lucide-react';

interface Props {
  simulation: SimulationResult;
  accounts: Account[];
  onAnalyze: () => void;
  isAnalyzing: boolean;
  aiAdvice: string | null;
}

export const Dashboard: React.FC<Props> = ({ simulation, accounts, onAnalyze, isAnalyzing, aiAdvice }) => {
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
  
  const formatCurrency = (val: number) => `$${val.toLocaleString()}`;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col h-full min-h-[500px]">
      <div className="flex flex-wrap items-center justify-between mb-4 gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Forecast (Next 24 Months)</h2>
          <p className="text-sm text-slate-500 mt-1">
             Projected Net Worth: <span className="font-semibold text-brand-600">{formatCurrency(simulation.finalNetWorth)}</span>
          </p>
        </div>
        
        <div className="flex items-center gap-2">
           <button
            onClick={onAnalyze}
            disabled={isAnalyzing}
            className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-md text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
           >
             <Bot className="w-4 h-4" />
             {isAnalyzing ? 'Analyzing...' : 'AI Advisor'}
           </button>
           <div className="h-6 w-px bg-slate-200 mx-2"></div>
           <button 
             onClick={() => setViewMode('chart')}
             className={`p-2 rounded-md transition-colors ${viewMode === 'chart' ? 'bg-brand-50 text-brand-600' : 'text-slate-400 hover:text-slate-600'}`}
           >
             <TrendingUp className="w-5 h-5" />
           </button>
           <button 
             onClick={() => setViewMode('table')}
             className={`p-2 rounded-md transition-colors ${viewMode === 'table' ? 'bg-brand-50 text-brand-600' : 'text-slate-400 hover:text-slate-600'}`}
           >
             <Table className="w-5 h-5" />
           </button>
        </div>
      </div>

      {/* Alerts Section */}
      {simulation.alerts.length > 0 && (
          <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-3 max-h-32 overflow-y-auto">
             <div className="flex items-center gap-2 mb-2 text-amber-800 font-medium text-sm sticky top-0 bg-amber-50">
                <AlertTriangle className="w-4 h-4" />
                <span>Alerts Detected ({simulation.alerts.length})</span>
             </div>
             <ul className="space-y-1">
                {simulation.alerts.map((alert, idx) => (
                    <li key={idx} className="text-xs text-amber-900 flex justify-between items-center">
                        <span>{alert.date}: <span className="font-semibold">{alert.accountName}</span> Balance {formatCurrency(alert.balance)}</span>
                        <span className="text-amber-700/70">{alert.message}</span>
                    </li>
                ))}
             </ul>
          </div>
      )}

      {aiAdvice && (
        <div className="mb-6 bg-violet-50 border border-violet-100 p-4 rounded-lg animate-fade-in">
          <div className="flex items-start gap-3">
             <Bot className="w-6 h-6 text-violet-600 mt-1 shrink-0" />
             <div className="prose prose-sm prose-violet max-w-none text-slate-700">
               {/* Simple markdown rendering for safety */}
               {aiAdvice.split('\n').map((line, i) => (
                 <p key={i} className={`mb-1 ${line.startsWith('#') ? 'font-bold text-slate-900' : ''}`}>
                   {line.replace(/^#+\s/, '').replace(/\*\*/g, '')}
                 </p>
               ))}
             </div>
          </div>
        </div>
      )}

      <div className="flex-1 min-h-0">
        {viewMode === 'chart' ? (
          <div className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={simulation.eventData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                    dataKey="date" 
                    tickFormatter={(tick) => tick.slice(5)} 
                    stroke="#64748b"
                    fontSize={12}
                    tickMargin={10}
                    minTickGap={30}
                />
                <YAxis 
                    stroke="#64748b" 
                    fontSize={12}
                    tickFormatter={(val) => `$${(val/1000).toFixed(0)}k`}
                />
                <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => formatCurrency(value)}
                    labelFormatter={(label) => `Date: ${label}`}
                />
                <Legend />
                <Line 
                    type="stepAfter" 
                    dataKey="total" 
                    name="Total Net Worth" 
                    stroke="#0f172a" 
                    strokeWidth={3} 
                    dot={{ r: 2 }}
                    activeDot={{ r: 6 }}
                />
                {accounts.map(acc => (
                  <Line
                    key={acc.id}
                    type="stepAfter"
                    dataKey={acc.id}
                    name={acc.name}
                    stroke={acc.color}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-full overflow-auto border rounded-lg border-slate-200">
             <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-slate-50 text-slate-600 font-medium sticky top-0 z-10 shadow-sm">
                    <tr>
                        <th className="px-4 py-3 border-b border-slate-200 w-32">Date</th>
                        <th className="px-4 py-3 border-b border-slate-200">Activity</th>
                        <th className="px-4 py-3 border-b border-slate-200 text-right">Amount</th>
                        <th className="px-4 py-3 border-b border-slate-200 text-right bg-slate-50/80">Net Worth</th>
                        {accounts.map(acc => (
                            <th key={acc.id} className="px-4 py-3 border-b border-slate-200 text-right whitespace-nowrap" style={{ color: acc.color }}>
                                {acc.name}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {simulation.eventData.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-4 py-3 text-slate-600 whitespace-nowrap align-top">{row.date}</td>
                            
                            {/* Activity Column */}
                            <td className="px-4 py-3 text-slate-700 align-top">
                                {row.events && row.events.length > 0 ? (
                                    <div className="flex flex-col gap-1">
                                        {row.events.map((evt, i) => (
                                            <div key={i} className="text-xs font-medium truncate" title={evt.name}>
                                                {evt.name}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <span className="text-slate-300 text-xs italic">-</span>
                                )}
                            </td>

                            {/* Amount Column */}
                            <td className="px-4 py-3 text-right align-top">
                                {row.events && row.events.length > 0 ? (
                                    <div className="flex flex-col gap-1">
                                        {row.events.map((evt, i) => (
                                            <div key={i} className={`text-xs font-mono font-medium ${evt.amount >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                                {evt.amount > 0 ? '+' : ''}{evt.amount.toLocaleString()}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <span className="text-slate-300 text-xs">-</span>
                                )}
                            </td>

                            <td className="px-4 py-3 text-right font-medium text-slate-900 bg-slate-50/30 align-top">
                                {formatCurrency(row.total)}
                            </td>
                            {accounts.map(acc => (
                                <td key={acc.id} className="px-4 py-3 text-right text-slate-500 align-top">
                                    {row[acc.id] !== undefined ? formatCurrency(row[acc.id] as number) : '-'}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
             </table>
          </div>
        )}
      </div>
    </div>
  );
};