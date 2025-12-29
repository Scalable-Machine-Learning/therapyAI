// Core types for the Mental Health Journal platform

export type MoodType = 'positive' | 'neutral' | 'negative' | 'anxious';

export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export interface JournalEntry {
  id: string;
  user_id: string;
  content: string;
  mood?: MoodType;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description: string;
  target_date?: string;
  progress: number; // 0-100
  status: 'active' | 'completed' | 'paused';
  created_at: string;
  updated_at: string;
}

export interface AnalysisResult {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  emotional_trends: EmotionalTrend[];
  insights: Insight[];
  areas_of_concern: AreaOfConcern[];
  goal_progress: GoalProgressSummary[];
  summary: string;
  created_at: string;
}

export interface EmotionalTrend {
  date: string;
  mood_score: number; // -1 to 1
  dominant_emotion: string;
}

export interface Insight {
  type: 'pattern' | 'recommendation' | 'achievement';
  title: string;
  description: string;
  confidence: number; // 0-1
}

export interface AreaOfConcern {
  category: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  suggested_actions: string[];
}

export interface GoalProgressSummary {
  goal_id: string;
  goal_title: string;
  progress_change: number;
  analysis_notes: string;
}

// Auth types
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// API response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  message: string;
  code?: string;
}
