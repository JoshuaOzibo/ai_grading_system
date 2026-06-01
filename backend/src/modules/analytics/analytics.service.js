import analyticsRepository from './analytics.repository.js';
import examRepository from '../exams/exam.repository.js';

class AnalyticsService {
  async getExamAnalytics(user, examId) {
    const exam = await examRepository.findById(examId);
    if (!exam) throw new Error('Exam not found');

    // Only creator lecturer or admin can access analytics
    if (user.role !== 'ADMIN' && exam.lecturerId !== user.id) {
      throw new Error('Access denied. You do not have permission to view analytics for this exam.');
    }

    const stats = await analyticsRepository.getExamStats(examId);
    return {
      exam: {
        id: exam.id,
        title: exam.title,
        status: exam.status,
      },
      stats,
    };
  }

  async getGlobalAnalytics() {
    return await analyticsRepository.getGlobalStats();
  }
}

export default new AnalyticsService();
