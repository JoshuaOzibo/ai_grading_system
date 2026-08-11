import examRepository from './exam.repository.js';
import { generateExamQuestions } from '../../services/ai.service.js';

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

  async generateExamWithAI(lecturerId, { topic, numQuestions, questionType }) {
    console.log(`[AI Exam Generation] Received request from Lecturer ID: ${lecturerId}`);
    console.log(`[AI Exam Generation] Parameters - Topic: "${topic}", Question Count: ${numQuestions}, Type: "${questionType}"`);

    if (!topic) {
      console.error('[AI Exam Generation] Error: Topic is required');
      throw new Error('Topic is required');
    }
    const count = parseInt(numQuestions, 10) || 5;
    const type = questionType === 'MCQ' ? 'MCQ' : 'ESSAY';

    console.log(`[AI Exam Generation] Invoking AI Service to generate ${count} ${type} questions on topic...`);
    // Call AI service to generate exam and questions
    const generatedData = await generateExamQuestions(topic, count, type);

    console.log(`[AI Exam Generation] AI response received successfully. Exam Title: "${generatedData.title}"`);
    console.log(`[AI Exam Generation] Creating exam in database...`);

    const startDate = new Date();
    const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

    // Create the exam
    const exam = await examRepository.create({
      title: generatedData.title || `${topic} Assessment`,
      description: generatedData.description || `Auto-generated exam covering ${topic}`,
      duration: type === 'MCQ' ? 30 : 60,
      startDate,
      endDate,
      status: 'DRAFT',
      lecturerId,
    });

    console.log(`[AI Exam Generation] Created Exam record. ID: ${exam.id}`);

    // Create all generated questions in the database
    const { default: prisma } = await import('../../utils/prisma.js');
    if (generatedData.questions && generatedData.questions.length > 0) {
      console.log(`[AI Exam Generation] Saving ${generatedData.questions.length} questions to database...`);
      for (const [index, q] of generatedData.questions.entries()) {
        const createdQ = await prisma.question.create({
          data: {
            examId: exam.id,
            type: type,
            text: q.text,
            points: parseInt(q.points, 10) || (type === 'MCQ' ? 2 : 5),
            options: type === 'MCQ' ? (q.options || []) : [],
            correctOption: type === 'MCQ' ? (q.correctOption || 'A') : null,
            expectedAnswer: type === 'ESSAY' ? (q.expectedAnswer || '') : null,
            aiMarkingGuide: type === 'ESSAY' ? (q.aiMarkingGuide || '') : null,
          }
        });
        console.log(`   -> Saved Question ${index + 1}: "${q.text.substring(0, 50)}..." [ID: ${createdQ.id}]`);
      }
    } else {
      console.warn('[AI Exam Generation] Warning: No questions returned from the generator.');
    }

    console.log(`[AI Exam Generation] Complete. Successfully built Exam ID: ${exam.id}`);
    return exam;
  }
}

export default new ExamService();
