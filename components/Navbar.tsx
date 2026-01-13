
import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Activity, FileText, BrainCircuit, LogOut, User as UserIcon, Moon, Sun, Terminal } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface NavbarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, setCurrentPage }) => {
  const { user, logout } = useAuth();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
      setIsDark(true);
    }
  };
  
  const navItems = [
    { id: 'home', label: 'Command Center', icon: <Terminal size={16} /> },
    { id: 'assessment', label: 'Confess Sins', icon: <FileText size={16} /> },
    { id: 'research', label: 'The Data', icon: <BrainCircuit size={16} /> },
  ];

  return (
    <nav className="bg-white/90 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50 print:hidden dark:bg-slate-950/90 dark:border-slate-800 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center cursor-pointer group" onClick={() => setCurrentPage('home')}>
            <div className="bg-indigo-600 p-2 rounded-lg group-hover:rotate-12 transition-transform duration-300">
               <Activity className="h-5 w-5 text-white" />
            </div>
            <span className="ml-3 text-lg font-black text-slate-900 dark:text-white tracking-tighter uppercase">
              GAP <span className="text-indigo-600 dark:text-indigo-400">Protocol</span>
            </span>
            <span className="hidden lg:inline-flex ml-3 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-400 border border-slate-200 dark:border-slate-800 uppercase tracking-widest">
              v2.0.4 // Judging You
            </span>
          </div>
          
          <div className="flex items-center space-x-2 md:space-x-8">
            <div className="hidden md:flex space-x-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`relative px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 flex items-center ${
                    currentPage === item.id
                      ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 dark:text-indigo-400 shadow-sm ring-1 ring-indigo-500/10'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="mr-2 opacity-75">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
            
            <div className="flex items-center border-l border-slate-200 pl-4 md:pl-8 ml-2 dark:border-slate-800">
              <button
                onClick={toggleTheme}
                className="p-2.5 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-yellow-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all mr-2"
                title={isDark ? "Switch to Blinding Mode" : "Switch to Hacker Mode"}
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              <div className="hidden md:flex flex-col items-end mr-4 text-right">
                 <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                    {user?.name || 'Subject #4829'}
                 </span>
                 <span className="text-[10px] text-slate-500 dark:text-slate-500 font-mono">
                    {user?.provider === 'google' ? 'OAUTH_VERIFIED' : 'LOCAL_USER'}
                 </span>
              </div>
              <button 
                onClick={logout}
                className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 dark:hover:text-red-400 rounded-lg transition-all"
                title="Abort Session"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation Tabs */}
      <div className="md:hidden border-t border-slate-200 dark:border-slate-800 flex justify-around bg-white/95 dark:bg-slate-950/95 backdrop-blur-md">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`flex-1 py-4 flex flex-col items-center justify-center text-[10px] font-bold uppercase tracking-wide transition-colors ${
                 currentPage === item.id 
                 ? 'text-indigo-600 dark:text-indigo-400 border-t-2 border-indigo-600 dark:border-indigo-400 bg-indigo-50/20 dark:bg-indigo-900/10' 
                 : 'text-slate-400 dark:text-slate-500 border-t-2 border-transparent'
              }`}
            >
               {item.icon}
               <span className="mt-1">{item.label}</span>
            </button>
          ))}
      </div>
    </nav>
  );
};
