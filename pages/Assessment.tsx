
import React, { useState, useEffect } from 'react';
import { AssessmentData } from '../types';
import { LOCATIONS } from '../constants';
import { predictAddiction } from '../services/mlService';
import { useAuth } from '../contexts/AuthContext';
import { 
  Loader2, 
  AlertCircle, 
  Check, 
  Info, 
  ChevronRight, 
  ChevronLeft, 
  User, 
  Smartphone, 
  Share2, 
  Briefcase, 
  Gamepad2,
  Clock,
  Activity,
  Save,
  RotateCcw,
  MapPin,
  Calendar,
  Hash,
  Moon,
  HeartPulse,
  Brain,
  Dumbbell,
  Smile,
  Frown,
  Meh
} from 'lucide-react';

interface AssessmentProps {
  onComplete: (data: AssessmentData, result: any) => void;
}

const INITIAL_DATA: AssessmentData = {
  age: 25,
  gender: 'Male',
  location: 'Maharashtra',
  totalAppUsageHours: 5,
  dailyScreenTimeHours: 4,
  numberOfAppsUsed: 10,
  socialMediaUsageHours: 2,
  productivityAppUsageHours: 2,
  gamingAppUsageHours: 1,
  // New Fields
  sleepHours: 7,
  anxietyLevel: 3,
  physicalActivityHours: 3,
  moodStatus: 'Neutral'
};

const DATA_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 Days
const TOTAL_STEPS = 4;

