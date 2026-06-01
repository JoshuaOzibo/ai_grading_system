import examRepository from './exam.repository.js';

class ExamService {
  async createExam(lecturerId, examData) {
    const { title, description, duration, startDate, endDate } = examData;

    if (!title) throw new Error('Exam title is required');
    if (!duration || duration <= 0) throw new Error('Valid duration is required');
    if (!startDate || !endDate) throw new Error('Start and end dates are required');

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error('Invalid date formats');
    }

    if (start >= end) {
      throw new Error('Start date must be before end date');
    }

    return await examRepository.create({
      title,
      description: description || null,
      duration: parseInt(duration, 10),
      startDate: start,
      endDate: end,
      status: 'DRAFT',
      lecturerId,
    });
  }

  async getExams(user) {
    if (user.role === 'ADMIN') {
      return await examRepository.findAll();
    }
    if (user.role === 'LECTURER') {
      return await examRepository.findByLecturerId(user.id);
    }
    // Students see published exams
    return await examRepository.findPublished();
  }

  async getExamById(user, examId) {
    const includeQuestions = user.role === 'LECTURER' || user.role === 'ADMIN';
    const exam = await examRepository.findById(examId, includeQuestions);

    if (!exam) throw new Error('Exam not found');

    if (user.role === 'STUDENT' && exam.status !== 'PUBLISHED') {
      throw new Error('Access denied. Exam is not published.');
    }

    return exam;
  }

  async updateExam(lecturerId, examId, updateData) {
    const exam = await examRepository.findById(examId);

    if (!exam) throw new Error('Exam not found');
    if (exam.lecturerId !== lecturerId) throw new Error('Access denied. You are not the creator of this exam.');
    if (exam.status !== 'DRAFT') throw new Error('Only draft exams can be modified.');

    const allowedUpdates = {};
    if (updateData.title !== undefined) allowedUpdates.title = updateData.title;
    if (updateData.description !== undefined) allowedUpdates.description = updateData.description;
    if (updateData.duration !== undefined) {
      const duration = parseInt(updateData.duration, 10);
      if (isNaN(duration) || duration <= 0) throw new Error('Valid duration is required');
      allowedUpdates.duration = duration;
    }

    if (updateData.startDate || updateData.endDate) {
      const start = new Date(updateData.startDate || exam.startDate);
      const end = new Date(updateData.endDate || exam.endDate);
      if (start >= end) throw new Error('Start date must be before end date');
      allowedUpdates.startDate = start;
      allowedUpdates.endDate = end;
    }

    return await examRepository.update(examId, allowedUpdates);
  }

  async publishExam(lecturerId, examId) {
    const exam = await examRepository.findById(examId);

    if (!exam) throw new Error('Exam not found');
    if (exam.lecturerId !== lecturerId) throw new Error('Access denied. You are not the creator of this exam.');
    if (exam.status === 'PUBLISHED') throw new Error('Exam is already published.');

    return await examRepository.update(examId, { status: 'PUBLISHED' });
  }

  async deleteExam(user, examId) {
    const exam = await examRepository.findById(examId);

    if (!exam) throw new Error('Exam not found');

    // Only creator lecturer or admin can delete
    if (user.role !== 'ADMIN' && exam.lecturerId !== user.id) {
      throw new Error('Access denied. Unauthorized to delete this exam.');
    }

    return await examRepository.delete(examId);
  }
}

export default new ExamService();
