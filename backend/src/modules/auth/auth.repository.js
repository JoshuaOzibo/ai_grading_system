import prisma from '../../utils/prisma.js';

class AuthRepository {
  async createUser(data) {
    return await prisma.user.create({ data });
  }

  async findUserById(id) {
    return await prisma.user.findUnique({ where: { id } });
  }

  async findUserByEmail(email) {
    return await prisma.user.findUnique({ where: { email } });
  }

  async findUserByMatricNumber(matricNumber) {
    return await prisma.user.findUnique({ where: { matricNumber } });
  }

  async findUserByStaffId(staffId) {
    return await prisma.user.findUnique({ where: { staffId } });
  }
}

export default new AuthRepository();
