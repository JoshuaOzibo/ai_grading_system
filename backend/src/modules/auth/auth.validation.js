import { z } from 'zod';

const matricNumberRegex = /^(AIT|SWD|NCC|CYS)\/(HND|ND)\/\d{2,4}\/\d+$/i;

export const registerSchema = z
  .object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['STUDENT', 'LECTURER', 'ADMIN']),
    matricNumber: z.string().optional(),
    staffId: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role === 'STUDENT') {
      if (!data.matricNumber) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Students must provide a matricNumber',
          path: ['matricNumber'],
        });
      } else if (!matricNumberRegex.test(data.matricNumber)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Invalid matric format. Expected: AIT/HND/24/00036 (Departments: AIT, SWD, NCC, CYS)',
          path: ['matricNumber'],
        });
      }
    }

    if (data.role === 'LECTURER') {
      if (!data.staffId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Lecturers must provide a staffId',
          path: ['staffId'],
        });
      }
    }
  });

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});
