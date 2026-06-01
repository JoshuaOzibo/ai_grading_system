import questionRepository from './question.repository.js';
import examRepository from '../exams/exam.repository.js';
import * as aiService from '../../services/ai.service.js';

class QuestionService {
  async addQuestion(lecturerId, questionData) {
    const { examId, type, text, points, options, correctOption, expectedAnswer, aiMarkingGuide } = questionData;

    if (!examId) throw new Error('Exam ID is required');
    if (!text) throw new Error('Question text is required');
    if (!type || !['MCQ', 'ESSAY'].includes(type)) throw new Error('Valid question type (MCQ or ESSAY) is required');

    const exam = await examRepository.findById(examId);
    if (!exam) throw new Error('Exam not found');
    if (exam.lecturerId !== lecturerId) throw new Error('Access denied. You do not own this exam.');
    if (exam.status !== 'DRAFT') throw new Error('Cannot add questions to a published or archived exam.');

    const qPoints = points ? parseInt(points, 10) : 1;
    if (isNaN(qPoints) || qPoints <= 0) throw new Error('Points must be a positive number');

    const data = {
      examId,
      type,
      text,
      points: qPoints,
    };

    if (type === 'MCQ') {
      if (!options || !Array.isArray(options) || options.length < 2) {
        throw new Error('MCQ questions must have at least 2 options');
      }
      if (!correctOption) throw new Error('MCQ questions must specify the correctOption');
      data.options = options;
      data.correctOption = correctOption;
    } else if (type === 'ESSAY') {
      data.expectedAnswer = expectedAnswer || null;
      data.aiMarkingGuide = aiMarkingGuide || null;
    }

    return await questionRepository.create(data);
  }

  async getQuestions(user, examId) {
    const exam = await examRepository.findById(examId);
    if (!exam) throw new Error('Exam not found');

    if (user.role === 'STUDENT') {
      if (exam.status !== 'PUBLISHED') {
        throw new Error('Access denied. Exam is not published.');
      }
      
      const questions = await questionRepository.findByExamId(examId);
      // Strip answers for students to prevent cheating
      return questions.map(q => {
        const { correctOption, expectedAnswer, aiMarkingGuide, ...safeQuestion } = q;
        return safeQuestion;
      });
    }

    // Lecturers and Admins get full question details including correct answers
    if (user.role === 'LECTURER' && exam.lecturerId !== user.id) {
      throw new Error('Access denied. You do not own this exam.');
    }

    return await questionRepository.findByExamId(examId);
  }

  async updateQuestion(lecturerId, questionId, updateData) {
    const question = await questionRepository.findById(questionId);
    if (!question) throw new Error('Question not found');

    const exam = question.exam;
    if (exam.lecturerId !== lecturerId) throw new Error('Access denied. You do not own this exam.');
    if (exam.status !== 'DRAFT') throw new Error('Cannot modify questions on a published or archived exam.');

    const allowedUpdates = {};
    if (updateData.text !== undefined) allowedUpdates.text = updateData.text;
    if (updateData.points !== undefined) {
      const pts = parseInt(updateData.points, 10);
      if (isNaN(pts) || pts <= 0) throw new Error('Points must be a positive number');
      allowedUpdates.points = pts;
    }

    if (question.type === 'MCQ') {
      if (updateData.options !== undefined) {
        if (!Array.isArray(updateData.options) || updateData.options.length < 2) {
          throw new Error('MCQ questions must have at least 2 options');
        }
        allowedUpdates.options = updateData.options;
      }
      if (updateData.correctOption !== undefined) {
        allowedUpdates.correctOption = updateData.correctOption;
      }
    } else {
      if (updateData.expectedAnswer !== undefined) allowedUpdates.expectedAnswer = updateData.expectedAnswer;
      if (updateData.aiMarkingGuide !== undefined) allowedUpdates.aiMarkingGuide = updateData.aiMarkingGuide;
    }

    return await questionRepository.update(questionId, allowedUpdates);
  }

  async deleteQuestion(lecturerId, questionId) {
    const question = await questionRepository.findById(questionId);
    if (!question) throw new Error('Question not found');

    const exam = question.exam;
    if (exam.lecturerId !== lecturerId) throw new Error('Access denied. You do not own this exam.');
    if (exam.status !== 'DRAFT') throw new Error('Cannot delete questions from a published or archived exam.');

    return await questionRepository.delete(questionId);
  }

  async aiSuggest(lecturerId, questionText) {
    if (!questionText) throw new Error('Question text is required for AI suggestion');
    return await aiService.generateIdealAnswer(questionText);
  }
}

export default new QuestionService();
