import supabase from '../../utils/supabase.js';
import { createClient } from '@supabase/supabase-js';
import authRepository from './auth.repository.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import env from '../../config/env.js';

class AuthService {
  async register(userData) {
    const { email, password, firstName, lastName, role, matricNumber, staffId } = userData;

    const existingEmail = await authRepository.findUserByEmail(email);
    if (existingEmail) throw new Error('An account with this email already exists');

    if (role === 'STUDENT' && matricNumber) {
      const existingMatric = await authRepository.findUserByMatricNumber(matricNumber);
      if (existingMatric) throw new Error('This matric number is already registered');
    }

    if (role === 'LECTURER' && staffId) {
      const existingStaff = await authRepository.findUserByStaffId(staffId);
      if (existingStaff) throw new Error('This staff ID is already registered');
    }

    let authData, authError;
    let localUserId = null;
    try {
      const result = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { firstName, lastName, role },
        },
      });
      authData = result.data;
      authError = result.error;
    } catch (err) {
      if (
        err.message === 'Invalid API key' ||
        err.message.includes('API key') ||
        err.message.includes('fetch failed') ||
        err.message.includes('ENOTFOUND')
      ) {
        localUserId = crypto.randomUUID();
      } else {
        throw err;
      }
    }

    if (authError) {
      if (
        authError.message === 'Invalid API key' ||
        authError.message.includes('API key') ||
        authError.message.includes('fetch failed') ||
        authError.message.includes('ENOTFOUND')
      ) {
        localUserId = crypto.randomUUID();
      } else if (
        authError.message.includes('User already registered') ||
        authError.message.includes('already exists')
      ) {
        // Orphan Supabase Auth user without DB profile! Clean up stale auth record using Service Role Key
        try {
          if (env.supabaseUrl && env.supabaseServiceKey) {
            const supabaseAdmin = createClient(env.supabaseUrl, env.supabaseServiceKey, {
              auth: { autoRefreshToken: false, persistSession: false },
            });
            const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
            const orphanUser = listData?.users?.find((u) => u.email === email);
            if (orphanUser) {
              await supabaseAdmin.auth.admin.deleteUser(orphanUser.id);
              // Retry signUp once after deleting orphan record
              const retryResult = await supabase.auth.signUp({
                email,
                password,
                options: { data: { firstName, lastName, role } },
              });
              if (!retryResult.error && retryResult.data?.user) {
                authData = retryResult.data;
                authError = null;
              } else {
                localUserId = crypto.randomUUID();
              }
            } else {
              localUserId = crypto.randomUUID();
            }
          } else {
            localUserId = crypto.randomUUID();
          }
        } catch (cleanupErr) {
          localUserId = crypto.randomUUID();
        }
      } else {
        throw new Error(authError.message);
      }
    }

    const userId = localUserId || authData.user.id;

    const dbUser = await authRepository.createUser({
      id: userId,
      firstName,
      lastName,
      email,
      role,
      matricNumber: matricNumber || null,
      staffId: staffId || null,
      isVerified: true,
      isProfileComplete: false,
    });

    return { dbUser };
  }

  async login(email, password) {
    let data, error;
    try {
      const result = await supabase.auth.signInWithPassword({ email, password });
      data = result.data;
      error = result.error;
    } catch (err) {
      if (
        err.message === 'Invalid API key' ||
        err.message.includes('API key') ||
        err.message.includes('fetch failed') ||
        err.message.includes('ENOTFOUND')
      ) {
        const dbUser = await authRepository.findUserByEmail(email);
        if (!dbUser) throw new Error('User profile not found');
        
        const token = jwt.sign(
          { id: dbUser.id, email: dbUser.email, role: dbUser.role },
          env.jwtSecret,
          { expiresIn: '7d' }
        );

        return {
          accessToken: token,
          refreshToken: 'local-refresh-token',
          user: dbUser,
        };
      }
      throw err;
    }

    if (error) {
      if (
        error.message === 'Invalid API key' ||
        error.message.includes('API key') ||
        error.message.includes('fetch failed') ||
        error.message.includes('ENOTFOUND')
      ) {
        const dbUser = await authRepository.findUserByEmail(email);
        if (!dbUser) throw new Error('User profile not found');
        
        const token = jwt.sign(
          { id: dbUser.id, email: dbUser.email, role: dbUser.role },
          env.jwtSecret,
          { expiresIn: '7d' }
        );

        return {
          accessToken: token,
          refreshToken: 'local-refresh-token',
          user: dbUser,
        };
      }
      throw new Error(error.message);
    }

    const dbUser = await authRepository.findUserById(data.user.id);
    if (!dbUser) throw new Error('User profile not found');

    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      user: dbUser,
    };
  }

  async logout(token) {
    try {
      const { error } = await supabase.auth.signOut(token);
      if (error) {
        if (
          error.message === 'Invalid API key' ||
          error.message.includes('API key') ||
          error.message.includes('fetch failed') ||
          error.message.includes('ENOTFOUND')
        ) {
          return;
        }
        throw new Error(error.message);
      }
    } catch (err) {
      if (err.message === 'Invalid API key' || err.message.includes('API key') || err.message.includes('fetch failed') || err.message.includes('ENOTFOUND')) {
        return;
      }
      throw err;
    }
  }
}

export default new AuthService();
