import 'dotenv/config';

const env = {
  // Server
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',

  // Database
  databaseUrl: process.env.DATABASE_URL,

  // Supabase
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
  supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY,

  // JWT (for any custom signing alongside Supabase)
  jwtSecret: process.env.JWT_SECRET,
};

// Validate critical env variables at startup
const required = ['databaseUrl', 'supabaseUrl', 'supabaseAnonKey'];
for (const key of required) {
  if (!env[key]) {
    throw new Error(`Missing required environment variable: env.${key}`);
  }
}

export default env;
