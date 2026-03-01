import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Safe client — works in demo mode even without real Supabase credentials
const isDemoMode = !supabaseUrl || supabaseUrl.includes('your_supabase') || !supabaseUrl.startsWith('http');

// Provide a valid placeholder URL for demo mode so the client doesn't throw
export const supabase = createClient(
  isDemoMode ? 'https://placeholder.supabase.co' : supabaseUrl,
  isDemoMode ? 'placeholder_anon_key' : supabaseAnonKey
);


export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string | null;
          email: string | null;
          role: 'student' | 'company';
        };
        Insert: {
          id: string;
          name?: string;
          email?: string;
          role: 'student' | 'company';
        };
      };
      resumes: {
        Row: {
          id: string;
          user_id: string;
          file_name: string;
          resume_text: string;
          uploaded_at: string;
        };
        Insert: {
          user_id: string;
          file_name: string;
          resume_text: string;
        };
      };
      jobs: {
        Row: {
          id: string;
          company_id: string;
          title: string;
          job_description: string;
          required_skills: string[];
          experience_level: string;
          created_at: string;
        };
        Insert: {
          company_id: string;
          title: string;
          job_description: string;
          required_skills: string[];
          experience_level: string;
        };
      };
      scores: {
        Row: {
          id: string;
          resume_id: string;
          job_id: string | null;
          match_score: number;
          experience_score: number;
          ats_score: number;
          missing_skills: string[];
          suggestions: string[];
          feedback: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          resume_id: string;
          job_id?: string;
          match_score: number;
          experience_score: number;
          ats_score: number;
          missing_skills: string[];
          suggestions: string[];
          feedback: Record<string, unknown>;
        };
      };
    };
  };
};
