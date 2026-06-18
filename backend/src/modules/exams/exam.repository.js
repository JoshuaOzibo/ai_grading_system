import prisma from '../../utils/prisma.js';

class ExamRepository {
  async create(data) {
    return await prisma.exam.create({
      data,
    });
  }

  async findById(id, includeQuestions = false) {
    return await prisma.exam.findUnique({
      where: { id },
      include: {
        questions: includeQuestions,
      },
    });
  }

  async findByLecturerId(lecturerId) {
    return await prisma.exam.findMany({
      where: { lecturerId },
      orderBy: { createdAt: 'desc' },
      include: {
        lecturer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: {
            questions: true,
            submissions: true,
          },
        },
      },
    });
  }

  async findPublished() {
    return await prisma.exam.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { startDate: 'asc' },
      include: {
        lecturer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: {
            questions: true,
            submissions: true,
          },
        },
      },
    });
  }

  async findAll() {
    return await prisma.exam.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        lecturer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async update(id, data) {
    return await prisma.exam.update({
      where: { id },
      data,
    });
  }

  async delete(id) {
    return await prisma.exam.delete({
      where: { id },
    });
  }
}

export default new ExamRepository();
