import prisma from '../utils/prisma.js';

const clearDatabase = async () => {
  console.log('🧹 Clearing all data from database...');
  try {
    const deletedAnswers = await prisma.answer.deleteMany();
    const deletedSubmissions = await prisma.submission.deleteMany();
    const deletedQuestions = await prisma.question.deleteMany();
    const deletedExams = await prisma.exam.deleteMany();
    const deletedUsers = await prisma.user.deleteMany();

    console.log(`✅ Successfully deleted:
- ${deletedUsers.count} users
- ${deletedExams.count} exams
- ${deletedQuestions.count} questions
- ${deletedSubmissions.count} submissions
- ${deletedAnswers.count} answers`);
  } catch (err) {
    console.error('❌ Error clearing database:', err);
  } finally {
    await prisma.$disconnect();
  }
};

clearDatabase();
