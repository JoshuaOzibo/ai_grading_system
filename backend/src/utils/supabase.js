import { createClient } from '@supabase/supabase-js';
import env from '../config/env.js';

const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey);

export default supabase;
