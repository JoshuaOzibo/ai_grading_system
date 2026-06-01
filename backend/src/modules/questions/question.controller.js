import questionService from './question.service.js';
import { sendSuccess, sendError } from '../../common/helpers/response.js';
import { HTTP_STATUS } from '../../common/constants/index.js';

class QuestionController {
  async addQuestion(req, res) {
    try {
      const question = await questionService.addQuestion(req.user.id, req.body);
      return sendSuccess(res, {
        statusCode: HTTP_STATUS.CREATED,
        message: 'Question added successfully',
        data: question,
      });
    } catch (error) {
      return sendError(res, {
        statusCode: HTTP_STATUS.BAD_REQUEST,
        message: error.message,
      });
    }
  }

  async getQuestions(req, res) {
    try {
      const { examId } = req.query;
      if (!examId) {
        return sendError(res, {
          statusCode: HTTP_STATUS.BAD_REQUEST,
          message: 'examId query parameter is required',
        });
      }

      const questions = await questionService.getQuestions(req.user, examId);
      return sendSuccess(res, {
        statusCode: HTTP_STATUS.OK,
        message: 'Questions retrieved successfully',
        data: questions,
      });
    } catch (error) {
      return sendError(res, {
        statusCode: HTTP_STATUS.BAD_REQUEST,
        message: error.message,
      });
    }
  }

  async updateQuestion(req, res) {
    try {
      const question = await questionService.updateQuestion(req.user.id, req.params.id, req.body);
      return sendSuccess(res, {
        statusCode: HTTP_STATUS.OK,
        message: 'Question updated successfully',
        data: question,
      });
    } catch (error) {
      return sendError(res, {
        statusCode: HTTP_STATUS.BAD_REQUEST,
        message: error.message,
      });
    }
  }

  async deleteQuestion(req, res) {
    try {
      await questionService.deleteQuestion(req.user.id, req.params.id);
      return sendSuccess(res, {
        statusCode: HTTP_STATUS.OK,
        message: 'Question deleted successfully',
      });
    } catch (error) {
      return sendError(res, {
        statusCode: HTTP_STATUS.BAD_REQUEST,
        message: error.message,
      });
    }
  }

  async aiSuggest(req, res) {
    try {
      const { question } = req.body;
      const suggestion = await questionService.aiSuggest(req.user.id, question);
      return sendSuccess(res, {
        statusCode: HTTP_STATUS.OK,
        message: 'AI suggestion generated successfully',
        data: suggestion,
      });
    } catch (error) {
      return sendError(res, {
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: error.message,
      });
    }
  }
}

export default new QuestionController();
