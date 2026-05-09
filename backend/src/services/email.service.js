// Email Service — handles transactional emails (e.g., results notification, password reset)
// Future integration: Resend, Nodemailer, SendGrid, etc.

/**
 * sendResultEmail — Notifies a student of their exam result.
 * @param {string} toEmail - Recipient email
 * @param {object} result - Result data { studentName, examTitle, totalScore, feedback }
 */
export const sendResultEmail = async (toEmail, result) => {
  // TODO: Integrate with email provider
  throw new Error('Email service not yet implemented');
};
