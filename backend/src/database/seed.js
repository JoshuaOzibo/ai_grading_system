// Database seed script — run with: node src/database/seed.js
// Populates the database with initial test data for development

import prisma from '../utils/prisma.js';

const seed = async () => {
  console.log('🌱 Seeding database...');

  // 🧹 Cleaning up database first to ensure idempotency
  console.log('🧹 Cleaning up existing data...');
  await prisma.answer.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.question.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.user.deleteMany();

  console.log('👥 Creating users (Admin, Lecturer, Students)...');
  
  // 1. Create Lecturer
  const lecturerId = 'd3b07384-d113-441c-a5cc-9c60655d8f61';
  const lecturer = await prisma.user.create({
    data: {
      id: lecturerId,
      email: 'lecturer@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'LECTURER',
      staffId: 'L-10023',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256&h=256',
      isVerified: true,
      isProfileComplete: true,
    },
  });

  // 2. Create Student 1
  const student1Id = '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed';
  const student1 = await prisma.user.create({
    data: {
      id: student1Id,
      email: 'student1@example.com',
      firstName: 'Alice',
      lastName: 'Smith',
      role: 'STUDENT',
      matricNumber: '18/CSC/1001',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=256&h=256',
      isVerified: true,
      isProfileComplete: true,
    },
  });

  // 3. Create Student 2
  const student2Id = '2c8e7ade-cced-4c3e-8c4d-bc7ceacd3ced';
  const student2 = await prisma.user.create({
    data: {
      id: student2Id,
      email: 'student2@example.com',
      firstName: 'Bob',
      lastName: 'Johnson',
      role: 'STUDENT',
      matricNumber: '18/CSC/1002',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256&h=256',
      isVerified: true,
      isProfileComplete: true,
    },
  });

  // 4. Create Admin
  const adminId = '4a8f6d7c-3f4e-4f5d-8c6e-9e7f8d9c0a1b';
  await prisma.user.create({
    data: {
      id: adminId,
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      staffId: 'A-00001',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=256&h=256',
      isVerified: true,
      isProfileComplete: true,
    },
  });

  console.log('📝 Creating exams...');
  const now = new Date();
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const tenDaysFromNow = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);
  const fiveDaysFromNow = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
  const twelveDaysFromNow = new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const twentyEightDaysAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);

  // Exam 1: CS101 (PUBLISHED)
  const examCs101 = await prisma.exam.create({
    data: {
      id: 'e101-exam-uuid',
      title: 'CS101: Introduction to Computer Science',
      description: 'Covers basic programming concepts, variables, control flow, functions, and standard algorithms.',
      duration: 60,
      startDate: twoDaysAgo,
      endDate: tenDaysFromNow,
      status: 'PUBLISHED',
      lecturerId: lecturerId,
    },
  });

  // Exam 2: MTH201 (DRAFT)
  const examMth201 = await prisma.exam.create({
    data: {
      id: 'e201-exam-uuid',
      title: 'MTH201: Linear Algebra',
      description: 'Vector spaces, linear transformations, matrices, eigenvalues, and eigenvectors.',
      duration: 90,
      startDate: fiveDaysFromNow,
      endDate: twelveDaysFromNow,
      status: 'DRAFT',
      lecturerId: lecturerId,
    },
  });

  // Exam 3: ENG102 (ARCHIVED)
  const examEng102 = await prisma.exam.create({
    data: {
      id: 'e102-exam-uuid',
      title: 'ENG102: Academic Writing',
      description: 'Focuses on essay structure, argument development, citation styles, and rhetorical strategies.',
      duration: 120,
      startDate: thirtyDaysAgo,
      endDate: twentyEightDaysAgo,
      status: 'ARCHIVED',
      lecturerId: lecturerId,
    },
  });

  console.log('❓ Creating questions...');
  
  // Questions for CS101
  const qCs1 = await prisma.question.create({
    data: {
      id: 'q-cs-1-mcq',
      examId: examCs101.id,
      type: 'MCQ',
      text: 'Which of the following is NOT a primitive data type in Java?',
      points: 5,
      options: ['int', 'boolean', 'String', 'char'],
      correctOption: 'C',
    },
  });

  const qCs2 = await prisma.question.create({
    data: {
      id: 'q-cs-2-mcq',
      examId: examCs101.id,
      type: 'MCQ',
      text: 'What is the time complexity of searching in a balanced Binary Search Tree (BST) in the average case?',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
      correctOption: 'B',
      points: 5,
    },
  });

  const qCs3 = await prisma.question.create({
    data: {
      id: 'q-cs-3-essay',
      examId: examCs101.id,
      type: 'ESSAY',
      text: 'Explain the difference between call by value and call by reference in programming languages.',
      points: 15,
      expectedAnswer: 'In call by value, a copy of the actual parameter\'s value is passed to the function. Changes made inside the function do not affect the original variable. In call by reference, the memory address of the actual parameter is passed to the function. Changes made inside the function directly affect the original variable.',
      aiMarkingGuide: 'Award full 15 points for clear definition of both terms, noting copy vs address, and side effects on original variables. Award 10 points if one definition is clear but the other is weak. Award 5 points if only basic definitions are present without explaining the side effects. Award 0 points if definitions are incorrect.',
    },
  });

  const qCs4 = await prisma.question.create({
    data: {
      id: 'q-cs-4-essay',
      examId: examCs101.id,
      type: 'ESSAY',
      text: 'Define recursion and describe the role of a base case in preventing infinite recursion.',
      points: 15,
      expectedAnswer: 'Recursion is a programming technique where a function calls itself directly or indirectly to solve a problem. The base case is a condition that terminates the recursive calls. Without a base case, recursion would continue indefinitely, eventually causing a stack overflow error.',
      aiMarkingGuide: 'Award 15 points if the candidate defines recursion and clearly explains that the base case prevents stack overflow by stopping recursive calls. Award 10 points if recursion is defined but base case purpose is vague. Award 5 points if only recursion definition is provided. 0 points for incorrect answers.',
    },
  });

  // Questions for MTH201 (DRAFT)
  await prisma.question.create({
    data: {
      id: 'q-mth-1-mcq',
      examId: examMth201.id,
      type: 'MCQ',
      text: 'What is the determinant of an identity matrix of size 3x3?',
      options: ['0', '1', '3', '9'],
      correctOption: 'B',
      points: 5,
    },
  });

  await prisma.question.create({
    data: {
      id: 'q-mth-2-essay',
      examId: examMth201.id,
      type: 'ESSAY',
      text: 'Explain the concept of linear independence of vectors.',
      points: 20,
      expectedAnswer: 'A set of vectors is linearly independent if no vector in the set can be written as a linear combination of the other vectors. Mathematically, the only solution to c1*v1 + c2*v2 + ... + cn*vn = 0 is when all coefficients c1, c2, ..., cn are equal to zero.',
      aiMarkingGuide: 'Award 20 points if candidate explains linear combination independence and provides the mathematical equation with all coefficients being zero. Award 15 points if concept is correct but mathematical formula is missing. Award 10 points if concept is partially correct.',
    },
  });

  // Questions for ENG102 (ARCHIVED)
  await prisma.question.create({
    data: {
      id: 'q-eng-1-essay',
      examId: examEng102.id,
      type: 'ESSAY',
      text: 'Discuss the importance of a thesis statement in an academic essay.',
      points: 30,
      expectedAnswer: 'A thesis statement is the central argument or claim of the essay. It serves as a roadmap for the reader, guiding the direction of the paper and unifying the content. It is typically located at the end of the introduction and must be debatable, specific, and clear.',
      aiMarkingGuide: 'Award 30 points if candidates explain central argument, reader roadmap, unification, and characteristics (debatable, specific). Deduct points for missing any of these elements.',
    },
  });

  console.log('📤 Creating submissions & answers...');

  // --- Alice's Submission (GRADED) ---
  const aliceSubmission = await prisma.submission.create({
    data: {
      id: 'sub-alice-uuid',
      examId: examCs101.id,
      studentId: student1Id,
      score: 35.0,
      status: 'GRADED',
      startedAt: new Date(now.getTime() - 24 * 60 * 60 * 1000), // 1 day ago
      submittedAt: new Date(now.getTime() - 24 * 60 * 60 * 1000 + 45 * 60 * 1000), // 45 minutes later
    },
  });

  // Alice's Answers
  await prisma.answer.create({
    data: {
      submissionId: aliceSubmission.id,
      questionId: qCs1.id,
      studentInput: 'C',
      score: 5.0,
      isGraded: true,
      isCorrect: true,
    },
  });

  await prisma.answer.create({
    data: {
      submissionId: aliceSubmission.id,
      questionId: qCs2.id,
      studentInput: 'B',
      score: 5.0,
      isGraded: true,
      isCorrect: true,
    },
  });

  await prisma.answer.create({
    data: {
      submissionId: aliceSubmission.id,
      questionId: qCs3.id,
      studentInput: 'Call by value passes a copy of the variable\'s value to the function, so changing it inside the function doesn\'t affect the outside. Call by reference passes the variable\'s memory address, meaning any changes to the parameter inside the function will modify the original variable value.',
      score: 15.0,
      isGraded: true,
      isCorrect: null,
      feedback: 'Excellent explanation. You correctly identified that call by value works on a copy while call by reference works on the memory address, and explained the side effects on the original variables accurately.',
    },
  });

  await prisma.answer.create({
    data: {
      submissionId: aliceSubmission.id,
      questionId: qCs4.id,
      studentInput: 'Recursion is when a function calls itself. A base case is needed to stop the recursion.',
      score: 10.0,
      isGraded: true,
      isCorrect: null,
      feedback: 'You provided a correct basic definition of recursion and mentioned the base case stops recursion. However, you did not explain that missing a base case leads to infinite recursion and causes a stack overflow error, which was worth the remaining 5 points.',
    },
  });

  // --- Bob's Submission (SUBMITTED - Pending grading for Essay questions) ---
  const bobSubmission = await prisma.submission.create({
    data: {
      id: 'sub-bob-uuid',
      examId: examCs101.id,
      studentId: student2Id,
      score: null, // null until all questions are graded
      status: 'SUBMITTED',
      startedAt: new Date(now.getTime() - 23 * 60 * 60 * 1000), // 23 hours ago
      submittedAt: new Date(now.getTime() - 23 * 60 * 60 * 1000 + 55 * 60 * 1000), // 55 minutes later
    },
  });

  // Bob's Answers (MCQ graded automatically, Essays ungraded)
  await prisma.answer.create({
    data: {
      submissionId: bobSubmission.id,
      questionId: qCs1.id,
      studentInput: 'A', // Incorrect (Correct is C)
      score: 0.0,
      isGraded: true,
      isCorrect: false,
      feedback: 'Incorrect option chosen. Correct option is C.',
    },
  });

  await prisma.answer.create({
    data: {
      submissionId: bobSubmission.id,
      questionId: qCs2.id,
      studentInput: 'B', // Correct
      score: 5.0,
      isGraded: true,
      isCorrect: true,
      feedback: 'Correct option chosen.',
    },
  });

  await prisma.answer.create({
    data: {
      submissionId: bobSubmission.id,
      questionId: qCs3.id,
      studentInput: 'Call by value is just passing the value of the number, whereas call by reference is passing the pointer of the variable.',
      score: null,
      isGraded: false,
      isCorrect: null,
    },
  });

  await prisma.answer.create({
    data: {
      submissionId: bobSubmission.id,
      questionId: qCs4.id,
      studentInput: 'Recursion is when a function calls itself over and over. If there is no base case, the computer will run out of memory.',
      score: null,
      isGraded: false,
      isCorrect: null,
    },
  });

  console.log('✅ Seeding complete');
  await prisma.$disconnect();
};

seed().catch((e) => {
  console.error('Seed failed:', e);
  process.exit(1);
});
