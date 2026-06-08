// AI Service — integrates with Google Gemini API & OpenAI ChatGPT API using native fetch
// Used by: modules/questions (AI answer generation), modules/submissions (AI essay grading)

/**
 * Helper to call AI API. Automatically routing to OpenAI if API key starts with "sk-",
 * otherwise falling back to Google Gemini.
 * @param {string} prompt - Prompt to submit to AI
 * @returns {Promise<string>}
 */
const callAI = async (prompt) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey.startsWith("sk-")) {
    // Call OpenAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    const textResponse = data?.choices?.[0]?.message?.content;
    if (!textResponse) {
      throw new Error("Empty response received from OpenAI API");
    }
    return textResponse;
  } else {
    // Call Gemini
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
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
      throw new Error("Empty response received from Gemini API");
    }
    return textResponse;
  }
};

/**
 * generateIdealAnswer — Calls the AI API to generate an expected answer and marking guide for a question.
 * @param {string} question - The exam question text
 * @returns {Promise<{ answer: string, markingGuide: string }>}
 */
export const generateIdealAnswer = async (question) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    console.warn('AI API key is not set. Returning mock ideal answer and marking guide.');
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

    const textResponse = await callAI(prompt);
    return JSON.parse(textResponse.trim());
  } catch (error) {
    console.error('Error generating ideal answer:', error);
    throw new Error(`Failed to generate AI suggestion: ${error.message}`);
  }
};

/**
 * gradeEssay — Sends student answer to AI for evaluation against expected answer.
 * @param {string} question - The exam question text
 * @param {string} studentAnswer - The student's written answer
 * @param {string} expectedAnswer - The lecturer-defined or AI-generated ideal answer
 * @param {string} markingGuide - Optional marking guide to steer the AI evaluator
 * @returns {Promise<{ score: number, feedback: string }>}
 */
export const gradeEssay = async (question, studentAnswer, expectedAnswer, markingGuide = '') => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    console.warn('AI API key is not set. Returning mock grade and feedback.');
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

    const textResponse = await callAI(prompt);
    const result = JSON.parse(textResponse.trim());
    return {
      score: parseFloat(result.score) || 0,
      feedback: result.feedback || '',
    };
  } catch (error) {
    console.error('Error grading essay:', error);
    throw new Error(`Failed to grade essay with AI: ${error.message}`);
  }
};

/**
 * generateExamQuestions — Calls the AI API to generate exam title, description, and questions list.
 * @param {string} topic - The topic of the exam
 * @param {number} numQuestions - Number of questions to generate
 * @param {string} questionType - MCQ or ESSAY
 * @returns {Promise<{ title: string, description: string, questions: Array }>}
 */
export const generateExamQuestions = async (topic, numQuestions, questionType) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    console.warn('AI API key is not set. Returning mock generated exam.');
    const questions = [];
    for (let i = 1; i <= numQuestions; i++) {
      if (questionType === 'MCQ') {
        questions.push({
          type: 'MCQ',
          text: `Mock MCQ Question ${i} on ${topic}: Which of the following is correct?`,
          points: 2,
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctOption: 'A',
          expectedAnswer: null,
          aiMarkingGuide: null
        });
      } else {
        questions.push({
          type: 'ESSAY',
          text: `Mock Essay Question ${i} on ${topic}: Explain the significance and key applications.`,
          points: 5,
          options: [],
          correctOption: null,
          expectedAnswer: 'This is the expected ideal answer summarizing key points of the essay topic.',
          aiMarkingGuide: 'Criteria:\n- 50% core definition\n- 50% structural detail'
        });
      }
    }
    return {
      title: `${topic} Assessment`,
      description: `Auto-generated exam covering ${topic}. Please answer all questions carefully.`,
      questions
    };
  }

  try {
    const prompt = `Create an academic exam on the topic "${topic}" containing ${numQuestions} questions of type "${questionType}" (MCQ or ESSAY).
Provide:
1. A concise, professional Exam Title.
2. A brief Exam Description/instructions.
3. A list of questions.
- If type is MCQ: questions must have "type" ("MCQ"), "text", "points" (integer, e.g. 2), "options" (array of exactly 4 choices), "correctOption" (must be "A", "B", "C", or "D"), and null "expectedAnswer" and "aiMarkingGuide".
- If type is ESSAY: questions must have "type" ("ESSAY"), "text", "points" (integer, e.g. 5), empty "options" array, null "correctOption", and complete "expectedAnswer" and "aiMarkingGuide".

Respond strictly with a JSON object in this format (no other text, no markdown formatting wrappers like \`\`\`json):
{
  "title": "Exam Title",
  "description": "Exam Description/Instructions",
  "questions": [
    {
      "type": "MCQ",
      "text": "Question text?",
      "points": 2,
      "options": ["Choice A", "Choice B", "Choice C", "Choice D"],
      "correctOption": "B",
      "expectedAnswer": null,
      "aiMarkingGuide": null
    }
  ]
}`;

    const textResponse = await callAI(prompt);
    return JSON.parse(textResponse.trim());
  } catch (error) {
    console.error('Error generating exam questions:', error);
    throw new Error(`Failed to generate exam with AI: ${error.message}`);
  }
};
