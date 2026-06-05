import submissionRepository from './submission.repository.js';
import examRepository from '../exams/exam.repository.js';
import questionRepository from '../questions/question.repository.js';
import { gradeEssay } from '../../services/ai.service.js';
import prisma from '../../utils/prisma.js';

class SubmissionService {
  async startExam(studentId, examId) {
    const exam = await examRepository.findById(examId);
    if (!exam) throw new Error('Exam not found');
    if (exam.status !== 'PUBLISHED') throw new Error('This exam is not active or available for taking');

    const now = new Date();
    if (now < exam.startDate) {
      throw new Error(`This exam has not started yet. Starting time: ${exam.startDate}`);
    }
    if (now > exam.endDate) {
      throw new Error('This exam has already ended');
    }

    // Check for existing submission
    let submission = await submissionRepository.findUnique(studentId, examId);

    if (submission) {
      if (submission.status !== 'STARTED') {
        throw new Error('You have already submitted this exam.');
      }
      // Resume existing STARTED session
    } else {
      // Create a new STARTED submission session
      submission = await submissionRepository.createSubmission({
        studentId,
        examId,
        status: 'STARTED',
        startedAt: now,
      });
    }

    // Fetch questions and strip answers to prevent cheating
    const questions = await questionRepository.findByExamId(examId);
    const safeQuestions = questions.map((q) => {
      const { correctOption, expectedAnswer, aiMarkingGuide, ...safeQ } = q;
      return safeQ;
    });

    return {
      submissionId: submission.id,
      startedAt: submission.startedAt,
      duration: exam.duration,
      title: exam.title,
      questions: safeQuestions,
    };
  }

  async submitExam(studentId, examId, answersList) {
    const submission = await submissionRepository.findUnique(studentId, examId);
    if (!submission) throw new Error('Exam session was not initialized. Call start first.');
    if (submission.status !== 'STARTED') {
      throw new Error('This exam has already been submitted or graded.');
    }

    // Fetch all questions for this exam to perform grading and validation
    const questions = await questionRepository.findByExamId(examId);
    const questionsMap = new Map(questions.map((q) => [q.id, q]));

    const answersToSave = [];
    let hasEssay = false;
    let mcqScore = 0;

    for (const ans of answersList) {
      const question = questionsMap.get(ans.questionId);
      if (!question) continue; // skip unrecognized question ids

      const studentInput = ans.studentInput || '';
      let score = 0;
      let feedback = '';
      let isGraded = false;

      if (question.type === 'MCQ') {
        isGraded = true;
        feedback = 'Auto-graded';
        if (studentInput.trim().toUpperCase() === question.correctOption.trim().toUpperCase()) {
          score = question.points;
        } else {
          score = 0;
        }
        mcqScore += score;
      } else if (question.type === 'ESSAY') {
        hasEssay = true;
        isGraded = false;
        feedback = 'Awaiting AI evaluation';
        score = 0; // Will be computed by AI in background
      }

      answersToSave.push({
        submissionId: submission.id,
        questionId: question.id,
        studentInput,
        score,
        feedback,
        isGraded,
      });
    }

    // Save student answers to database
    await submissionRepository.saveAnswers(answersToSave);

    const now = new Date();

    if (!hasEssay) {
      // If there are no essays, we can immediately mark the submission as GRADED
      await submissionRepository.updateSubmission(submission.id, {
        status: 'GRADED',
        score: mcqScore,
        submittedAt: now,
      });

      return {
        message: 'Exam submitted and auto-graded successfully.',
        status: 'GRADED',
        score: mcqScore,
      };
    } else {
      // If there are essay questions, save in SUBMITTED status and trigger background AI grading
      const updatedSubmission = await submissionRepository.updateSubmission(submission.id, {
        status: 'SUBMITTED',
        score: mcqScore, // Store partial score (MCQ only) for now
        submittedAt: now,
      });

      // Kick off background AI evaluation (non-blocking)
      this.triggerAIEvaluation(submission.id).catch((err) =>
        console.error(`AI background grading failed for submission ${submission.id}:`, err)
      );

      return {
        message: 'Exam submitted successfully. Written answers are being evaluated by AI.',
        status: 'SUBMITTED',
      };
    }
  }

  async triggerAIEvaluation(submissionId) {
    try {
      console.log(`Starting background AI essay evaluation for submission ${submissionId}`);

      // Fetch the full submission with questions and answers details
      const submission = await submissionRepository.findById(submissionId);
      if (!submission) return;

      const essayAnswers = submission.answers.filter((ans) => ans.question.type === 'ESSAY');

      for (const answer of essayAnswers) {
        try {
          const result = await gradeEssay(
            answer.question.text,
            answer.studentInput,
            answer.question.expectedAnswer || '',
            answer.question.aiMarkingGuide || ''
          );

          // The gradeEssay helper returns a score out of 10. Scale it to the question's maximum points
          const scaledScore = (result.score / 10.0) * answer.question.points;

          await prisma.answer.update({
            where: { id: answer.id },
            data: {
              score: parseFloat(scaledScore.toFixed(2)),
              feedback: result.feedback,
              isGraded: true,
            },
          });
        } catch (err) {
          console.error(`Error grading essay answer ${answer.id} with AI:`, err);
          await prisma.answer.update({
            where: { id: answer.id },
            data: {
              score: 0,
              feedback: `AI evaluation error: ${err.message}`,
              isGraded: true,
            },
          });
        }
      }

      // Re-fetch submission answers to compute overall final score
      const finalAnswers = await prisma.answer.findMany({
        where: { submissionId },
      });
      const totalScore = finalAnswers.reduce((sum, ans) => sum + (ans.score || 0), 0);

      await submissionRepository.updateSubmission(submissionId, {
        status: 'GRADED',
        score: totalScore,
      });

      console.log(`Finished background AI essay evaluation for submission ${submissionId}. Final score: ${totalScore}`);
    } catch (error) {
      console.error(`Critical error in background evaluation worker for submission ${submissionId}:`, error);
    }
  }

  async getSubmissionsByExam(lecturerId, examId) {
    const exam = await examRepository.findById(examId);
    if (!exam) throw new Error('Exam not found');
    if (exam.lecturerId !== lecturerId) throw new Error('Access denied. You do not own this exam.');

    return await submissionRepository.findSubmissionsByExam(examId);
  }

  async getSubmissionDetails(user, submissionId) {
    const submission = await submissionRepository.findById(submissionId);
    if (!submission) throw new Error('Submission not found');

    // Security check: students can only view their own submissions. Lecturers can view submissions for their own exams. Admins can view all.
    if (user.role === 'STUDENT' && submission.studentId !== user.id) {
      throw new Error('Access denied. You can only view your own submissions.');
    }
    if (user.role === 'LECTURER' && submission.exam.lecturerId !== user.id) {
      throw new Error('Access denied. You do not own this exam.');
    }

    return submission;
  }

  async getMySubmissions(studentId) {
    return await submissionRepository.findByStudentId(studentId);
  }
}

export default new SubmissionService();
