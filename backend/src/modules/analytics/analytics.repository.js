import prisma from '../../utils/prisma.js';

class AnalyticsRepository {
  async getExamStats(examId) {
    const totalSubmissions = await prisma.submission.count({
      where: { examId },
    });

    const scoreAggregates = await prisma.submission.aggregate({
      where: {
        examId,
        status: 'GRADED',
      },
      _avg: { score: true },
      _max: { score: true },
      _min: { score: true },
    });

    const statusCounts = await prisma.submission.groupBy({
      by: ['status'],
      where: { examId },
      _count: { _all: true },
    });

    return {
      totalSubmissions,
      averageScore: scoreAggregates._avg.score || 0,
      highestScore: scoreAggregates._max.score || 0,
      lowestScore: scoreAggregates._min.score || 0,
      statusDistribution: statusCounts.map((s) => ({
        status: s.status,
        count: s._count._all,
      })),
    };
  }

  async getGlobalStats() {
    const roleCounts = await prisma.user.groupBy({
      by: ['role'],
      _count: { _all: true },
    });

    const examCounts = await prisma.exam.groupBy({
      by: ['status'],
      _count: { _all: true },
    });

    const totalSubmissions = await prisma.submission.count();

    const lecturerVerificationCounts = await prisma.user.groupBy({
      by: ['isVerified'],
      where: { role: 'LECTURER' },
      _count: { _all: true },
    });

    return {
      usersByRole: roleCounts.map((r) => ({
        role: r.role,
        count: r._count._all,
      })),
      examsByStatus: examCounts.map((e) => ({
        status: e.status,
        count: e._count._all,
      })),
      totalSubmissions,
      lecturersByVerification: lecturerVerificationCounts.map((lv) => ({
        isVerified: lv.isVerified,
        count: lv._count._all,
      })),
    };
  }
}

export default new AnalyticsRepository();
