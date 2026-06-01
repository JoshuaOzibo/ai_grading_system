import examService from './exam.service.js';
import { sendSuccess, sendError } from '../../common/helpers/response.js';
import { HTTP_STATUS } from '../../common/constants/index.js';

class ExamController {
  async createExam(req, res) {
    try {
      const exam = await examService.createExam(req.user.id, req.body);
      return sendSuccess(res, {
        statusCode: HTTP_STATUS.CREATED,
        message: 'Exam created successfully in draft',
        data: exam,
      });
    } catch (error) {
      return sendError(res, {
        statusCode: HTTP_STATUS.BAD_REQUEST,
        message: error.message,
      });
    }
  }

  async getExams(req, res) {
    try {
      const exams = await examService.getExams(req.user);
      return sendSuccess(res, {
        statusCode: HTTP_STATUS.OK,
        message: 'Exams retrieved successfully',
        data: exams,
      });
    } catch (error) {
      return sendError(res, {
        statusCode: HTTP_STATUS.BAD_REQUEST,
        message: error.message,
      });
    }
  }

  async getExamById(req, res) {
    try {
      const exam = await examService.getExamById(req.user, req.params.id);
      return sendSuccess(res, {
        statusCode: HTTP_STATUS.OK,
        message: 'Exam details retrieved successfully',
        data: exam,
      });
    } catch (error) {
      return sendError(res, {
        statusCode: HTTP_STATUS.BAD_REQUEST,
        message: error.message,
      });
    }
  }

  async updateExam(req, res) {
    try {
      const exam = await examService.updateExam(req.user.id, req.params.id, req.body);
      return sendSuccess(res, {
        statusCode: HTTP_STATUS.OK,
        message: 'Exam updated successfully',
        data: exam,
      });
    } catch (error) {
      return sendError(res, {
        statusCode: HTTP_STATUS.BAD_REQUEST,
        message: error.message,
      });
    }
  }

  async publishExam(req, res) {
    try {
      const exam = await examService.publishExam(req.user.id, req.params.id);
      return sendSuccess(res, {
        statusCode: HTTP_STATUS.OK,
        message: 'Exam published successfully',
        data: exam,
      });
    } catch (error) {
      return sendError(res, {
        statusCode: HTTP_STATUS.BAD_REQUEST,
        message: error.message,
      });
    }
  }

  async deleteExam(req, res) {
    try {
      await examService.deleteExam(req.user, req.params.id);
      return sendSuccess(res, {
        statusCode: HTTP_STATUS.OK,
        message: 'Exam deleted successfully',
      });
    } catch (error) {
      return sendError(res, {
        statusCode: HTTP_STATUS.BAD_REQUEST,
        message: error.message,
      });
    }
  }
}

export default new ExamController();
