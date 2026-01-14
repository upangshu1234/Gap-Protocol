
import { supabase } from './supabaseClient';
import { AssessmentData, PredictionResult, ProgressEntry } from '../types';

/**
 * Helper to log schema errors specifically for UUID/Text mismatch.
 */
const handleDatabaseError = (error: any, context: string) => {
    if (!error) return;
    
    // 22P02 is Postgres code for "invalid input syntax for type uuid"
    // This happens if DB expects UUID but gets Firebase String UID
    if (error.code === '22P02') {
        console.error(`[CRITICAL SCHEMA ERROR] in ${context}: Database expects UUID but received text. Please run the provided SQL migration to change ID columns to TEXT.`);
    } else {
        console.error(`Error in ${context}:`, JSON.stringify(error, null, 2));
    }
};

/**
 * Saves a new assessment entry to Supabase.
 * - Inserts into 'progress_entries'
 * - If AI analysis exists, inserts into 'ai_recommendations'
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

  try {
      // 1. Ensure profile exists (Upsert)
      const { error: profileError } = await supabase
        .from('users_profile')
        .upsert({ id: userId, updated_at: new Date().toISOString() }, { onConflict: 'id' });

      if (profileError) {
          // If profile fails (e.g. foreign key issues), we log but try to continue if possible
          console.warn('Profile upsert warning:', profileError.message);
      }

      // 2. Insert Progress Entry (Core Data)
      const insertPayload = {
        user_id: userId,
        input_data: data,
        prediction_result: { ...result, aiAnalysis: undefined } // Decouple AI data for storage
      };

      const { data: entryData, error: entryError } = await supabase
        .from('progress_entries')
        .insert([insertPayload])
        .select()
        .single();

      if (entryError) {
        handleDatabaseError(entryError, 'saveProgress (Insert Entry)');
        return null;
      }

      if (!entryData) {
         console.error('Error saving progress entry: No data returned');
         return null;
      }

      // 3. Insert AI Recommendations (if available)
      if (result.aiAnalysis) {
          const { error: aiError } = await supabase
            .from('ai_recommendations')
            .insert([
                {
                    entry_id: entryData.id,
                    analysis_payload: result.aiAnalysis
                }
            ]);
          
          if (aiError) console.error("Failed to save AI recommendations:", JSON.stringify(aiError, null, 2));
      }

      // 4. Return formatted object conforming to frontend types
      return {
        entry_id: entryData.id,
        user_id: entryData.user_id,
        timestamp: entryData.created_at,
        progress_payload: {
          inputs: entryData.input_data,
          result: {
              ...entryData.prediction_result,
              aiAnalysis: result.aiAnalysis
          }
        }
      };
  } catch (err) {
      console.error("Unexpected error in saveProgress:", err);
      return null;
  }
};

/**
 * Retrieves progress history.
 * Fetches from 'progress_entries' and joins 'ai_recommendations'.
 */
export const getProgressHistory = async (userId: string, sortDirection: 'asc' | 'desc' = 'desc'): Promise<ProgressEntry[]> => {
  if (!userId) return [];

  const { data, error } = await supabase
    .from('progress_entries')
    .select(`
        *,
        ai_recommendations (
            analysis_payload
        )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: sortDirection === 'asc' });

  if (error) {
    handleDatabaseError(error, 'getProgressHistory');
    return [];
  }

  return (data || []).map((row: any) => {
    const aiData = row.ai_recommendations?.[0]?.analysis_payload;
    const result = {
        ...row.prediction_result,
        aiAnalysis: aiData
    };

    return {
        entry_id: row.id,
        user_id: row.user_id,
        timestamp: row.created_at,
        progress_payload: {
            inputs: row.input_data,
            result: result
        }
    };
  });
};

/**
 * Retrieves the most recent assessment.
 */
export const getLatestProgress = async (userId: string): Promise<ProgressEntry | null> => {
    if (!userId) return null;

    try {
        const { data, error } = await supabase
        .from('progress_entries')
        .select(`
            *,
            ai_recommendations (
                analysis_payload
            )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

        if (error) {
            // PGRST116 is "No rows found" - not a system error
            if (error.code === 'PGRST116') {
                return null;
            }
            handleDatabaseError(error, 'getLatestProgress');
            return null;
        }

        if (!data) return null;

        const aiData = data.ai_recommendations?.[0]?.analysis_payload;
        const result = {
            ...data.prediction_result,
            aiAnalysis: aiData
        };

        return {
            entry_id: data.id,
            user_id: data.user_id,
            timestamp: data.created_at,
            progress_payload: {
                inputs: data.input_data,
                result: result
            }
        };
    } catch (err) {
        console.error("Critical failure in getLatestProgress:", err);
        return null;
    }
};

/**
 * Retrieves the baseline (first ever) assessment.
 */
export const getBaselineProgress = async (userId: string): Promise<ProgressEntry | null> => {
    if (!userId) return null;
    
    const { data, error } = await supabase
      .from('progress_entries')
      .select(`
          *,
          ai_recommendations (
              analysis_payload
          )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (error) {
        if (error.code === 'PGRST116') return null;
        handleDatabaseError(error, 'getBaselineProgress');
        return null;
    }
    
    if (!data) return null;

    const aiData = data.ai_recommendations?.[0]?.analysis_payload;
    const result = {
        ...data.prediction_result,
        aiAnalysis: aiData
    };

    return {
        entry_id: data.id,
        user_id: data.user_id,
        timestamp: data.created_at,
        progress_payload: {
            inputs: data.input_data,
            result: result
        }
    };
};

/**
 * Saves a chat log entry to 'chatbot_messages'.
 */
export const saveChatMessage = async (
    userId: string, 
    role: 'user' | 'model' | 'system', 
    content: string,
    sessionId?: string
) => {
    if (!userId) return;
    
    try {
        // Ensure profile exists (best effort)
        await supabase
            .from('users_profile')
            .upsert({ id: userId, updated_at: new Date().toISOString() }, { onConflict: 'id' });

        const { error } = await supabase
            .from('chatbot_messages')
            .insert([{ 
                user_id: userId, 
                role, 
                content,
                session_id: sessionId || null 
            }]);
        
        if (error) handleDatabaseError(error, 'saveChatMessage');
    } catch (e) {
        console.warn("Chat log save failed", e);
    }
}

/**
 * Fetches conversation history.
 */
export const getChatHistory = async (userId: string, sessionId?: string, limit = 50) => {
    if (!userId) return [];

    let query = supabase
        .from('chatbot_messages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(limit);

    if (sessionId) {
        query = query.eq('session_id', sessionId);
    }

    const { data, error } = await query;
    
    if (error) {
        handleDatabaseError(error, 'getChatHistory');
        return [];
    }
    return data;
}
