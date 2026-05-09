import supabase from '../../utils/supabase.js';
import prisma from '../../utils/prisma.js';

/**
 * verifyToken — Validates the Supabase JWT from the Authorization header.
 * Attaches the full DB user to req.user for use in downstream controllers.
 */
export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'No token provided or invalid format. Use: Bearer <token>',
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify token via Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid or expired token',
      });
    }

    // Fetch the full user record from our Prisma DB
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });

    if (!dbUser) {
      return res.status(401).json({
        status: 'error',
        message: 'Authenticated user not found in database',
      });
    }

    req.user = dbUser;
    next();
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Internal server error during authentication',
    });
  }
};

/**
 * restrictTo — Role-based access control guard.
 * Usage: restrictTo('LECTURER') or restrictTo('STUDENT', 'LECTURER')
 */
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: `Access denied. Required role(s): ${roles.join(', ')}`,
      });
    }
    next();
  };
};
