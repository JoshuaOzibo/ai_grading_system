import userRepository from './user.repository.js';

class UserService {
  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) throw new Error('User not found');
    return user;
  }

  async updateProfile(userId, updateData) {
    const user = await userRepository.findById(userId);
    if (!user) throw new Error('User not found');

    // Only allow updating first name, last name, and avatar URL
    const allowedUpdates = {};
    if (updateData.firstName !== undefined) allowedUpdates.firstName = updateData.firstName;
    if (updateData.lastName !== undefined) allowedUpdates.lastName = updateData.lastName;
    if (updateData.avatarUrl !== undefined) allowedUpdates.avatarUrl = updateData.avatarUrl;

    // Mark profile as complete if they have first and last names
    const firstName = allowedUpdates.firstName || user.firstName;
    const lastName = allowedUpdates.lastName || user.lastName;

    if (firstName && lastName) {
      allowedUpdates.isProfileComplete = true;
    }

    return await userRepository.update(userId, allowedUpdates);
  }

  async getAllUsers() {
    return await userRepository.findAll();
  }

  async verifyLecturer(userId, isVerified) {
    const user = await userRepository.findById(userId);
    if (!user) throw new Error('User not found');

    if (user.role !== 'LECTURER') {
      throw new Error('Only LECTURER profiles can be verified/unverified');
    }

    return await userRepository.update(userId, { isVerified });
  }
}

export default new UserService();
