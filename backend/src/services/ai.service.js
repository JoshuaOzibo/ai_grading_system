// AI Service — integrates with Gemini or OpenAI
// Used by: modules/questions (AI answer generation), modules/submissions (AI essay grading)

/**
 * generateIdealAnswer — Calls the AI provider to generate an expected answer for a question.
 * @param {string} question - The exam question text
 * @returns {{ answer: string, markingGuide: string }}
 */
export const generateIdealAnswer = async (question) => {
  // TODO: Integrate with Gemini / OpenAI API
  throw new Error('AI service not yet implemented');
};

/**
 * gradeEssay — Sends student answer to AI for evaluation against expected answer.
 * @param {string} question - The exam question text
 * @param {string} studentAnswer - The student's written answer
 * @param {string} expectedAnswer - The lecturer-defined or AI-generated ideal answer
 * @returns {{ score: number, feedback: string }}
 */
export const gradeEssay = async (question, studentAnswer, expectedAnswer) => {
  // TODO: Integrate with Gemini / OpenAI API
  throw new Error('AI grading service not yet implemented');
};
