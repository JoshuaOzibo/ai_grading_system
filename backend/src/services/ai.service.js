// AI Service — integrates with Google Gemini API using native fetch
// Used by: modules/questions (AI answer generation), modules/submissions (AI essay grading)

/**
 * generateIdealAnswer — Calls the Gemini API to generate an expected answer and marking guide for a question.
 * @param {string} question - The exam question text
 * @returns {Promise<{ answer: string, markingGuide: string }>}
 */
export const generateIdealAnswer = async (question) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    console.warn('GEMINI_API_KEY is not set. Returning mock ideal answer and marking guide.');
    return {
      answer: `This is a mock ideal answer for the question: "${question}". It outlines the core concepts, definitions, and key points expected in a high-scoring student response.`,
      markingGuide: `Marking Guide:\n- 40% for clear definition of terms.\n- 40% for accurate explanation of processes.\n- 20% for relevant examples or structured presentation.`,
    };
  }

  try {
    const prompt = `Suggest an ideal answer and a detailed marking criteria guide for the following exam question:
\n"${question}"\n
Respond strictly with a JSON object in this format (no other text, no markdown formatting wrappers like \`\`\`json):
{
  "answer": "the suggested ideal answer text",
  "markingGuide": "the suggested marking guide/criteria text"
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    const textResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textResponse) {
      throw new Error('Empty response received from Gemini API');
    }

    return JSON.parse(textResponse.trim());
  } catch (error) {
    console.error('Error generating ideal answer with Gemini:', error);
    throw new Error(`Failed to generate AI suggestion: ${error.message}`);
  }
};

/**
 * gradeEssay — Sends student answer to Gemini for evaluation against expected answer.
 * @param {string} question - The exam question text
 * @param {string} studentAnswer - The student's written answer
 * @param {string} expectedAnswer - The lecturer-defined or AI-generated ideal answer
 * @param {string} markingGuide - Optional marking guide to steer the AI evaluator
 * @returns {Promise<{ score: number, feedback: string }>}
 */
export const gradeEssay = async (question, studentAnswer, expectedAnswer, markingGuide = '') => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    console.warn('GEMINI_API_KEY is not set. Returning mock grade and feedback.');
    return {
      score: 7.5,
      feedback: 'This is a mock AI grading feedback. The student demonstrated good understanding of core concepts, though some advanced details could be expanded.',
    };
  }

  try {
    const prompt = `You are an expert academic evaluator. Grade the student's written response to the following exam question against the provided ideal answer and marking guide.

Question: "${question}"
Student's Response: "${studentAnswer}"
Ideal/Expected Answer: "${expectedAnswer}"
Marking Guide/Criteria: "${markingGuide}"

Provide a grade out of 10.0 (float) and a constructive piece of feedback summarizing what they did well and where they can improve.
Respond strictly with a JSON object in this format (no other text, no markdown formatting wrappers like \`\`\`json):
{
  "score": 8.5,
  "feedback": "constructive feedback text here"
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    const textResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textResponse) {
      throw new Error('Empty response received from Gemini API');
    }

    const result = JSON.parse(textResponse.trim());
    return {
      score: parseFloat(result.score) || 0,
      feedback: result.feedback || '',
    };
  } catch (error) {
    console.error('Error grading essay with Gemini:', error);
    throw new Error(`Failed to grade essay with AI: ${error.message}`);
  }
};
