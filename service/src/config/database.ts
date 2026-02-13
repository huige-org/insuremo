import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from './env';
import { logger } from './logger';

let supabaseClient: SupabaseClient | null = null;

export const createSupabaseClient = (): SupabaseClient => {
  if (!supabaseClient) {
    supabaseClient = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      db: {
        schema: 'public',
      },
    });
    logger.info('Supabase client initialized');
  }
  return supabaseClient;
};

export const getSupabaseClient = (): SupabaseClient => {
  if (!supabaseClient) {
    return createSupabaseClient();
  }
  return supabaseClient;
};

export const closeSupabaseConnection = async (): Promise<void> => {
  if (supabaseClient) {
    supabaseClient = null;
    logger.info('Supabase connection closed');
  }
};
