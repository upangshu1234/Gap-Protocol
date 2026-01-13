
import { AssessmentData, PredictionResult, AddictionLevel, AIRecommendations } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

const AI_SYSTEM_INSTRUCTION = `
ROLE:
You are an AI Behavioral Recommendation Engine integrated into a Gadget Addiction Prediction Platform.
Your purpose is to generate personalized, safe, explainable recommendations based on ML-predicted addiction level, behavioral anomalies, and user input features (including sleep, anxiety, and physical activity).

❗ ABSOLUTE RULES (CRITICAL):
- Recommendations must be explainable
- No medical or psychological prescriptions
- Advice must be actionable and realistic
- No fear-based language
- All outputs must align with ML results provided in input
- Tone: Calm, Supportive, Non-judgmental, Professional

🧠 RECOMMENDATION CATEGORIES (MANDATORY):
1. Usage Control (Screen-time caps, App scheduling)
2. Sleep Hygiene (Device cutoff, Night routines)
3. Productivity & Focus (Study blocks, Distraction reduction)
4. Mental & Social Well-being (Offline activities, Mindfulness)
5. Daily Action Plan (3-5 simple steps for today)

OUTPUT JSON FORMAT:
{
  "summary": "One-paragraph interpretation...",
  "risk_level_explanation": "...",
  "anomaly_explanation": "...",
  "recommendations": {
    "usage_control": ["Tip 1", "Tip 2"],
    "sleep_hygiene": ["Tip 1", "Tip 2"],
    "productivity_focus": ["Tip 1", "Tip 2"],
    "mental_wellbeing": ["Tip 1", "Tip 2"],
    "daily_action_plan": ["Step 1", "Step 2", "Step 3"]
  },
  "progress_tracking_tip": "...",
  "disclaimer": "..."
}
`;

export const predictAddiction = async (data: AssessmentData): Promise<PredictionResult> => {
  // 1. Rule-based "Ground Truth" Logic from the Notebook (Simulated ML)
  // Augmented with new risk factors (Sleep < 6h or Anxiety > 7 increases risk)
  const isHighRiskBehavior = 
    data.dailyScreenTimeHours >= 6 && 
    data.socialMediaUsageHours >= 3 && 
    data.gamingAppUsageHours >= 2;
  
  const isHighRiskWellness = 
    data.sleepHours < 5 || data.anxietyLevel >= 8;

  const isHighRisk = isHighRiskBehavior || (isHighRiskBehavior && isHighRiskWellness);

  // 2. Calculate a "Probability" for the UI (Softmax simulation)
  // Weighted scoring including new factors
  const score = 
    (data.dailyScreenTimeHours / 14) * 0.25 + 
    (data.socialMediaUsageHours / 6) * 0.3 + 
    (data.gamingAppUsageHours / 5) * 0.2 +
    (data.anxietyLevel / 10) * 0.15 + // Anxiety contribution
    ((8 - Math.min(data.sleepHours, 8)) / 8) * 0.1; // Sleep debt contribution
  
  let probability = Math.min(Math.max(score, 0), 0.99);
  
  if (isHighRisk) {
    probability = Math.max(probability, 0.85); 
  }

  // 3. Determine Risk Level
  let riskLevel = AddictionLevel.LOW;
  if (probability > 0.4 && probability < 0.75) riskLevel = AddictionLevel.MODERATE;
  if (probability >= 0.75 || isHighRisk) riskLevel = AddictionLevel.HIGH;

  // 4. Anomaly Detection (Z-Score simulation)
  const meanScreenTime = 7.69;
  const stdScreenTime = 3.71;
  const zScore = Math.abs((data.dailyScreenTimeHours - meanScreenTime) / stdScreenTime);
  const anomalyDetected = zScore > 2.5;

  // 5. Generate Legacy Recommendations (Fallback)
  const legacyRecommendations = [];
  if (data.socialMediaUsageHours > 2) legacyRecommendations.push("Limit social media usage to under 2 hours daily.");
  if (data.gamingAppUsageHours > 1) legacyRecommendations.push("Reduce gaming sessions; try the 20-20-20 rule.");
  if (data.dailyScreenTimeHours > 6) legacyRecommendations.push("Implement a 'Digital Detox' after 8 PM.");
  if (data.sleepHours < 7) legacyRecommendations.push("Prioritize sleep: No screens 1 hour before bed.");
  if (data.anxietyLevel > 6) legacyRecommendations.push("Consider mindfulness apps instead of doom-scrolling.");

  // 6. Generate AI Recommendations (Gemini)
  let aiAnalysis: AIRecommendations | undefined;
  
  try {
    if (process.env.API_KEY) {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const aiInput = {
        predicted_addiction_level: riskLevel,
        confidence_score: (probability * 100).toFixed(1),
        anomaly_detected: anomalyDetected,
        user_metrics: {
           screen_time: data.dailyScreenTimeHours,
           social_media: data.socialMediaUsageHours,
           gaming: data.gamingAppUsageHours,
           sleep_hours: data.sleepHours,
           anxiety_level: data.anxietyLevel,
           physical_activity: data.physicalActivityHours,
           mood: data.moodStatus
        }
      };

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction: AI_SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          temperature: 0.7,
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              risk_level_explanation: { type: Type.STRING },
              anomaly_explanation: { type: Type.STRING },
              recommendations: {
                type: Type.OBJECT,
                properties: {
                  usage_control: { type: Type.ARRAY, items: { type: Type.STRING } },
                  sleep_hygiene: { type: Type.ARRAY, items: { type: Type.STRING } },
                  productivity_focus: { type: Type.ARRAY, items: { type: Type.STRING } },
                  mental_wellbeing: { type: Type.ARRAY, items: { type: Type.STRING } },
                  daily_action_plan: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ["usage_control", "sleep_hygiene", "productivity_focus", "mental_wellbeing", "daily_action_plan"]
              },
              progress_tracking_tip: { type: Type.STRING },
              disclaimer: { type: Type.STRING },
            },
            required: ["summary", "risk_level_explanation", "recommendations", "progress_tracking_tip", "disclaimer"]
          }
        },
        contents: JSON.stringify(aiInput)
      });
      
      if (response.text) {
        aiAnalysis = JSON.parse(response.text);
      }
    }
  } catch (error) {
    console.warn("AI recommendation generation failed, using fallback.", error);
  }

  return {
    isAddicted: isHighRisk,
    probability: Number(probability.toFixed(2)),
    riskLevel,
    features: [
        { name: "Social Media", value: data.socialMediaUsageHours, contribution: 40 },
        { name: "Gaming", value: data.gamingAppUsageHours, contribution: 20 },
        { name: "Anxiety", value: data.anxietyLevel, contribution: 15 },
        { name: "Sleep Dept", value: Math.max(0, 8 - data.sleepHours), contribution: 10 },
    ],
    anomalyDetected,
    recommendations: legacyRecommendations,
    aiAnalysis
  };
};
