import dotenv from 'dotenv';
import path from 'path';

// Load .env from workspace root
dotenv.config({path: path.resolve(process.cwd(), '.env')});

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  supabaseUrl: process.env.SUPABASE_URL?.trim() || '',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY?.trim() || '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || '',
  geminiApiKey: process.env.GEMINI_API_KEY?.trim() || '',
  nodeEnv: process.env.NODE_ENV || 'development',
  get isSupabaseConfigured(): boolean {
    return (
      Boolean(this.supabaseUrl) &&
      this.supabaseUrl !== 'https://your-project.supabase.co' &&
      Boolean(this.supabaseAnonKey || this.supabaseServiceRoleKey)
    );
  },
  get isGeminiConfigured(): boolean {
    return Boolean(this.geminiApiKey) && this.geminiApiKey !== 'MY_GEMINI_API_KEY';
  },
};
