
import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Assessment } from './pages/Assessment';
import { Results } from './pages/Results';
import { Research } from './pages/Research';
import { Login } from './pages/Login';
import { AssessmentData, PredictionResult } from './types';
import { saveProgress } from './services/storageService';
import { Loader2 } from 'lucide-react';

// Wrapper component to handle Auth State logic
const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null);
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="h-10 w-10 text-indigo-600 dark:text-indigo-400 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const handleStartAssessment = () => {
    setCurrentPage('assessment');
  };

  const handleAssessmentComplete = async (data: AssessmentData, result: PredictionResult) => {
    // 1. Update Local State for UI immediately
    setAssessmentData(data);
    setPredictionResult(result);
    setCurrentPage('results');
    
    // 2. Persist to Supabase
    if (user && user.id) {
        try {
            await saveProgress(user.id, data, result);
            console.log("Progress saved successfully for user:", user.id);
        } catch (error) {
            console.error("Failed to save progress:", error);
        }
    }
  };

  const handleRetake = () => {
    setAssessmentData(null);
    setPredictionResult(null);
    setCurrentPage('assessment');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Hero onStart={handleStartAssessment} />;
      case 'assessment':
        return <Assessment onComplete={handleAssessmentComplete} />;
      case 'results':
        return assessmentData && predictionResult ? (
          <Results 
            data={assessmentData} 
            result={predictionResult} 
            onRetake={handleRetake} 
          />
        ) : (
          <Hero onStart={handleStartAssessment} />
        );
      case 'research':
        return <Research />;
      default:
        return <Hero onStart={handleStartAssessment} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-300">
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main className="flex-grow">
        {renderPage()}
      </main>
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-8 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center flex-col md:flex-row gap-4">
            <p className="text-slate-400 text-sm">© 2024 Gadget Addiction Analytics. Academic License.</p>
            <div className="flex space-x-4">
                <span className="text-slate-400 text-sm cursor-pointer hover:text-slate-600 dark:hover:text-slate-300">Privacy Policy</span>
                <span className="text-slate-400 text-sm cursor-pointer hover:text-slate-600 dark:hover:text-slate-300">Terms of Service</span>
            </div>
        </div>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
