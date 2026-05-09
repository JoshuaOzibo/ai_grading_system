import authService from './auth.service.js';
import { sendSuccess, sendError } from '../../common/helpers/response.js';

class AuthController {
  async register(req, res) {
    try {
      const result = await authService.register(req.body);
      return sendSuccess(res, {
        statusCode: 201,
        message: 'Account registered successfully',
        data: { user: result.dbUser },
      });
    } catch (error) {
      return sendError(res, { statusCode: 400, message: error.message });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Login successful',
        data: {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          user: result.user,
        },
      });
    } catch (error) {
      return sendError(res, { statusCode: 401, message: error.message });
    }
  }

  async logout(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (token) await authService.logout(token);
      return sendSuccess(res, { message: 'Logged out successfully' });
    } catch (error) {
      return sendError(res, { statusCode: 500, message: error.message });
    }
  }

  async me(req, res) {
    return sendSuccess(res, {
      message: 'Authenticated user fetched',
      data: { user: req.user },
    });
  }
}

export default new AuthController();
