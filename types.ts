
export interface AssessmentData {
  age: number;
  gender: string;
  location: string;
  // Step 2: General
  totalAppUsageHours: number;
  dailyScreenTimeHours: number;
  numberOfAppsUsed: number;
  // Step 3: Specific
  socialMediaUsageHours: number;
  productivityAppUsageHours: number;
  gamingAppUsageHours: number;
  // Step 4: Wellness (New)
  sleepHours: number;
  anxietyLevel: number; // 1-10
  physicalActivityHours: number; // Weekly
  moodStatus: 'Happy' | 'Neutral' | 'Stressed' | 'Anxious' | 'Depressed';
}

export enum AddictionLevel {
  LOW = 'Low Risk',
  MODERATE = 'Moderate Risk',
  HIGH = 'High Addiction Risk'
}

export interface AIRecommendations {
  summary: string;
  risk_level_explanation: string;
  anomaly_explanation: string;
  recommendations: {
    usage_control: string[];
    sleep_hygiene: string[];
    productivity_focus: string[];
    mental_wellbeing: string[];
    daily_action_plan: string[];
  };
  progress_tracking_tip: string;
  disclaimer: string;
}

export interface PredictionResult {
  isAddicted: boolean;
  probability: number;
  riskLevel: AddictionLevel;
  features: {
    name: string;
    value: number;
    contribution: number; // simulated SHAP value or importance
  }[];
  anomalyDetected: boolean;
  recommendations: string[]; // Fallback legacy recommendations
  aiAnalysis?: AIRecommendations; // New structured AI output
}

export interface ModelMetrics {
  name: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
}

export interface ProgressEntry {
  entry_id: string;
  user_id: string;
  timestamp: string; // ISO 8601
  progress_payload: {
    inputs: AssessmentData;
    result: PredictionResult;
  };
}
