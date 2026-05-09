// Database seed script — run with: node src/database/seed.js
// Populates the database with initial test data for development

import prisma from '../utils/prisma.js';

const seed = async () => {
  console.log('🌱 Seeding database...');

  // TODO: Add seed data for lecturers, exams, and test students

  console.log('✅ Seeding complete');
  await prisma.$disconnect();
};

seed().catch((e) => {
  console.error('Seed failed:', e);
  process.exit(1);
});
