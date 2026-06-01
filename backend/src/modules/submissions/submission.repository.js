import prisma from '../../utils/prisma.js';

class SubmissionRepository {
  async createSubmission(data) {
    return await prisma.submission.create({
      data,
      include: {
        exam: true,
      },
    });
  }

  async findUnique(studentId, examId) {
    return await prisma.submission.findUnique({
      where: {
        studentId_examId: {
          studentId,
          examId,
        },
      },
      include: {
        answers: true,
        exam: true,
      },
    });
  }

  async findById(id) {
    return await prisma.submission.findUnique({
      where: { id },
      include: {
        answers: {
          include: {
            question: true,
          },
        },
        exam: {
          include: {
            questions: true,
          },
        },
        student: {
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

  async updateSubmission(id, data) {
    return await prisma.submission.update({
      where: { id },
      data,
    });
  }

  async saveAnswers(answers) {
    // We can use a transaction or upsert each answer
    return await prisma.$transaction(
      answers.map((ans) =>
        prisma.answer.upsert({
          where: {
            submissionId_questionId: {
              submissionId: ans.submissionId,
              questionId: ans.questionId,
            },
          },
          update: {
            studentInput: ans.studentInput,
            score: ans.score,
            feedback: ans.feedback,
            isGraded: ans.isGraded,
          },
          create: {
            submissionId: ans.submissionId,
            questionId: ans.questionId,
            studentInput: ans.studentInput,
            score: ans.score,
            feedback: ans.feedback,
            isGraded: ans.isGraded,
          },
        })
      )
    );
  }

  async findSubmissionsByExam(examId) {
    return await prisma.submission.findMany({
      where: { examId },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            matricNumber: true,
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });
  }
}

export default new SubmissionRepository();
