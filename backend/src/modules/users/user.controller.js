import userService from '../../services/user.service.js';
import { sendSuccess, sendError } from '../../common/helpers/response.js';
import { HTTP_STATUS } from '../../common/constants/index.js';

class UserController {
  async getProfile(req, res) {
    try {
      const user = await userService.getProfile(req.user.id);
      return sendSuccess(res, {
        statusCode: HTTP_STATUS.OK,
        message: 'Profile retrieved successfully',
        data: user,
      });
    } catch (error) {
      return sendError(res, {
        statusCode: HTTP_STATUS.BAD_REQUEST,
        message: error.message,
      });
    }
  }

  async updateProfile(req, res) {
    try {
      const user = await userService.updateProfile(req.user.id, req.body);
      return sendSuccess(res, {
        statusCode: HTTP_STATUS.OK,
        message: 'Profile updated successfully',
        data: user,
      });
    } catch (error) {
      return sendError(res, {
        statusCode: HTTP_STATUS.BAD_REQUEST,
        message: error.message,
      });
    }
  }

  async getAllUsers(req, res) {
    try {
      const users = await userService.getAllUsers();
      return sendSuccess(res, {
        statusCode: HTTP_STATUS.OK,
        message: 'All users retrieved successfully',
        data: users,
      });
    } catch (error) {
      return sendError(res, {
        statusCode: HTTP_STATUS.BAD_REQUEST,
        message: error.message,
      });
    }
  }

  async verifyLecturer(req, res) {
    try {
      const { isVerified } = req.body;
      if (isVerified === undefined) {
        return sendError(res, {
          statusCode: HTTP_STATUS.BAD_REQUEST,
          message: 'isVerified field is required',
        });
      }

      const user = await userService.verifyLecturer(req.params.id, isVerified);
      return sendSuccess(res, {
        statusCode: HTTP_STATUS.OK,
        message: `Lecturer verification status updated to ${isVerified}`,
        data: user,
      });
    } catch (error) {
      return sendError(res, {
        statusCode: HTTP_STATUS.BAD_REQUEST,
        message: error.message,
      });
    }
  }
}

export default new UserController();
