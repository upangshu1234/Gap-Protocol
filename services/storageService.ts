import { AssessmentData, PredictionResult, ProgressEntry } from '../types';

// ============================================================================
// GOOGLE FORMS CONFIGURATION
// Write-only backend configuration.
// ============================================================================
const GOOGLE_FORM_CONFIG = {
  FORM_URL: "https://docs.google.com/forms/d/e/1FAIpQLSeurfNtS2v5iVelha6rUaQR9Mdi4bmqvtYMLGZYKwhOgrjrzg/formResponse",

  ENTRY_USER_ID: "entry.210620355",
  ENTRY_TIMESTAMP: "entry.36374783",
  ENTRY_INPUT_JSON: "entry.730137239",
  ENTRY_PREDICTION_JSON: "entry.1621251062",
  ENTRY_AI_JSON: "entry.2067402192"
};

const LOCAL_STORAGE_KEY_PREFIX = 'gap_history_';
const CHAT_STORAGE_KEY_PREFIX = 'gap_chat_';

/**
 * Saves a new assessment entry to Google Forms (Cloud) and LocalStorage (Device).
 * 
 * 1. Sends data to Google Forms via POST (no-cors).
 * 2. Saves full JSON object to LocalStorage for immediate UI retrieval.
 */
export const saveProgress = async (
  userId: string, 
  data: AssessmentData, 
  result: PredictionResult
): Promise<ProgressEntry | null> => {
  
  if (!userId) {
      console.error("No user ID provided for saveProgress");
      return null;
  }

  const timestamp = new Date().toISOString();
  const entryId = crypto.randomUUID();

  // 1. Prepare Data for Google Forms
  const formData = new FormData();
  formData.append(GOOGLE_FORM_CONFIG.ENTRY_USER_ID, userId);
  formData.append(GOOGLE_FORM_CONFIG.ENTRY_TIMESTAMP, timestamp);
  formData.append(GOOGLE_FORM_CONFIG.ENTRY_INPUT_JSON, JSON.stringify(data));
  formData.append(GOOGLE_FORM_CONFIG.ENTRY_PREDICTION_JSON, JSON.stringify({ 
      isAddicted: result.isAddicted,
      probability: result.probability,
      riskLevel: result.riskLevel,
      anomalyDetected: result.anomalyDetected
  }));
  formData.append(GOOGLE_FORM_CONFIG.ENTRY_AI_JSON, JSON.stringify(result.aiAnalysis || {}));

  try {
      // 2. Submit to Google Forms (Fire and Forget)
      await fetch(GOOGLE_FORM_CONFIG.FORM_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: formData
      });
      console.log("Data submitted to Google Form successfully.");

      // 3. Save to LocalStorage (Persistence)
      const newEntry: ProgressEntry = {
          entry_id: entryId,
          user_id: userId,
          timestamp: timestamp,
          progress_payload: {
              inputs: data,
              result: result
          }
      };

      const historyKey = LOCAL_STORAGE_KEY_PREFIX + userId;
      const existingHistoryStr = localStorage.getItem(historyKey);
      const existingHistory: ProgressEntry[] = existingHistoryStr ? JSON.parse(existingHistoryStr) : [];
      
      const updatedHistory = [newEntry, ...existingHistory]; // Prepend new entry
      localStorage.setItem(historyKey, JSON.stringify(updatedHistory));

      return newEntry;

  } catch (err) {
      console.error("Error saving progress:", err);
      // We return null to indicate failure, though mostly this catches local storage errors
      // since fetch no-cors rarely throws on network success.
      return null;
  }
};

/**
 * Retrieves progress history from LocalStorage.
 */
export const getProgressHistory = async (userId: string, sortDirection: 'asc' | 'desc' = 'desc'): Promise<ProgressEntry[]> => {
  if (!userId) return [];

  try {
      const historyStr = localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + userId);
      if (!historyStr) return [];

      let history: ProgressEntry[] = JSON.parse(historyStr);

      // Sort
      history.sort((a, b) => {
          const dateA = new Date(a.timestamp).getTime();
          const dateB = new Date(b.timestamp).getTime();
          return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      });

      return history;
  } catch (e) {
      console.error("Failed to load local history", e);
      return [];
  }
};

/**
 * Retrieves the most recent assessment from LocalStorage.
 */
export const getLatestProgress = async (userId: string): Promise<ProgressEntry | null> => {
    if (!userId) return null;

    try {
        const history = await getProgressHistory(userId, 'desc');
        return history.length > 0 ? history[0] : null;
    } catch (err) {
        console.error("Critical failure in getLatestProgress:", err);
        return null;
    }
};

/**
 * Retrieves the baseline (first ever) assessment from LocalStorage.
 */
export const getBaselineProgress = async (userId: string): Promise<ProgressEntry | null> => {
    if (!userId) return null;
    
    try {
        const history = await getProgressHistory(userId, 'asc');
        return history.length > 0 ? history[0] : null;
    } catch (err) {
        console.error("Critical failure in getBaselineProgress:", err);
        return null;
    }
};

/**
 * Saves a chat log entry to LocalStorage.
 */
export const saveChatMessage = async (
    userId: string, 
    role: 'user' | 'model' | 'system', 
    content: string,
    sessionId?: string
) => {
    if (!userId || !sessionId) return;
    
    try {
        const key = CHAT_STORAGE_KEY_PREFIX + userId + "_" + sessionId;
        const existingStr = localStorage.getItem(key);
        const messages = existingStr ? JSON.parse(existingStr) : [];
        
        messages.push({
            role,
            content,
            timestamp: new Date().toISOString()
        });

        localStorage.setItem(key, JSON.stringify(messages));
    } catch (e) {
        console.warn("Chat log save failed", e);
    }
}

/**
 * Fetches conversation history from LocalStorage.
 */
export const getChatHistory = async (userId: string, sessionId?: string, limit = 50) => {
    if (!userId || !sessionId) return [];

    try {
        const key = CHAT_STORAGE_KEY_PREFIX + userId + "_" + sessionId;
        const existingStr = localStorage.getItem(key);
        return existingStr ? JSON.parse(existingStr) : [];
    } catch (e) {
        return [];
    }
}
