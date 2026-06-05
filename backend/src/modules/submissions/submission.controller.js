import submissionService from './submission.service.js';
import { sendSuccess, sendError } from '../../common/helpers/response.js';
import { HTTP_STATUS } from '../../common/constants/index.js';

class SubmissionController {
  async startExam(req, res) {
    try {
      const examSession = await submissionService.startExam(req.user.id, req.params.examId);
      return sendSuccess(res, {
        statusCode: HTTP_STATUS.OK,
        message: 'Exam session started successfully',
        data: examSession,
      });
    } catch (error) {
      return sendError(res, {
        statusCode: HTTP_STATUS.BAD_REQUEST,
        message: error.message,
      });
    }
  }

  async submitExam(req, res) {
    try {
      const { answers } = req.body;
      if (!answers || !Array.isArray(answers)) {
        return sendError(res, {
          statusCode: HTTP_STATUS.BAD_REQUEST,
          message: 'answers array is required in request body',
        });
      }

      const result = await submissionService.submitExam(req.user.id, req.params.examId, answers);
      return sendSuccess(res, {
        statusCode: HTTP_STATUS.OK,
        message: result.message,
        data: result,
      });
    } catch (error) {
      return sendError(res, {
        statusCode: HTTP_STATUS.BAD_REQUEST,
        message: error.message,
      });
    }
  }

  async getSubmissionsByExam(req, res) {
    try {
      const submissions = await submissionService.getSubmissionsByExam(req.user.id, req.params.examId);
      return sendSuccess(res, {
        statusCode: HTTP_STATUS.OK,
        message: 'Submissions retrieved successfully',
        data: submissions,
      });
    } catch (error) {
      return sendError(res, {
        statusCode: HTTP_STATUS.BAD_REQUEST,
        message: error.message,
      });
    }
  }

  async getSubmissionDetails(req, res) {
    try {
      const submission = await submissionService.getSubmissionDetails(req.user, req.params.id);
      return sendSuccess(res, {
        statusCode: HTTP_STATUS.OK,
        message: 'Submission details retrieved successfully',
        data: submission,
      });
    } catch (error) {
      return sendError(res, {
        statusCode: HTTP_STATUS.BAD_REQUEST,
        message: error.message,
      });
    }
  }

  async getMySubmissions(req, res) {
    try {
      const submissions = await submissionService.getMySubmissions(req.user.id);
      return sendSuccess(res, {
        statusCode: HTTP_STATUS.OK,
        message: 'My submissions retrieved successfully',
        data: submissions,
      });
    } catch (error) {
      return sendError(res, {
        statusCode: HTTP_STATUS.BAD_REQUEST,
        message: error.message,
      });
    }
  }
}

export default new SubmissionController();
