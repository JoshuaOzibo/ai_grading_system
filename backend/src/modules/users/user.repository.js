import prisma from '../../utils/prisma.js';

class UserRepository {
  async findById(id) {
    return await prisma.user.findUnique({
      where: { id },
    });
  }

  async update(id, data) {
    return await prisma.user.update({
      where: { id },
      data,
    });
  }

  async findAll() {
    return await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}

export default new UserRepository();
