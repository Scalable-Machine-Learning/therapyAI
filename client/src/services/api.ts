// API service layer - Mock implementation
// Replace BASE_URL with your FastAPI backend URL when ready

import {
  JournalEntry,
  Goal,
  AnalysisResult,
  User,
  MoodType
} from '@/types';
import { supabase } from '@/lib/supabase';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Helper to get auth token from Supabase
const getToken = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token;
};

// Helper for authenticated requests
async function authFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
}

// ============ MOCK DATA ============
// This mock data simulates your backend responses

const mockUser: User = {
  id: '1',
  email: 'user@example.com',
  name: 'Alex Thompson',
  created_at: '2024-01-15T10:00:00Z',
};

const mockEntries: JournalEntry[] = [
  {
    id: '1',
    user_id: '1',
    content: "Had a really productive morning today. Completed my meditation practice and felt more centered than usual. The breathing exercises are starting to feel more natural. I noticed I was less reactive in meetings.",
    mood: 'positive',
    tags: ['meditation', 'productivity', 'growth'],
    created_at: '2024-12-28T09:30:00Z',
    updated_at: '2024-12-28T09:30:00Z',
  },
  {
    id: '2',
    user_id: '1',
    content: "Feeling a bit overwhelmed with work deadlines. The project timeline seems tight and I'm struggling to prioritize tasks. Need to remember to take breaks and not let stress build up.",
    mood: 'anxious',
    tags: ['work', 'stress', 'priorities'],
    created_at: '2024-12-27T18:45:00Z',
    updated_at: '2024-12-27T18:45:00Z',
  },
  {
    id: '3',
    user_id: '1',
    content: "Had a great catch-up call with an old friend today. It reminded me how important it is to maintain connections. We talked about our shared experiences and it brought back good memories.",
    mood: 'positive',
    tags: ['relationships', 'gratitude', 'connection'],
    created_at: '2024-12-26T14:20:00Z',
    updated_at: '2024-12-26T14:20:00Z',
  },
  {
    id: '4',
    user_id: '1',
    content: "An ordinary day. Nothing particularly noteworthy happened. Went through my usual routine - work, lunch, some reading in the evening. Sometimes these quiet days are needed.",
    mood: 'neutral',
    tags: ['routine', 'reflection'],
    created_at: '2024-12-25T20:00:00Z',
    updated_at: '2024-12-25T20:00:00Z',
  },
  {
    id: '5',
    user_id: '1',
    content: "Struggled with sleep last night and it affected my entire day. Felt foggy and irritable. Need to work on my evening routine and screen time before bed.",
    mood: 'negative',
    tags: ['sleep', 'health', 'self-care'],
    created_at: '2024-12-24T21:30:00Z',
    updated_at: '2024-12-24T21:30:00Z',
  },
];

const mockGoals: Goal[] = [
  {
    id: '1',
    user_id: '1',
    title: 'Daily Meditation Practice',
    description: 'Meditate for at least 10 minutes every day to improve focus and reduce anxiety',
    target_date: '2025-03-31',
    progress: 65,
    status: 'active',
    created_at: '2024-11-01T00:00:00Z',
    updated_at: '2024-12-28T00:00:00Z',
  },
  {
    id: '2',
    user_id: '1',
    title: 'Improve Sleep Quality',
    description: 'Establish a consistent sleep schedule and limit screen time before bed',
    target_date: '2025-02-28',
    progress: 40,
    status: 'active',
    created_at: '2024-12-01T00:00:00Z',
    updated_at: '2024-12-27T00:00:00Z',
  },
  {
    id: '3',
    user_id: '1',
    title: 'Weekly Social Connection',
    description: 'Connect with at least one friend or family member each week',
    progress: 80,
    status: 'active',
    created_at: '2024-10-15T00:00:00Z',
    updated_at: '2024-12-26T00:00:00Z',
  },
];

const mockAnalysis: AnalysisResult = {
  id: '1',
  user_id: '1',
  start_date: '2024-12-22',
  end_date: '2024-12-28',
  emotional_trends: [
    { date: '2024-12-22', mood_score: 0.3, dominant_emotion: 'content' },
    { date: '2024-12-23', mood_score: 0.5, dominant_emotion: 'hopeful' },
    { date: '2024-12-24', mood_score: -0.4, dominant_emotion: 'tired' },
    { date: '2024-12-25', mood_score: 0.0, dominant_emotion: 'calm' },
    { date: '2024-12-26', mood_score: 0.7, dominant_emotion: 'joyful' },
    { date: '2024-12-27', mood_score: -0.3, dominant_emotion: 'anxious' },
    { date: '2024-12-28', mood_score: 0.6, dominant_emotion: 'motivated' },
  ],
  insights: [
    {
      type: 'pattern',
      title: 'Morning Routine Impact',
      description: 'Days that start with meditation show a 40% improvement in overall mood scores. Your consistent practice is paying off.',
      confidence: 0.85,
    },
    {
      type: 'achievement',
      title: 'Social Connection Milestone',
      description: 'You\'ve maintained meaningful social connections for 3 consecutive weeks, contributing to emotional stability.',
      confidence: 0.92,
    },
    {
      type: 'recommendation',
      title: 'Evening Wind-Down',
      description: 'Consider adding a structured evening routine. Entries following poor sleep show decreased mood and productivity.',
      confidence: 0.78,
    },
  ],
  areas_of_concern: [
    {
      category: 'Sleep Quality',
      severity: 'medium',
      description: 'Sleep-related concerns appear in 30% of your entries this week.',
      suggested_actions: [
        'Set a consistent bedtime alarm',
        'Create a device-free wind-down routine',
        'Consider limiting caffeine after 2pm',
      ],
    },
  ],
  goal_progress: [
    {
      goal_id: '1',
      goal_title: 'Daily Meditation Practice',
      progress_change: 8,
      analysis_notes: 'Strong consistency this week with 6 out of 7 days completed.',
    },
    {
      goal_id: '2',
      goal_title: 'Improve Sleep Quality',
      progress_change: -5,
      analysis_notes: 'Some setbacks noted. Consider reviewing evening habits.',
    },
  ],
  summary: 'Overall, this has been a balanced week with notable highs around social connection and meditation practice. The main area for focus is establishing better sleep hygiene, which appears to significantly impact your following day\'s wellbeing.',
  created_at: '2024-12-28T12:00:00Z',
};

