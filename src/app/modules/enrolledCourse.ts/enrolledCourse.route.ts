import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { EnrolledCourseControllers } from './enrolledCourse.controller';
import { EnrolledCourseValidation } from './enrolledCourse.validation';

const router = express.Router();

router.post(
  'create-enrolled-course',
  validateRequest(
    EnrolledCourseValidation.createEnrolledCourseValidationSchema,
  ),
  EnrolledCourseControllers.createEnrolledCourse,
);

export const EnrolledCourseRoutes = router;
