import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import env from '../config/env.js';

async function deleteAllUsers() {
  console.log('=== STARTING USER DELETION SCRIPT ===');

  // 1. Delete from Supabase Auth via Admin Service Role Key
  if (env.supabaseUrl && env.supabaseServiceKey) {
    try {
      console.log('Connecting to Supabase Auth API...');
      const supabaseAdmin = createClient(env.supabaseUrl, env.supabaseServiceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      if (listError) {
        console.error('Error listing Supabase Auth users:', listError.message);
      } else {
        console.log(`Found ${users.length} users in Supabase Auth.`);
        for (const user of users) {
          const { error: deleteErr } = await supabaseAdmin.auth.admin.deleteUser(user.id);
          if (deleteErr) {
            console.error(`Failed to delete user ${user.id} (${user.email}) from Supabase Auth:`, deleteErr.message);
          } else {
            console.log(`Deleted user ${user.email} (${user.id}) from Supabase Auth.`);
          }
        }
      }
    } catch (err) {
      console.error('Supabase Auth cleanup error:', err.message);
    }
  }

  // 2. Delete from Local Database via Prisma
  try {
    console.log('Connecting to Local Database via Prisma...');
    const localPrisma = new PrismaClient();
    await localPrisma.$transaction([
      localPrisma.answer.deleteMany({}),
      localPrisma.submission.deleteMany({}),
      localPrisma.question.deleteMany({}),
      localPrisma.exam.deleteMany({}),
      localPrisma.user.deleteMany({}),
    ]);
    console.log('Successfully cleared all users and related records from Local Database.');
    await localPrisma.$disconnect();
  } catch (err) {
    console.error('Local Database cleanup error:', err.message);
  }

  // 3. Delete from Remote Supabase Database
  const remoteUrl = 'postgresql://postgres.kvosmvmkvhkrofxmntja:Joshuachinedu%402000@aws-0-eu-west-1.pooler.supabase.com:5432/postgres';
  try {
    console.log('Connecting to Remote Supabase Database via Prisma...');
    const remotePrisma = new PrismaClient({
      datasources: {
        db: {
          url: remoteUrl,
        },
      },
    });
    await remotePrisma.$transaction([
      remotePrisma.answer.deleteMany({}),
      remotePrisma.submission.deleteMany({}),
      remotePrisma.question.deleteMany({}),
      remotePrisma.exam.deleteMany({}),
      remotePrisma.user.deleteMany({}),
    ]);
    console.log('Successfully cleared all users and related records from Remote Supabase Database.');
    await remotePrisma.$disconnect();
  } catch (err) {
    console.error('Remote Supabase Database cleanup error:', err.message);
  }

  console.log('=== USER DELETION COMPLETED ===');
}

deleteAllUsers();
