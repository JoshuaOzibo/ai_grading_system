import prisma from '../../utils/prisma.js';

class QuestionRepository {
  async create(data) {
    return await prisma.question.create({
      data,
    });
  }

  async findById(id) {
    return await prisma.question.findUnique({
      where: { id },
      include: {
        exam: true,
      },
    });
  }

  async findByExamId(examId) {
    return await prisma.question.findMany({
      where: { examId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async update(id, data) {
    return await prisma.question.update({
      where: { id },
      data,
    });
  }

  async delete(id) {
    return await prisma.question.delete({
      where: { id },
    });
  }
}

export default new QuestionRepository();
