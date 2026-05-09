import supabase from '../../utils/supabase.js';
import authRepository from './auth.repository.js';

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

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { firstName, lastName, role },
      },
    });

    if (authError) throw new Error(authError.message);

    const dbUser = await authRepository.createUser({
      id: authData.user.id,
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
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) throw new Error(error.message);

    const dbUser = await authRepository.findUserById(data.user.id);
    if (!dbUser) throw new Error('User profile not found');

    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      user: dbUser,
    };
  }

  async logout(token) {
    const { error } = await supabase.auth.signOut(token);
    if (error) throw new Error(error.message);
  }
}

export default new AuthService();
