import { PrismaClient } from '@prisma/client';
import env from '../config/env.js';

const prisma = new PrismaClient({
  datasourceUrl: env.databaseUrl,
});

export default prisma;