// ============ MOCK API FUNCTIONS ============
// These simulate API calls - replace with real fetch calls when connecting to backend

let entries = [...mockEntries];
let goals = [...mockGoals];

// Journal API - Connected to real backend
export const journalApi = {
  getEntries: async (params?: {
    limit?: number;
    offset?: number;
    mood?: MoodType;
    tag?: string;
  }): Promise<JournalEntry[]> => {
    // Get entries from backend (supports 'since' parameter, defaults to 30 days ago)
    const since = new Date();
    since.setDate(since.getDate() - 30);

    const entries = await authFetch<JournalEntry[]>(
      `/get_journal_entries?since=${since.toISOString()}`,
      { method: 'GET' }
    );

    // Apply client-side filtering for mood and tag
    let result = entries;
    if (params?.mood) {
      result = result.filter(e => e.mood === params.mood);
    }
    if (params?.tag) {
      result = result.filter(e => e.tags?.includes(params.tag));
    }

    // Apply pagination
    return result.slice(params?.offset || 0, (params?.offset || 0) + (params?.limit || 50));
  },

  getEntry: async (id: string): Promise<JournalEntry | null> => {
    // Get all entries and find the specific one
    const entries = await journalApi.getEntries();
    return entries.find(e => e.id === id) || null;
  },

  createEntry: async (data: { content: string; mood?: MoodType; tags?: string[] }): Promise<JournalEntry> => {
    // Backend only accepts content for now, mood and tags will be stored as part of content or ignored
    const entry = await authFetch<JournalEntry>(
      '/post_journal_entry',
      {
        method: 'POST',
        body: JSON.stringify({ content: data.content }),
      }
    );
    return entry;
  },

  updateEntry: async (id: string, data: Partial<JournalEntry>): Promise<JournalEntry> => {
    // Backend expects journal_entry_id and content
    const entry = await authFetch<JournalEntry>(
      '/update_journal_entry',
      {
        method: 'PUT',
        body: JSON.stringify({
          journal_entry_id: id,
          content: data.content,
        }),
      }
    );
    return entry;
  },

  deleteEntry: async (id: string): Promise<void> => {
    await authFetch<{ message: string }>(
      '/delete_journal_entry',
      {
        method: 'DELETE',
        body: JSON.stringify({ journal_entry_id: id }),
      }
    );
  },
};

// Goals API
export const goalsApi = {
  getGoals: async (): Promise<Goal[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...goals];
  },

  getGoal: async (id: string): Promise<Goal | null> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return goals.find(g => g.id === id) || null;
  },

  createGoal: async (data: Omit<Goal, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Goal> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const newGoal: Goal = {
      ...data,
      id: String(Date.now()),
      user_id: '1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    goals = [...goals, newGoal];
    return newGoal;
  },

  updateGoal: async (id: string, data: Partial<Goal>): Promise<Goal> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = goals.findIndex(g => g.id === id);
    if (index === -1) throw new Error('Goal not found');
    goals[index] = { ...goals[index], ...data, updated_at: new Date().toISOString() };
    return goals[index];
  },

  deleteGoal: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    goals = goals.filter(g => g.id !== id);
  },
};

// Analysis API
export const analysisApi = {
  triggerAnalysis: async (startDate: string, endDate: string): Promise<AnalysisResult> => {
    // Simulate longer processing time for AI analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    return {
      ...mockAnalysis,
      id: String(Date.now()),
      start_date: startDate,
      end_date: endDate,
      created_at: new Date().toISOString(),
    };
  },

  getAnalysisHistory: async (): Promise<AnalysisResult[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [mockAnalysis];
  },

  getAnalysis: async (id: string): Promise<AnalysisResult | null> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    if (id === mockAnalysis.id) return mockAnalysis;
    return null;
  },
};

// User API
export const userApi = {
  getProfile: async (): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockUser;
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { ...mockUser, ...data };
  },
};

export { authFetch };
