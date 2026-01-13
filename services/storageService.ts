
import { AssessmentData, PredictionResult, ProgressEntry } from '../types';

const getStorageKey = (userId: string) => `gap_progress_history_${userId}`;

/**
 * Saves a new assessment entry to the user's history.
 * Implements append-only logic.
 */
export const saveProgress = (
  userId: string, 
  data: AssessmentData, 
  result: PredictionResult
): ProgressEntry => {
  if (!userId) throw new Error("User ID is required for storage");

  const key = getStorageKey(userId);
  const existingHistory: ProgressEntry[] = JSON.parse(localStorage.getItem(key) || '[]');

  const newEntry: ProgressEntry = {
    entry_id: crypto.randomUUID(),
    user_id: userId,
    timestamp: new Date().toISOString(),
    progress_payload: {
      inputs: data,
      result: result
    }
  };

  // Append-only: Add new entry to the end of the list
  const updatedHistory = [...existingHistory, newEntry];
  localStorage.setItem(key, JSON.stringify(updatedHistory));

  return newEntry;
};

/**
 * Retrieves the full progress history for a specific user.
 * @param userId The authenticated user ID
 * @param sortDirection 'asc' (oldest first) or 'desc' (newest first)
 */
export const getProgressHistory = (userId: string, sortDirection: 'asc' | 'desc' = 'desc'): ProgressEntry[] => {
  if (!userId) return [];
  
  const key = getStorageKey(userId);
  const history: ProgressEntry[] = JSON.parse(localStorage.getItem(key) || '[]');
  
  return history.sort((a, b) => {
    const dateA = new Date(a.timestamp).getTime();
    const dateB = new Date(b.timestamp).getTime();
    return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
  });
};

/**
 * Retrieves the most recent assessment entry.
 */
export const getLatestProgress = (userId: string): ProgressEntry | null => {
  const history = getProgressHistory(userId, 'desc');
  return history.length > 0 ? history[0] : null;
};

/**
 * Retrieves the oldest assessment entry (baseline).
 */
export const getBaselineProgress = (userId: string): ProgressEntry | null => {
  const history = getProgressHistory(userId, 'asc');
  return history.length > 0 ? history[0] : null;
};
