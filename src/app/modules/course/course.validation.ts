import { z } from 'zod';

const CreatePreRequisiteCoursesValidationSchema = z.object({
  course: z.string(),
  isDeleted: z.boolean().default(false).optional(),
});

const createCourseValidationSchema = z.object({
  body: z.object({
    course: z.object({
      title: z.string(),
      prefix: z.string(),
      code: z.number(),
      credits: z.number(),
      preRequisiteCourses: z
        .array(CreatePreRequisiteCoursesValidationSchema)
        .optional(),
      isDeleted: z.boolean().optional(),
    }),
  }),
});

const updatePreRequisiteCoursesValidationSchema = z.object({
  course: z.string().optional(),
  isDeleted: z.boolean().default(false).optional(),
});

const updateCourseValidationSchema = z.object({
  body: z.object({
    course: z.object({
      title: z.string().optional(),
      prefix: z.string().optional(),
      code: z.number().optional(),
      credits: z.number().optional(),
      preRequisiteCourses: z
        .array(updatePreRequisiteCoursesValidationSchema)
        .optional(),
      isDeleted: z.boolean().optional(),
    }),
  }),
});

const FacultyWithCourseValidationSchema = z.object({
  body: z.object({
    faculties: z.string().array(),
  }),
});

export const courseValidations = {
  createCourseValidationSchema,
  updateCourseValidationSchema,
  FacultyWithCourseValidationSchema,
};
