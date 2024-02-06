import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { USER_ROLE } from '../user/user.constant';
import { EnrolledCourseControllers } from './enrolledCourse.controller';
import { EnrolledCourseValidation } from './enrolledCourse.validation';

const router = express.Router();

router.post(
  '/create-enrolled-course',
  validateRequest(
    EnrolledCourseValidation.createEnrolledCourseValidationSchema,
  ),
  auth(USER_ROLE.student),
  EnrolledCourseControllers.createEnrolledCourse,
);

router.get(
  '/my-enrolled-courses',
  auth(USER_ROLE.student),
  EnrolledCourseControllers.getMyEnrolledCourses,
);

router.patch(
  '/update-enrolled-course-marks',
  validateRequest(
    EnrolledCourseValidation.updateEnrolledCourseMarksValidationSchema,
  ),
  auth(USER_ROLE.faculty),
  EnrolledCourseControllers.updateEnrolledCourseMarks,
);

export const EnrolledCourseRoutes = router;
