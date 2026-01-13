
import React from 'react';
import { AssessmentData, PredictionResult, AddictionLevel } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  User, 
  Printer, 
  Activity, 
  Share2, 
  BrainCircuit,
  Smartphone,
  Moon,
  Zap,
  CheckSquare,
  Sparkles,
  Terminal,
  AlertOctagon
} from 'lucide-react';
import { Chatbot } from '../components/Chatbot';

interface ResultsProps {
  data: AssessmentData;
  result: PredictionResult;
  onRetake: () => void;
}

export const Results: React.FC<ResultsProps> = ({ data, result, onRetake }) => {
  const isHighRisk = result.riskLevel === AddictionLevel.HIGH;
  const isModerate = result.riskLevel === AddictionLevel.MODERATE;
  
  const riskColor = isHighRisk ? 'text-red-600 dark:text-red-500' : isModerate ? 'text-amber-600 dark:text-amber-500' : 'text-emerald-600 dark:text-emerald-500';
  const riskBg = isHighRisk ? 'bg-red-50 dark:bg-red-950/20' : isModerate ? 'bg-amber-50 dark:bg-amber-950/20' : 'bg-emerald-50 dark:bg-emerald-950/20';
  const riskBorder = isHighRisk ? 'border-red-200 dark:border-red-900/50' : isModerate ? 'border-amber-200 dark:border-amber-900/50' : 'border-emerald-200 dark:border-emerald-900/50';

  // Data for Radar Chart (User vs "Healthy" Thresholds)
  const radarData = [
    { subject: 'Screen Time', user: data.dailyScreenTimeHours, threshold: 6, fullMark: 12 },
    { subject: 'Social Media', user: data.socialMediaUsageHours, threshold: 2, fullMark: 8 },
    { subject: 'Gaming', user: data.gamingAppUsageHours, threshold: 1, fullMark: 6 },
    { subject: 'Productivity', user: data.productivityAppUsageHours, threshold: 4, fullMark: 10 },
    { subject: 'App Variety', user: Math.min(data.numberOfAppsUsed, 30), threshold: 15, fullMark: 40 },
  ];

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const aiData = result.aiAnalysis;

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 print:p-0 print:max-w-none animate-fadeIn">
      {/* Print Styles */}
      <style>{`
         @media print {
           @page { margin: 15mm 15mm 15mm 15mm; size: A4 portrait; }
           body { 
             -webkit-print-color-adjust: exact !important; 
             print-color-adjust: exact !important; 
             background-color: white !important; 
             font-family: 'Inter', sans-serif; 
           }
           .no-print { display: none !important; }
           .print-break-inside-avoid { break-inside: avoid; page-break-inside: avoid; }
           .print-shadow-none { shadow: none !important; box-shadow: none !important; border: none !important; }
           .print-text-black { color: black !important; }
           .print-bg-white { background-color: white !important; }
           .print-border-simple { border: 1px solid #cbd5e1 !important; }
           
           /* Force layout stability */
           .grid-cols-1 { display: grid; }
           .md\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
           .md\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
           .lg\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
           
           /* Chart Visibility */
           .recharts-wrapper { width: 100% !important; height: auto !important; }
           
           /* Footer Positioning */
           .report-footer { position: fixed; bottom: 0; left: 0; width: 100%; text-align: center; font-size: 9px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 5px; }
         }
      `}</style>

      {/* Action Header (Web Only) */}
      <div className="md:flex md:items-center md:justify-between mb-8 no-print">
        <div className="flex-1 min-w-0">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
            The Damage Report
          </h2>
          <p className="mt-1 text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Analysis Complete. It's not looking good.</p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
          <button
            onClick={onRetake}
            className="inline-flex items-center px-5 py-2.5 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none transition-all"
          >
            <RefreshCw className="-ml-1 mr-2 h-4 w-4 text-slate-500 dark:text-slate-400" />
            Try Again
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center px-5 py-2.5 border border-transparent rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 focus:outline-none transition-all hover:-translate-y-0.5"
          >
            <Printer className="-ml-1 mr-2 h-4 w-4" />
            Export Shame
          </button>
        </div>
      </div>

      {/* Report Container */}
      <div className="bg-white dark:bg-slate-950 shadow-2xl shadow-slate-200/50 dark:shadow-none rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 print-shadow-none print:rounded-none print:border-0 print:w-full transition-colors duration-300">
        
        {/* Report Header */}
        <div className="bg-slate-50 dark:bg-slate-900 px-8 py-8 border-b border-slate-200 dark:border-slate-800 print:bg-white print:px-0 print:py-4 print:border-b-4 print:border-slate-900 transition-colors duration-300">
          <div className="flex justify-between items-end">
            <div>
               <div className="flex items-center text-indigo-600 dark:text-indigo-400 mb-3 print:text-black">
                  <Terminal className="w-6 h-6 mr-2" />
                  <span className="text-sm font-black tracking-widest uppercase">GAP <span className="text-slate-400 dark:text-slate-600 font-bold">Protocol</span></span>
               </div>
              <h1 className="text-4xl font-black text-slate-900 dark:text-white print:text-4xl print:text-black leading-none tracking-tight">
                Subject Analysis
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-3 font-bold uppercase tracking-[0.2em] print:text-slate-600">
                Automated Behavioral Judgment System v2.1
              </p>
            </div>
            <div className="text-right">
              <div className="inline-block px-4 py-1.5 rounded-md text-[10px] font-black bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700 mb-2 print:border-black print:text-black print:bg-transparent uppercase tracking-widest">
                Confidential
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white print:text-black">{currentDate}</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-600 print:text-slate-600 font-mono mt-1">CASE ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
            </div>
          </div>
        </div>

        <div className="p-8 md:p-12 print:p-0 print:pt-6">
          
          {/* Executive Summary Section */}
          <div className="mb-12 print-break-inside-avoid">
             <h2 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6 border-b border-slate-100 dark:border-slate-800 pb-4 print:text-black print:border-slate-300 flex items-center">
                <AlertOctagon className="w-4 h-4 mr-2" />
                Executive Summary
             </h2>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:gap-8">
                {/* Subject Profile */}
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 print:bg-white print:border print:border-slate-300 print:rounded-lg transition-colors duration-300">
                   <div className="flex items-center mb-6 text-indigo-600 dark:text-indigo-400 print:text-black">
                     <User className="w-5 h-5 mr-3" />
                     <h3 className="font-bold text-slate-900 dark:text-white print:text-black uppercase text-sm tracking-wider">Subject Profile</h3>
                   </div>
                   <dl className="space-y-4 text-sm">
                     <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2 border-dashed">
                       <dt className="text-slate-500 dark:text-slate-400 font-medium">Age Group</dt>
                       <dd className="font-bold text-slate-900 dark:text-white">{data.age} years</dd>
                     </div>
                     <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2 border-dashed">
                       <dt className="text-slate-500 dark:text-slate-400 font-medium">Gender</dt>
                       <dd className="font-bold text-slate-900 dark:text-white">{data.gender}</dd>
                     </div>
                     <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2 border-dashed">
                       <dt className="text-slate-500 dark:text-slate-400 font-medium">Location</dt>
                       <dd className="font-bold text-slate-900 dark:text-white">{data.location}</dd>
                     </div>
                     <div className="flex justify-between pt-1">
                       <dt className="text-slate-500 dark:text-slate-400 font-medium">Daily Wasted Time</dt>
                       <dd className="font-bold text-slate-900 dark:text-white">{data.totalAppUsageHours} hrs</dd>
                     </div>
                   </dl>
                </div>

                {/* Risk Classification */}
                <div className={`md:col-span-2 rounded-2xl p-8 border ${riskBorder} ${riskBg} print:bg-white print:border print:border-slate-300 print:rounded-lg transition-colors duration-300 relative overflow-hidden`}>
                   <div className="relative z-10 flex items-start h-full">
                      <div className="flex-shrink-0 mr-8 mt-1">
                         {isHighRisk ? <AlertTriangle className="h-16 w-16 text-red-600 dark:text-red-500 print:text-black" /> : <CheckCircle className="h-16 w-16 text-emerald-600 dark:text-emerald-500 print:text-black" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-4">
                           <div>
                               <h3 className="text-xs font-black opacity-60 uppercase tracking-widest mb-1 text-slate-900 dark:text-slate-200">Final Verdict</h3>
                               <h2 className={`text-4xl font-black ${riskColor} tracking-tight print:text-black uppercase`}>{result.riskLevel}</h2>
                           </div>
                           <div className="text-right">
                               <span className="block text-4xl font-black text-slate-900 dark:text-white print:text-black">{(result.probability * 100).toFixed(0)}%</span>
                               <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold tracking-widest">Certainty</span>
                           </div>
                        </div>
                        
                        <div className="pt-6 border-t border-black/5 dark:border-white/10">
                            <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium print:text-black">
                                {aiData ? aiData.risk_level_explanation : `The predictive model (Random Forest Ensemble) suggests you are ${result.probability > 0.5 ? 'deeply cooked' : 'surprisingly functional'} regarding gadget dependency.`}
                            </p>
                            {(result.anomalyDetected || (aiData && aiData.anomaly_explanation)) && (
                              <div className="mt-4 text-sm bg-white/50 dark:bg-black/20 p-4 rounded-xl border border-black/5 dark:border-white/5 print:border-slate-200 flex items-start">
                                <AlertTriangle className="w-5 h-5 mr-3 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5"/> 
                                <div>
                                    <span className="font-bold text-red-700 dark:text-red-300 print:text-black block mb-1">
                                      Statistical Anomaly Detected
                                    </span>
                                    <span className="text-slate-600 dark:text-slate-400 print:text-black leading-relaxed">
                                      {aiData ? aiData.anomaly_explanation : "Your usage patterns are weird even for our generous baselines."}
                                    </span>
                                </div>
                              </div>
                            )}
                        </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          {/* AI Analysis Summary */}
          {aiData && (
             <div className="mb-12 print-break-inside-avoid">
               <div className="bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl p-8 print:bg-white print:border-slate-300 transition-colors duration-300 relative">
                  <div className="absolute top-0 left-0 bg-indigo-500 text-white text-[10px] font-bold px-3 py-1 rounded-br-lg rounded-tl-xl uppercase tracking-widest">AI Roast</div>
                  <h3 className="text-lg font-black text-indigo-900 dark:text-indigo-200 mb-4 flex items-center print:text-black mt-2">
                     <Sparkles className="w-5 h-5 mr-3 text-indigo-500 dark:text-indigo-400 print:text-black"/> 
                     The Algorithm's Opinion
                  </h3>
                  <p className="text-base text-slate-700 dark:text-slate-300 leading-loose print:text-black font-medium border-l-4 border-indigo-300 dark:border-indigo-700 pl-6 italic">
                    "{aiData.summary}"
                  </p>
               </div>
             </div>
          )}

          {/* Visualization Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12 print-break-inside-avoid print:gap-8 print:mb-8">
            {/* Radar */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm print:border print:border-slate-300 print:shadow-none print:rounded-lg transition-colors duration-300 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center print:text-black uppercase text-sm tracking-wider">
                        <Activity className="w-4 h-4 mr-2 text-indigo-500 dark:text-indigo-400 print:text-black" />
                        Dimensional Breakdown
                    </h3>
                </div>
                <div className="h-72 w-full flex-grow">
                    <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                        <PolarGrid stroke="#e2e8f0" strokeOpacity={0.5} />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }} />
                        <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} />
                        <Radar name="You" dataKey="user" stroke="#6366f1" strokeWidth={3} fill="#6366f1" fillOpacity={0.2} />
                        <Radar name="Normal Human" dataKey="threshold" stroke="#10b981" strokeWidth={2} fill="#10b981" fillOpacity={0.1} strokeDasharray="4 4" />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px', fontWeight: 600, textTransform: 'uppercase' }} />
                    </RadarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Feature Contribution */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm print:border print:border-slate-300 print:shadow-none print:rounded-lg transition-colors duration-300 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center print:text-black uppercase text-sm tracking-wider">
                        <Share2 className="w-4 h-4 mr-2 text-indigo-500 dark:text-indigo-400 print:text-black" />
                        Time Sink Analysis
                    </h3>
                </div>
                 <div className="h-72 w-full flex-grow">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={result.features} margin={{ top: 5, right: 30, left: 50, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={true} stroke="#f1f5f9" strokeOpacity={0.5} />
                      <XAxis type="number" fontSize={10} tickFormatter={(val) => `${val}h`} stroke="#94a3b8" />
                      <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 10, fill: '#64748b', fontWeight: 700}} stroke="#94a3b8" />
                      <Tooltip 
                        cursor={{fill: '#f8fafc', opacity: 0.1}} 
                        contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', background: '#1e293b', color: '#fff'}}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Bar dataKey="value" name="Hours Wasted" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20}>
                        <Cell fill="#3b82f6" />
                        <Cell fill="#8b5cf6" />
                        <Cell fill="#ec4899" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
               </div>
            </div>
          </div>

          {/* AI Recommendations Grid */}
          <div className="mb-12 print-break-inside-avoid">
             <h2 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-8 border-b border-slate-100 dark:border-slate-800 pb-4 print:text-black print:border-slate-300 flex items-center">
               <Zap className="w-4 h-4 mr-2" />
               {aiData ? 'Mandatory Interventions' : 'Clinical Suggestions'}
             </h2>
             
             {aiData && aiData.recommendations ? (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Usage Control */}
                 <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm print:shadow-none print:border-slate-300 transition-colors duration-300 hover:border-indigo-300 dark:hover:border-indigo-800 group">
                   <h3 className="text-sm font-black text-indigo-700 dark:text-indigo-400 mb-4 flex items-center print:text-black uppercase tracking-wide">
                     <Smartphone className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" /> Usage Control
                   </h3>
                   <ul className="space-y-3">
                     {(aiData.recommendations.usage_control || []).map((rec, i) => (
                       <li key={i} className="text-sm text-slate-600 dark:text-slate-300 flex items-start print:text-black font-medium">
                         <span className="mr-3 text-indigo-400 font-bold">0{i+1}.</span> {rec}
                       </li>
                     ))}
                   </ul>
                 </div>

                 {/* Sleep Hygiene */}
                 <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm print:shadow-none print:border-slate-300 transition-colors duration-300 hover:border-indigo-300 dark:hover:border-indigo-800 group">
                   <h3 className="text-sm font-black text-indigo-700 dark:text-indigo-400 mb-4 flex items-center print:text-black uppercase tracking-wide">
                     <Moon className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" /> Sleep Hygiene
                   </h3>
                   <ul className="space-y-3">
                     {(aiData.recommendations.sleep_hygiene || []).map((rec, i) => (
                       <li key={i} className="text-sm text-slate-600 dark:text-slate-300 flex items-start print:text-black font-medium">
                         <span className="mr-3 text-indigo-400 font-bold">0{i+1}.</span> {rec}
                       </li>
                     ))}
                   </ul>
                 </div>

                 {/* Productivity */}
                 <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm print:shadow-none print:border-slate-300 transition-colors duration-300 hover:border-indigo-300 dark:hover:border-indigo-800 group">
                   <h3 className="text-sm font-black text-indigo-700 dark:text-indigo-400 mb-4 flex items-center print:text-black uppercase tracking-wide">
                     <Zap className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" /> Focus Protocols
                   </h3>
                   <ul className="space-y-3">
                     {(aiData.recommendations.productivity_focus || []).map((rec, i) => (
                       <li key={i} className="text-sm text-slate-600 dark:text-slate-300 flex items-start print:text-black font-medium">
                         <span className="mr-3 text-indigo-400 font-bold">0{i+1}.</span> {rec}
                       </li>
                     ))}
                   </ul>
                 </div>

                 {/* Mental Wellbeing */}
                 <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm print:shadow-none print:border-slate-300 transition-colors duration-300 hover:border-indigo-300 dark:hover:border-indigo-800 group">
                   <h3 className="text-sm font-black text-indigo-700 dark:text-indigo-400 mb-4 flex items-center print:text-black uppercase tracking-wide">
                     <BrainCircuit className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" /> Mental Patching
                   </h3>
                   <ul className="space-y-3">
                     {(aiData.recommendations.mental_wellbeing || []).map((rec, i) => (
                       <li key={i} className="text-sm text-slate-600 dark:text-slate-300 flex items-start print:text-black font-medium">
                         <span className="mr-3 text-indigo-400 font-bold">0{i+1}.</span> {rec}
                       </li>
                     ))}
                   </ul>
                 </div>
               </div>
             ) : (
               // Fallback Legacy Recommendations
               <div className="bg-indigo-50 dark:bg-indigo-950/20 rounded-2xl p-8 border border-indigo-100 dark:border-indigo-900/30 print:bg-white print:border print:border-slate-300 print:rounded-lg">
                  <ul className="space-y-3">
                     {result.recommendations.map((rec, idx) => (
                       <li key={idx} className="flex items-start">
                         <span className="flex-shrink-0 h-6 w-6 rounded-lg bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-black mt-0.5 print:border print:border-slate-400 print:text-black print:bg-white">
                           {idx + 1}
                         </span>
                         <span className="ml-4 text-sm text-slate-800 dark:text-slate-200 font-bold print:text-black">{rec}</span>
                       </li>
                     ))}
                  </ul>
               </div>
             )}
          </div>

          {/* Daily Action Plan (AI Only) */}
          {aiData && aiData.recommendations && (
            <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl p-8 border border-emerald-100 dark:border-emerald-900/30 print:bg-white print:border print:border-slate-300 print:rounded-lg mb-8 print-break-inside-avoid">
               <h3 className="text-sm font-black text-emerald-900 dark:text-emerald-400 mb-6 flex items-center print:text-black uppercase tracking-wide">
                  <CheckSquare className="w-4 h-4 mr-2" /> Immediate Action Plan
               </h3>
               <div className="space-y-3">
                 {(aiData.recommendations.daily_action_plan || []).map((plan, i) => (
                   <div key={i} className="flex items-start bg-white dark:bg-slate-900 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/30 shadow-sm print:shadow-none print:border-slate-200">
                      <div className="flex-shrink-0 h-5 w-5 rounded border-2 border-emerald-400 dark:border-emerald-600 mr-4 mt-0.5 print:border-black flex items-center justify-center">
                          {i === 0 && <div className="w-2.5 h-2.5 bg-emerald-400 rounded-sm"></div>}
                      </div>
                      <p className="text-sm text-slate-800 dark:text-slate-200 font-bold print:text-black">{plan}</p>
                   </div>
                 ))}
               </div>
               <p className="mt-6 text-xs text-emerald-800 dark:text-emerald-500 font-bold uppercase tracking-widest print:text-black flex items-center">
                  <Terminal className="w-3 h-3 mr-2" /> Tracking Protocol: {aiData.progress_tracking_tip}
               </p>
            </div>
          )}
          
        </div>

        {/* Footer */}
        <div className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 px-8 py-8 print:hidden transition-colors duration-300">
           <p className="text-[10px] text-slate-400 text-center leading-relaxed max-w-2xl mx-auto font-medium">
             <strong>LEGAL DISCLAIMER:</strong> {aiData ? aiData.disclaimer : "This system is an automated judgment engine. It is not a doctor, therapist, or friend. If you are actually suffering, please seek professional help instead of listening to a Javascript algorithm."}
           </p>
        </div>
        
        {/* Print Only Footer */}
        <div className="hidden print:block report-footer">
            Generated by GAP Protocol v2.0 | {currentDate} | Page 1 of 1
        </div>
      </div>
      
      {/* AI Chatbot - accessible from Results page */}
      <Chatbot />
    </div>
  );
};