export const Assessment: React.FC<AssessmentProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<AssessmentData>(INITIAL_DATA);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  
  // Autosave State
  const [isInitialized, setIsInitialized] = useState(false);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [savedProgress, setSavedProgress] = useState<{step: number, formData: AssessmentData} | null>(null);

  // Dynamic storage key scoped to user ID
  const storageKey = user?.id ? `gap_assessment_${user.id}` : 'gap_assessment_guest';

  // Load progress on mount
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const isValidStructure = parsed.formData && parsed.step;
        const isRecent = parsed.timestamp && (Date.now() - parsed.timestamp < DATA_EXPIRY_MS);

        if (isValidStructure && isRecent) {
           // Merge saved data with initial data to ensure new fields exist
           const mergedData = { ...INITIAL_DATA, ...parsed.formData };
           setSavedProgress({ ...parsed, formData: mergedData });
           setShowResumePrompt(true);
        } else {
           localStorage.removeItem(storageKey);
        }
      } catch (e) {
        console.error("Failed to parse saved progress", e);
        localStorage.removeItem(storageKey);
      }
    }
    setIsInitialized(true);
  }, [storageKey]);

  // Autosave Effect
  useEffect(() => {
    if (!isInitialized || showResumePrompt || loading) return;

    const stateToSave = {
      step,
      formData,
      timestamp: Date.now()
    };
    
    try {
      localStorage.setItem(storageKey, JSON.stringify(stateToSave));
    } catch (e) {
      console.warn("Autosave failed", e);
    }
  }, [formData, step, showResumePrompt, loading, isInitialized, storageKey]);

  // Real-time validation effect
  useEffect(() => {
    validateStep(step, false);
  }, [formData, step]);

  const handleResume = () => {
    if (savedProgress) {
        setFormData(savedProgress.formData);
        setStep(savedProgress.step);
    }
    setShowResumePrompt(false);
  };

  const handleStartOver = () => {
    localStorage.removeItem(storageKey);
    setFormData(INITIAL_DATA);
    setStep(1);
    setTouched({});
    setShowResumePrompt(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let finalValue: string | number = value;

    if (e.target.type === 'number' || e.target.type === 'range') {
        finalValue = parseFloat(value);
        if (isNaN(finalValue)) finalValue = 0;
    }

    setFormData(prev => ({
      ...prev,
      [name]: finalValue
    }));
    
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const handleGenderSelect = (gender: string) => {
    setFormData(prev => ({ ...prev, gender }));
    setTouched(prev => ({ ...prev, gender: true }));
  };

  const handleMoodSelect = (mood: string) => {
    setFormData(prev => ({ ...prev, moodStatus: mood as any }));
  };

  const validateStep = (currentStep: number, hardCheck: boolean = true) => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (currentStep === 1) {
      if (formData.age < 5 || formData.age > 100) {
        newErrors.age = "Invalid age. Are you a toddler?";
        isValid = false;
      }
    }

    if (currentStep === 2) {
      if (formData.totalAppUsageHours < 0 || formData.totalAppUsageHours > 24) {
        newErrors.totalAppUsageHours = "Unless you're a time traveler, max is 24.";
        isValid = false;
      }
      if (formData.dailyScreenTimeHours < 0 || formData.dailyScreenTimeHours > 24) {
        newErrors.dailyScreenTimeHours = "Invalid hours.";
        isValid = false;
      }
    }

    if (currentStep === 3) {
      const totalSpecific = formData.socialMediaUsageHours + formData.productivityAppUsageHours + formData.gamingAppUsageHours;
      if (totalSpecific > 24) {
        newErrors.general = "Math is hard, but a day only has 24 hours.";
        isValid = false;
      }
    }

    if (currentStep === 4) {
       if (formData.sleepHours < 0 || formData.sleepHours > 24) {
           newErrors.sleepHours = "Lies about sleep detected.";
           isValid = false;
       }
       if (formData.anxietyLevel < 1 || formData.anxietyLevel > 10) {
           newErrors.anxietyLevel = "Scale 1-10";
           isValid = false;
       }
    }

    if (hardCheck) {
        setErrors(newErrors);
        setTouched({
            ...touched, 
            ...Object.keys(formData).reduce((acc, key) => ({...acc, [key]: true}), {})
        });
    } else {
        const visibleErrors: Record<string, string> = {};
        Object.keys(newErrors).forEach(key => {
            if (touched[key]) visibleErrors[key] = newErrors[key];
        });
        setErrors(visibleErrors);
    }
    
    return isValid && Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step, true)) {
      setStep(prev => Math.min(TOTAL_STEPS, prev + 1));
      setTouched({});
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setStep(prev => Math.max(1, prev - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    if (!validateStep(TOTAL_STEPS, true)) return;
    
    setLoading(true);
    try {
      const result = await predictAddiction(formData);
      localStorage.removeItem(storageKey);
      onComplete(formData, result);
    } catch (error) {
      console.error(error);
      alert("Error running prediction model. Even our code gave up on you.");
    } finally {
      setLoading(false);
    }
  };

  // --- UI HELPER COMPONENTS ---

  const renderInput = (
    label: string, 
    name: keyof AssessmentData, 
    type: string = "text", 
    icon?: React.ReactNode, 
    options?: string[],
    helper?: string,
    placeholder?: string
  ) => {
    const isError = !!errors[name];
    const isValid = touched[name] && !isError;

    return (
      <div className="relative group w-full">
        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 ml-1 flex justify-between items-center">
          <span>{label}</span>
          {isValid && <Check className="h-4 w-4 text-emerald-500 animate-fadeIn" />}
        </label>
        
        <div className="relative shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
            {icon}
          </div>
          
          {type === 'select' ? (
            <div className="relative">
                <select
                name={name}
                value={formData[name]}
                onChange={handleChange}
                className={`block w-full pl-11 pr-10 py-3.5 text-base bg-white dark:bg-slate-900 dark:text-white border-2 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 sm:text-sm rounded-xl transition-all duration-200 cursor-pointer appearance-none font-medium ${isError ? 'border-red-300 ring-4 ring-red-50 dark:ring-red-900/20' : 'border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500/50 focus:border-indigo-500'}`}
                >
                {options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                    <ChevronRight className="w-4 h-4 text-slate-400 rotate-90" />
                </div>
            </div>
          ) : (
             <input
              type={type}
              name={name}
              value={formData[name]}
              onChange={handleChange}
              placeholder={placeholder}
              className={`block w-full pl-11 pr-4 py-3.5 sm:text-sm rounded-xl border-2 bg-white dark:bg-slate-900 dark:text-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all duration-200 font-medium ${
                isError 
                  ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500' 
                  : 'border-slate-200 dark:border-slate-800 text-slate-900 hover:border-indigo-300 dark:hover:border-indigo-500/50 focus:border-indigo-500'
              }`}
            />
          )}
          
          {isError && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
          )}
        </div>
        
        {helper && !isError && <p className="mt-2 ml-1 text-xs text-slate-500 dark:text-slate-500 font-medium">{helper}</p>}
        {isError && <p className="mt-2 ml-1 text-xs text-red-600 dark:text-red-400 font-bold flex items-center animate-pulse"><AlertCircle className="w-3 h-3 mr-1"/> {errors[name]}</p>}
      </div>
    );
  };

  const renderSliderInput = (
    label: string, 
    name: keyof AssessmentData, 
    max: number = 24, 
    icon?: React.ReactNode, 
    themeColor: 'indigo' | 'blue' | 'green' | 'purple' | 'red' | 'amber' = 'indigo',
    unit: string = "hrs"
  ) => {
    // Dynamic styles based on theme color and dark mode
    const colorStyles = {
        indigo: { bg: 'bg-indigo-50 dark:bg-indigo-950/40', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-100 dark:border-indigo-800', fill: 'bg-indigo-600' },
        blue: { bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-100 dark:border-blue-800', fill: 'bg-blue-600' },
        green: { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-100 dark:border-emerald-800', fill: 'bg-emerald-600' },
        purple: { bg: 'bg-purple-50 dark:bg-purple-950/40', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-100 dark:border-purple-800', fill: 'bg-purple-600' },
        red: { bg: 'bg-red-50 dark:bg-red-950/40', text: 'text-red-600 dark:text-red-400', border: 'border-red-100 dark:border-red-800', fill: 'bg-red-600' },
        amber: { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-100 dark:border-amber-800', fill: 'bg-amber-600' },
    }[themeColor];

    const percentage = ((formData[name] as number) / max) * 100;

    return (
    <div className={`group relative bg-white dark:bg-slate-900 p-6 rounded-2xl border-2 shadow-sm transition-all duration-300 h-full flex flex-col justify-center ${colorStyles.border} hover:shadow-lg hover:-translate-y-0.5 hover:border-opacity-80 dark:hover:border-opacity-100`}>
       <div className="flex justify-between items-start mb-6">
         <div className="flex items-center">
            <div className={`p-3 rounded-xl ${colorStyles.bg} ${colorStyles.text} mr-3.5 shadow-sm transition-transform group-hover:scale-110`}>
                {icon}
            </div>
            <label className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-tight">
               {label}
            </label>
         </div>
         <div className={`px-3 py-1.5 rounded-lg text-sm font-bold ${colorStyles.bg} ${colorStyles.text} border ${colorStyles.border} min-w-[4rem] text-center`}>
           {formData[name]}<span className="text-xs font-normal opacity-70 ml-0.5">{unit}</span>
         </div>
       </div>
       
       <div className="space-y-4">
          <div className="relative w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full">
             <div 
               className={`absolute h-full rounded-full ${colorStyles.fill} opacity-20`} 
               style={{ width: '100%' }}
             ></div>
             <div 
               className={`absolute h-full rounded-full ${colorStyles.fill} transition-all duration-150`} 
               style={{ width: `${percentage}%` }}
             ></div>
             <input 
                type="range" 
                name={name} 
                min="0" 
                max={max} 
                step="0.5" 
                value={formData[name]}
                onChange={handleChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            {/* Custom Thumb */}
            <div 
                className={`absolute w-5 h-5 bg-white dark:bg-slate-900 border-2 ${colorStyles.border} rounded-full shadow-md pointer-events-none transition-all duration-150`}
                style={{ left: `calc(${percentage}% - 10px)`, top: '50%', transform: 'translateY(-50%)' }}
            >
                <div className={`w-2 h-2 rounded-full ${colorStyles.fill} absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2`}></div>
            </div>
          </div>
          
          <div className="flex justify-between text-xs font-medium text-slate-400 dark:text-slate-600 px-1">
             <span>0</span>
             <span>{max/2}</span>
             <span>{max}{unit === '' ? '' : '+'}</span>
          </div>
       </div>

       {errors[name] && (
         <div className="flex items-center mt-3 text-xs text-red-500 font-bold bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">
            <AlertCircle className="h-3.5 w-3.5 mr-1.5 flex-shrink-0"/>
            {errors[name]}
         </div>
       )}
    </div>
  )};

  // --- STEPS RENDERERS ---

  const renderStep1 = () => (
    <div className="space-y-8 animate-fadeIn">
      <div className="bg-gradient-to-r from-indigo-50 to-white dark:from-slate-900 dark:to-slate-950 p-8 rounded-3xl border border-indigo-100/50 dark:border-slate-800 flex items-start space-x-6 shadow-sm">
         <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl shadow-indigo-100 dark:shadow-none text-indigo-600 dark:text-indigo-400 rotate-3">
            <User className="h-8 w-8"/>
         </div>
         <div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Profile Data</h3>
            <p className="text-base text-slate-500 dark:text-slate-400 leading-relaxed mt-2">
                We need this to statistically compare you to other doomed individuals in your demographic.
            </p>
         </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
        <div>
             {renderInput("Age (Years)", "age", "number", <Calendar className="h-5 w-5"/>, undefined, "Don't lie about your age.", "e.g. 24")}
        </div>

        <div className="relative group w-full">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 ml-1">
              Gender
            </label>
            <div className="grid grid-cols-3 gap-3 p-1.5 bg-slate-100/50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                {['Male', 'Female', 'Other'].map((option) => (
                    <button
                        key={option}
                        onClick={() => handleGenderSelect(option)}
                        className={`py-3 px-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                            formData.gender === option 
                            ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-lg ring-1 ring-black/5 dark:ring-white/5 transform scale-[1.02]' 
                            : 'text-slate-500 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
                        }`}
                    >
                        {option}
                    </button>
                ))}
            </div>
        </div>

        <div className="md:col-span-2">
          {renderInput(
            "Location (State / UT)", 
            "location", 
            "select", 
            <MapPin className="h-5 w-5"/>, 
            LOCATIONS
          )}
          <p className="mt-2 text-xs text-slate-400 dark:text-slate-600 flex items-center">
            <Info className="w-3 h-3 mr-1"/>
            We track infection vectors regionally.
          </p>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-8 animate-fadeIn">
       <div className="bg-gradient-to-r from-indigo-50 to-white dark:from-slate-900 dark:to-slate-950 p-8 rounded-3xl border border-indigo-100/50 dark:border-slate-800 flex items-start space-x-6 shadow-sm">
         <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl shadow-indigo-100 dark:shadow-none text-indigo-600 dark:text-indigo-400 rotate-3">
            <Smartphone className="h-8 w-8"/>
         </div>
         <div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">The Usage Evidence</h3>
            <p className="text-base text-slate-500 dark:text-slate-400 leading-relaxed mt-2">
                Be honest. We can probably guess if you're lying based on your typing speed anyway.
            </p>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="md:col-span-2 lg:col-span-1">
             {renderSliderInput("Total App Usage (Daily)", "totalAppUsageHours", 24, <Clock className="h-5 w-5"/>, 'indigo')}
        </div>
        <div className="md:col-span-2 lg:col-span-1">
             {renderSliderInput("Active Screen Time", "dailyScreenTimeHours", 24, <Activity className="h-5 w-5"/>, 'blue')}
        </div>
        
        <div className="md:col-span-2 pt-4">
            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                     <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-slate-900 dark:text-slate-200 mb-1">
                            Unique Apps Used Daily
                        </label>
                        <p className="text-xs text-slate-500 dark:text-slate-500">
                           How many different ways do you distract yourself from existential dread?
                        </p>
                     </div>
                     <div>
                        <div className="relative">
                            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input 
                                type="number" 
                                name="numberOfAppsUsed"
                                value={formData.numberOfAppsUsed}
                                onChange={handleChange}
                                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 font-bold text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                            />
                        </div>
                     </div>
                </div>
                {errors.numberOfAppsUsed && <p className="mt-2 text-xs text-red-600 font-bold">{errors.numberOfAppsUsed}</p>}
            </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => {
    const totalSpecific = formData.socialMediaUsageHours + formData.productivityAppUsageHours + formData.gamingAppUsageHours;
    const isOverLimit = totalSpecific > 24;

    return (
      <div className="space-y-8 animate-fadeIn">
        <div className="bg-gradient-to-r from-indigo-50 to-white dark:from-slate-900 dark:to-slate-950 p-8 rounded-3xl border border-indigo-100/50 dark:border-slate-800 flex items-start space-x-6 shadow-sm">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl shadow-indigo-100 dark:shadow-none text-indigo-600 dark:text-indigo-400 rotate-3">
            <Share2 className="h-8 w-8"/>
          </div>
          <div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Poison Selection</h3>
              <p className="text-base text-slate-500 dark:text-slate-400 leading-relaxed mt-2">
                 Which specific algorithms own your attention span? Break it down.
              </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border-2 border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-100/50 dark:shadow-none">
            <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Time Allocation</span>
                <span className={`text-base font-bold px-3 py-1 rounded-lg ${isOverLimit ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200'}`}>
                    {totalSpecific.toFixed(1)} <span className="text-slate-400 font-normal text-xs">/ 24 hrs</span>
                </span>
            </div>
            
            <div className="w-full h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex overflow-hidden ring-1 ring-slate-200 dark:ring-slate-700">
                <div style={{ width: `${(formData.socialMediaUsageHours / 24) * 100}%` }} className="bg-blue-500 h-full transition-all duration-500 ease-out relative group" title="Social Media"></div>
                <div style={{ width: `${(formData.productivityAppUsageHours / 24) * 100}%` }} className="bg-emerald-500 h-full transition-all duration-500 ease-out relative group" title="Productivity"></div>
                <div style={{ width: `${(formData.gamingAppUsageHours / 24) * 100}%` }} className="bg-purple-500 h-full transition-all duration-500 ease-out relative group" title="Gaming"></div>
            </div>
            
            {isOverLimit && (
                <div className="mt-4 flex items-center text-sm font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-100 dark:border-red-900/30 animate-pulse">
                    <AlertCircle className="h-5 w-5 mr-2"/> 
                    Error: You have exceeded the physical limits of time.
                </div>
            )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {renderSliderInput("Doomscrolling", "socialMediaUsageHours", 24, <Share2 className="h-5 w-5"/>, 'blue')}
             {renderSliderInput("Pretending to Work", "productivityAppUsageHours", 24, <Briefcase className="h-5 w-5"/>, 'green')}
             {renderSliderInput("Gaming", "gamingAppUsageHours", 24, <Gamepad2 className="h-5 w-5"/>, 'purple')}
        </div>
      </div>
    );
  };

  const renderStep4 = () => (
    <div className="space-y-8 animate-fadeIn">
       <div className="bg-gradient-to-r from-emerald-50 to-white dark:from-emerald-950/20 dark:to-slate-950 p-8 rounded-3xl border border-emerald-100/50 dark:border-emerald-900/20 flex items-start space-x-6 shadow-sm">
         <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl shadow-emerald-100 dark:shadow-none text-emerald-600 dark:text-emerald-400 rotate-3">
            <HeartPulse className="h-8 w-8"/>
         </div>
         <div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Biological Integrity</h3>
            <p className="text-base text-slate-500 dark:text-slate-400 leading-relaxed mt-2">
                Let's see how much your physical body has degraded due to your digital habits.
            </p>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         {/* Sleep Cycle */}
         <div className="md:col-span-1">
             {renderSliderInput("Unconscious Hours (Sleep)", "sleepHours", 12, <Moon className="h-5 w-5"/>, 'indigo')}
         </div>

         {/* Physical Activity */}
         <div className="md:col-span-1">
             {renderSliderInput("Touching Grass (Activity)", "physicalActivityHours", 20, <Dumbbell className="h-5 w-5"/>, 'green')}
         </div>

         {/* Anxiety Level */}
         <div className="md:col-span-2">
            {renderSliderInput("Existential Dread (Anxiety)", "anxietyLevel", 10, <Brain className="h-5 w-5"/>, 'red', '')}
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 text-center">1 = Zen Master, 10 = Screaming Internally</p>
         </div>

         {/* Mood Selector */}
         <div className="md:col-span-2 pt-2">
             <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 ml-1">Current Emotional State</label>
             <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                 {[
                   { label: 'Happy', icon: <Smile className="w-6 h-6"/>, color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
                   { label: 'Neutral', icon: <Meh className="w-6 h-6"/>, color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
                   { label: 'Stressed', icon: <Activity className="w-6 h-6"/>, color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
                   { label: 'Anxious', icon: <Brain className="w-6 h-6"/>, color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
                   { label: 'Depressed', icon: <Frown className="w-6 h-6"/>, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
                 ].map((item) => (
                    <button
                        key={item.label}
                        onClick={() => handleMoodSelect(item.label)}
                        className={`flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-200 border-2 ${
                            formData.moodStatus === item.label 
                            ? `border-current ring-2 ring-offset-2 dark:ring-offset-slate-900 ${item.color} scale-105`
                            : 'bg-white dark:bg-slate-900 border-transparent text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                    >
                        <div className="mb-2">{item.icon}</div>
                        <span className="text-xs font-bold">{item.label}</span>
                    </button>
                 ))}
             </div>
         </div>
      </div>
    </div>
  );

  // Loading State
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fadeIn p-4">
        <div className="relative mb-8">
             <div className="absolute inset-0 bg-indigo-200 dark:bg-indigo-900 rounded-full animate-ping opacity-25"></div>
             <div className="relative bg-white dark:bg-slate-800 p-8 rounded-full shadow-2xl shadow-indigo-100 dark:shadow-none">
                <Loader2 className="h-16 w-16 text-indigo-600 dark:text-indigo-400 animate-spin" />
             </div>
        </div>
        <h2 className="text-4xl font-black text-slate-900 dark:text-white text-center tracking-tighter">Running Judgment Protocols</h2>
        <div className="mt-8 max-w-md w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
             <div className="h-full bg-indigo-600 dark:bg-indigo-400 w-2/3 animate-[progress_1s_ease-in-out_infinite]"></div>
        </div>
        <p className="text-slate-500 dark:text-slate-400 mt-6 max-w-md text-center leading-relaxed font-bold text-sm uppercase tracking-wide">
            Comparing your habits to highly successful people (you are losing)...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 md:py-12 px-4 sm:px-6 relative">
      
      {/* Resume Prompt Modal */}
      {showResumePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all scale-100 border border-slate-100 dark:border-slate-800">
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 mb-6 ring-8 ring-indigo-50 dark:ring-indigo-900/10">
                <Save className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Previous Failure Detected</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                You gave up halfway through last time. Want to try and actually finish it now?
              </p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleStartOver}
                  className="flex items-center justify-center px-4 py-4 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 font-bold transition-all"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Restart
                </button>
                <button
                  onClick={handleResume}
                  className="flex items-center justify-center px-4 py-4 border border-transparent rounded-2xl text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-200 dark:hover:shadow-none font-bold transition-all"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Resume
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progress Header */}
      <div className="mb-10 sticky top-[4.5rem] z-30 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md py-4 border-b border-slate-200/50 dark:border-slate-800 md:static md:bg-transparent md:border-0 transition-colors rounded-b-2xl md:rounded-none px-4 md:px-0 -mx-4 md:mx-0">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-4 gap-2">
            <div>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Investigation</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1 font-bold flex items-center text-sm uppercase tracking-wide">
                    Phase {step} of {TOTAL_STEPS} //
                    <span className="ml-2 text-indigo-600 dark:text-indigo-400">
                        {step === 1 ? 'Profiling' : step === 2 ? 'Usage Metrics' : step === 3 ? 'Addiction Type' : 'Bio-Damage'}
                    </span>
                </p>
            </div>
            <div className="flex items-center space-x-3">
                 <span className={`text-[10px] font-bold uppercase tracking-widest flex items-center px-3 py-1.5 rounded-full transition-colors ${savedProgress ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400' : 'text-slate-400 bg-slate-100 dark:bg-slate-900'}`}>
                    <Save className="w-3 h-3 mr-1.5" /> {savedProgress ? 'Evidence Secured' : 'Surveillance Active'}
                </span>
            </div>
        </div>
        <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div 
                style={{ width: `${(step / TOTAL_STEPS) * 100}%` }} 
                className="h-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-700 ease-out rounded-full shadow-[0_0_15px_rgba(79,70,229,0.5)] relative"
            >
                <div className="absolute top-0 right-0 bottom-0 w-20 bg-gradient-to-l from-white/30 to-transparent"></div>
            </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white dark:bg-slate-950 shadow-2xl shadow-slate-200/50 dark:shadow-none rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col min-h-[500px] transition-all duration-500">
        <div className="p-8 md:p-12 flex-grow">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </div>
        
        {/* Navigation Footer */}
        <div className="bg-slate-50 dark:bg-slate-900/50 px-8 md:px-12 py-8 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className={`flex items-center px-6 py-4 border-2 border-slate-200 dark:border-slate-800 text-sm font-bold rounded-2xl text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:outline-none transition-all uppercase tracking-wide ${step === 1 ? 'opacity-0 pointer-events-none' : 'hover:-translate-x-1'}`}
          >
            <ChevronLeft className="mr-2 h-4 w-4"/> Previous
          </button>
          
          {step < TOTAL_STEPS ? (
             <button
             onClick={handleNext}
             className="flex items-center px-10 py-4 border border-transparent shadow-xl shadow-indigo-200/50 dark:shadow-none text-sm font-bold rounded-2xl text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 hover:-translate-y-1 transition-all focus:outline-none focus:ring-4 focus:ring-indigo-500/30 uppercase tracking-wide"
           >
             Continue <ChevronRight className="ml-2 h-4 w-4"/>
           </button>
          ) : (
            <button
            onClick={handleSubmit}
            className="flex items-center px-10 py-4 border border-transparent shadow-xl shadow-emerald-200/50 dark:shadow-none text-sm font-bold rounded-2xl text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 hover:-translate-y-1 transition-all focus:outline-none focus:ring-4 focus:ring-emerald-500/30 uppercase tracking-wide"
          >
            Judge Me <Activity className="ml-2 h-4 w-4"/>
          </button>
          )}
        </div>
      </div>
      
      <div className="mt-8 flex justify-center text-slate-400 dark:text-slate-600 text-[10px] items-center font-bold uppercase tracking-widest">
        <Info className="h-3 w-3 mr-1.5"/> 
        Data encrypted locally. We don't want your secrets anyway.
      </div>
    </div>
  );
};
