
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  Loader2, 
  AlertCircle, 
  Fingerprint
} from 'lucide-react';

export const Login: React.FC = () => {
  const { login, signup, googleLogin } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (!email.includes('@')) throw new Error("That's not an email. Try harder.");
      if (password.length < 6) throw new Error("Password too short. Like your attention span.");

      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password);
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await googleLogin();
    } catch (err) {
      setError("Google rejected you. Awkward.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-inter transition-colors duration-300">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
            <div className="h-16 w-16 bg-slate-900 dark:bg-white rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/20 transform -rotate-6 transition-transform hover:rotate-0">
                <Fingerprint className="h-10 w-10 text-white dark:text-slate-900" />
            </div>
        </div>
        <h2 className="mt-8 text-center text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
          {isLogin ? 'Authenticate Identity' : 'Initialize Subject Profile'}
        </h2>
        <p className="mt-3 text-center text-sm text-slate-600 dark:text-slate-400">
          {isLogin ? "Back for more judgement?" : "Join the controlled experiment."}{' '}
          <button
            onClick={() => { setIsLogin(!isLogin); setError(null); }}
            className="font-bold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors focus:outline-none underline decoration-2 underline-offset-2"
          >
            {isLogin ? 'Create a file' : 'I exist already'}
          </button>
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-900 py-10 px-6 shadow-2xl shadow-slate-200/50 dark:shadow-none sm:rounded-3xl border border-slate-200 dark:border-slate-800 transition-colors duration-300 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                User Identifier (Email)
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-0 transition-all font-medium sm:text-sm"
                  placeholder="addict@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Secret Key
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-0 transition-all font-medium sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 dark:bg-red-950/30 p-4 animate-fadeIn border border-red-100 dark:border-red-900/50">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-bold text-red-800 dark:text-red-300">{error}</h3>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-0.5"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {isLogin ? 'Access System' : 'Submit Data'} <ArrowRight className="ml-2 w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-slate-900 text-slate-400 font-bold uppercase text-[10px] tracking-widest">Alternative Access</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full inline-flex justify-center items-center py-4 px-4 border-2 border-slate-100 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all focus:outline-none hover:border-slate-300 dark:hover:border-slate-600"
              >
                <svg className="h-5 w-5 mr-3" aria-hidden="true" viewBox="0 0 24 24">
                  <path
                    d="M12.0003 20.45c4.656 0 8.568-3.168 9.984-7.56h-9.984v-4.128h14.472c.144.744.216 1.512.216 2.304 0 7.032-4.992 12.168-12.688 12.168-7.032 0-12.72-5.688-12.72-12.72s5.688-12.72 12.72-12.72c3.384 0 6.432 1.248 8.808 3.48l-3.6 3.6c-1.272-1.224-3.096-1.992-5.208-1.992-4.248 0-7.824 2.88-9.12 6.84-1.296 3.96 1.584 8.28 5.88 8.28 2.232 0 4.152-1.128 5.232-2.832"
                    fill="currentColor"
                  />
                </svg>
                Continue with Google
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
