import { createClient } from '@supabase/supabase-js';
import env from '../config/env.js';

async function deleteRemoteSupabaseUsers() {
  console.log('=== STARTING SUPABASE REST CLEANUP SCRIPT ===');

  if (!env.supabaseUrl || !env.supabaseServiceKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in environment variables!');
    return;
  }

  const supabaseAdmin = createClient(env.supabaseUrl, env.supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 1. Delete from Supabase Auth Users
  console.log('1. Fetching users from Supabase Auth...');
  const { data: authUsersData, error: authListErr } = await supabaseAdmin.auth.admin.listUsers();

  if (authListErr) {
    console.error('Error listing Supabase Auth users:', authListErr.message);
  } else {
    const authUsers = authUsersData.users || [];
    console.log(`Found ${authUsers.length} users in Supabase Auth.`);
    for (const user of authUsers) {
      console.log(`Deleting Auth user: ${user.email} (${user.id})...`);
      const { error: delErr } = await supabaseAdmin.auth.admin.deleteUser(user.id);
      if (delErr) {
        console.error(`Failed to delete auth user ${user.id}:`, delErr.message);
      } else {
        console.log(`Successfully deleted Auth user ${user.email}`);
      }
    }
  }

  // 2. Delete all records from database tables via Supabase REST API
  console.log('2. Deleting records from database tables via Supabase REST API...');

  const tables = ['answers', 'submissions', 'questions', 'exams', 'notifications', 'users'];
  for (const table of tables) {
    try {
      const { data, error } = await supabaseAdmin
        .from(table)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // matches all rows
      
      if (error) {
        console.log(`Table ${table} deletion status: ${error.message}`);
      } else {
        console.log(`Successfully cleared table: ${table}`);
      }
    } catch (err) {
      console.error(`Error deleting from ${table}:`, err.message);
    }
  }

  console.log('=== SUPABASE REST CLEANUP COMPLETED ===');
}

deleteRemoteSupabaseUsers();
