import analyticsService from './analytics.service.js';
import { sendSuccess, sendError } from '../../common/helpers/response.js';
import { HTTP_STATUS } from '../../common/constants/index.js';

class AnalyticsController {
  async getExamAnalytics(req, res) {
    try {
      const stats = await analyticsService.getExamAnalytics(req.user, req.params.examId);
      return sendSuccess(res, {
        statusCode: HTTP_STATUS.OK,
        message: 'Exam analytics retrieved successfully',
        data: stats,
      });
    } catch (error) {
      return sendError(res, {
        statusCode: HTTP_STATUS.BAD_REQUEST,
        message: error.message,
      });
    }
  }

  async getGlobalAnalytics(req, res) {
    try {
      const stats = await analyticsService.getGlobalAnalytics();
      return sendSuccess(res, {
        statusCode: HTTP_STATUS.OK,
        message: 'Global analytics retrieved successfully',
        data: stats,
      });
    } catch (error) {
      return sendError(res, {
        statusCode: HTTP_STATUS.BAD_REQUEST,
        message: error.message,
      });
    }
  }
}

export default new AnalyticsController();
