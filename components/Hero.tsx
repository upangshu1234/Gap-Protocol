
import React, { useEffect, useState } from 'react';
import { ArrowRight, ShieldAlert, Cpu, Activity, Skull, Zap, BarChart3, Fingerprint, Loader2 } from 'lucide-react';
import { getLatestProgress } from '../services/storageService';
import { useAuth } from '../contexts/AuthContext';
import { ProgressEntry } from '../types';

interface HeroProps {
  onStart: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStart }) => {
  const { user } = useAuth();
  const [lastProgress, setLastProgress] = useState<ProgressEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      if (user?.id) {
        try {
          const progress = await getLatestProgress(user.id);
          setLastProgress(progress);
        } catch (error) {
          console.error("Failed to fetch progress", error);
        }
      }
      setLoading(false);
    };

    fetchProgress();
  }, [user]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950 transition-colors duration-300 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn">
        
        {/* Welcome Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-32 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:bg-indigo-500/10 transition-all duration-700"></div>
                <div className="relative z-10">
                    <div className="inline-flex items-center space-x-2 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-6 border border-indigo-100 dark:border-indigo-900/50">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                        </span>
                        System Online
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4 leading-tight">
                        Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">Addict</span>.
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
                        Ready to quantify how much of your life you've wasted on a 6-inch screen today? The algorithms are eager to judge you.
                    </p>
                    
                    <div className="mt-10 flex flex-col sm:flex-row gap-4">
                        <button 
                            onClick={onStart}
                            className="inline-flex items-center justify-center px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold text-lg hover:translate-y-[-2px] hover:shadow-2xl transition-all duration-300"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (lastProgress ? "Re-Assess Damage" : "Start Diagnostics")}
                            {!loading && <ArrowRight className="ml-2 w-5 h-5" />}
                        </button>
                        <button 
                            onClick={() => window.open('https://github.com/google/genai', '_blank')}
                            className="inline-flex items-center justify-center px-8 py-4 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-2 border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-300"
                        >
                            Read Specs
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Stats / Roast Card */}
            <div className="bg-slate-900 dark:bg-black rounded-3xl p-8 text-white relative overflow-hidden flex flex-col justify-between border border-slate-800">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-600 rounded-full blur-[80px] opacity-20"></div>
                
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                        <Cpu className="w-8 h-8 text-indigo-400" />
                        <span className="text-xs font-mono text-slate-400">CPU: 12% // HUMAN: 0%</span>
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-2">Global Status</h3>
                    <div className="space-y-4">
                        <div className="bg-white/5 rounded-xl p-4 border border-white/10 backdrop-blur-sm">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-slate-400">Average Screen Time</span>
                                <span className="text-red-400 font-mono font-bold">6h 42m</span>
                            </div>
                            <div className="w-full bg-white/10 rounded-full h-1.5">
                                <div className="bg-red-500 h-1.5 rounded-full" style={{width: '78%'}}></div>
                            </div>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4 border border-white/10 backdrop-blur-sm">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-slate-400">Dopamine Levels</span>
                                <span className="text-amber-400 font-mono font-bold">CRITICAL</span>
                            </div>
                            <div className="w-full bg-white/10 rounded-full h-1.5">
                                <div className="bg-amber-500 h-1.5 rounded-full" style={{width: '25%'}}></div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="relative z-10 mt-6 pt-6 border-t border-white/10">
                    <p className="text-xs text-slate-400 italic">
                        "Your phone misses you. It's been 3 minutes."
                    </p>
                </div>
            </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
                { 
                    icon: <ShieldAlert className="w-6 h-6 text-red-500" />, 
                    title: "Risk Analysis", 
                    desc: "We calculate exactly how doomed you are.",
                    color: "hover:border-red-500/50 hover:shadow-red-500/10"
                },
                { 
                    icon: <Fingerprint className="w-6 h-6 text-emerald-500" />, 
                    title: "Behavioral ID", 
                    desc: "Profiling your inability to focus.",
                    color: "hover:border-emerald-500/50 hover:shadow-emerald-500/10"
                },
                { 
                    icon: <BarChart3 className="w-6 h-6 text-purple-500" />, 
                    title: "Trend Tracking", 
                    desc: "Watch the graph go up. Feel bad.",
                    color: "hover:border-purple-500/50 hover:shadow-purple-500/10"
                },
                { 
                    icon: <Zap className="w-6 h-6 text-amber-500" />, 
                    title: "AI Interventions", 
                    desc: "Advice you'll definitely ignore.",
                    color: "hover:border-amber-500/50 hover:shadow-amber-500/10"
                }
            ].map((feature, idx) => (
                <div key={idx} className={`bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 transition-all duration-300 ${feature.color} hover:-translate-y-1 group`}>
                    <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        {feature.icon}
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                        {feature.desc}
                    </p>
                </div>
            ))}
        </div>

        {/* Last Result Banner */}
        {!loading && lastProgress && (
            <div className="bg-gradient-to-r from-slate-900 to-indigo-900 rounded-3xl p-8 relative overflow-hidden flex items-center justify-between animate-fadeIn">
                <div className="relative z-10">
                    <h2 className="text-2xl font-bold text-white mb-2">Previous Assessment Found</h2>
                    <p className="text-indigo-200">
                        Date: {new Date(lastProgress.timestamp).toLocaleDateString()} // Result: <span className="font-bold text-white uppercase">{lastProgress.progress_payload.result.riskLevel}</span>
                    </p>
                </div>
                <div className="relative z-10">
                     <button onClick={onStart} className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-bold backdrop-blur-md transition-all border border-white/10">
                        View History
                     </button>
                </div>
                <Skull className="absolute -right-12 -bottom-12 w-64 h-64 text-white/5 rotate-12" />
            </div>
        )}

      </div>
    </div>
  );
};
