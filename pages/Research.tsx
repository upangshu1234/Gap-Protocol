
import React from 'react';
import { RESEARCH_METRICS, FEATURE_IMPORTANCE_DATA } from '../constants';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { Activity, ShieldCheck, HelpCircle, TrendingUp, AlertTriangle } from 'lucide-react';

// Tooltip component for metrics definitions
const MetricTooltip = ({ content }: { content: string }) => (
  <div className="group relative inline-block ml-1 align-middle">
    <HelpCircle className="w-3 h-3 text-slate-400 cursor-help" />
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-center font-normal normal-case">
      {content}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
    </div>
  </div>
);

export const Research: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div className="flex items-center">
          <div className="bg-indigo-600 p-3 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none mr-5">
             <Activity className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Research & Validation</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-lg">Model performance metrics and feature analysis.</p>
          </div>
        </div>
        <div className="flex items-center bg-white dark:bg-slate-800 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
            <ShieldCheck className="w-5 h-5 text-emerald-500 mr-2" />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Validated on 1,000+ samples</span>
        </div>
      </div>
      
      {/* Metrics Section */}
      <div className="mb-10">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center">
            Model Comparison
            <span className="ml-3 text-xs font-normal text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full border border-slate-200 dark:border-slate-700">Test Split: 20%</span>
        </h2>
        
        <div className="bg-white dark:bg-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700 transition-colors duration-300">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-700">
              <thead className="bg-slate-50/80 dark:bg-slate-900/50">
                <tr>
                  <th className="px-6 py-5 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Model Architecture</th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Accuracy <MetricTooltip content="(TP + TN) / Total Predictions" />
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Precision <MetricTooltip content="TP / (TP + FP)" />
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Recall <MetricTooltip content="TP / (TP + FN)" />
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      F1-Score <MetricTooltip content="Harmonic Mean of Precision & Recall" />
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-100 dark:divide-slate-700">
                {RESEARCH_METRICS.map((model, idx) => {
                   const isBest = model.accuracy >= 0.99;
                   return (
                    <tr key={model.name} className={`transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-700/50 ${isBest ? 'bg-indigo-50/30 dark:bg-indigo-900/20' : ''}`}>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center">
                            <div className={`w-2.5 h-2.5 rounded-full mr-3 ${isBest ? 'bg-indigo-500 shadow-sm shadow-indigo-300 dark:shadow-none' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                            <span className={`text-sm font-bold ${isBest ? 'text-indigo-900 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'}`}>{model.name}</span>
                            {isBest && <span className="ml-2 text-[10px] bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded font-bold uppercase border border-indigo-200 dark:border-indigo-800">Best</span>}
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                          <span className={`text-sm font-mono font-medium ${isBest ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}>
                            {(model.accuracy * 100).toFixed(1)}%
                          </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{model.precision.toFixed(3)}</td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{model.recall.toFixed(3)}</td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{model.f1.toFixed(3)}</td>
                    </tr>
                   );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Confusion Matrix */}
        <div className="bg-white dark:bg-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none rounded-2xl p-8 border border-slate-100 dark:border-slate-700 flex flex-col transition-colors duration-300">
          <div className="flex justify-between items-start mb-8">
             <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Confusion Matrix</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Random Forest Classifier Performance</p>
             </div>
             <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
             </div>
          </div>
          
          <div className="flex-grow flex flex-col justify-center items-center">
            <div className="relative">
                {/* Y-Axis Label */}
                <div className="absolute -left-12 top-0 bottom-0 flex items-center justify-center">
                    <span className="-rotate-90 text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Actual Class</span>
                </div>
                
                {/* X-Axis Label */}
                <div className="absolute -top-8 left-0 right-0 text-center">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Predicted Class</span>
                </div>

                {/* The Matrix */}
                <div className="grid grid-cols-[auto_100px_100px] gap-2">
                    {/* Header Row */}
                    <div className="h-8"></div> {/* Spacer for corner */}
                    <div className="flex items-center justify-center h-8 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700 rounded">Low</div>
                    <div className="flex items-center justify-center h-8 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700 rounded">High</div>

                    {/* Row 1: Actual Low */}
                    <div className="flex items-center justify-end pr-3 text-xs font-bold text-slate-600 dark:text-slate-300 h-24">Low</div>
                    <div className="h-24 bg-emerald-100 dark:bg-emerald-900/30 border-2 border-emerald-200 dark:border-emerald-800 rounded-lg flex flex-col items-center justify-center transition-transform hover:scale-105 relative group">
                        <span className="text-3xl font-bold text-emerald-800 dark:text-emerald-300">169</span>
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase mt-1 opacity-60 group-hover:opacity-100">True Neg</span>
                    </div>
                    <div className="h-24 bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700 rounded-lg flex items-center justify-center text-slate-300 dark:text-slate-600 font-bold text-xl">
                        0
                    </div>

                    {/* Row 2: Actual High */}
                    <div className="flex items-center justify-end pr-3 text-xs font-bold text-slate-600 dark:text-slate-300 h-24">High</div>
                    <div className="h-24 bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700 rounded-lg flex items-center justify-center text-slate-300 dark:text-slate-600 font-bold text-xl">
                        0
                    </div>
                    <div className="h-24 bg-indigo-100 dark:bg-indigo-900/30 border-2 border-indigo-200 dark:border-indigo-800 rounded-lg flex flex-col items-center justify-center transition-transform hover:scale-105 relative group">
                        <span className="text-3xl font-bold text-indigo-800 dark:text-indigo-300">31</span>
                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase mt-1 opacity-60 group-hover:opacity-100">True Pos</span>
                    </div>
                </div>
            </div>
            
            <p className="mt-8 text-xs text-center text-slate-400 max-w-xs mx-auto">
               <strong>Note:</strong> Zero False Positives/Negatives indicates perfect separation on the specific test dataset used.
            </p>
          </div>
        </div>

        {/* Feature Importance */}
        <div className="bg-white dark:bg-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none rounded-2xl p-8 border border-slate-100 dark:border-slate-700 flex flex-col transition-colors duration-300">
           <div className="flex justify-between items-start mb-6">
             <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Feature Importance</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Gini Impurity (Mean Decrease)</p>
             </div>
             <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                <TrendingUp className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
             </div>
          </div>

          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={FEATURE_IMPORTANCE_DATA}
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis 
                    type="number" 
                    tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 500}} 
                    axisLine={false} 
                    tickLine={false}
                    domain={[0, 0.5]}
                />
                <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={100} 
                    tick={{fontSize: 11, fill: '#475569', fontWeight: 600}} 
                    axisLine={false} 
                    tickLine={false} 
                />
                <Tooltip 
                    cursor={{fill: '#f8fafc', opacity: 0.8}}
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px'}}
                    itemStyle={{color: '#1e293b', fontSize: '12px', fontWeight: 'bold'}}
                />
                <Bar 
                    dataKey="value" 
                    radius={[0, 6, 6, 0]} 
                    barSize={32}
                    animationDuration={1500}
                >
                    {FEATURE_IMPORTANCE_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index < 3 ? '#4f46e5' : '#94a3b8'} fillOpacity={index < 3 ? 1 : 0.5} />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex items-center justify-center space-x-6 text-xs text-slate-500 dark:text-slate-400">
             <div className="flex items-center">
                <div className="w-3 h-3 bg-indigo-600 rounded mr-2"></div> High Impact
             </div>
             <div className="flex items-center">
                <div className="w-3 h-3 bg-slate-400/50 rounded mr-2"></div> Low Impact
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
