import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { USER_ROLE } from '../user/user.constant';
import { OfferedCourseControllers } from './offeredCourse.controller';
import { offeredCourseValidations } from './offeredCourse.validation';

const router = express.Router();

router.post(
  '/create-offered-course',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin),
  validateRequest(offeredCourseValidations.createOfferedCourseValidationSchema),
  OfferedCourseControllers.createOfferedCourse,
);
router.get(
  '/',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin, USER_ROLE.faculty),
  OfferedCourseControllers.getAllOfferedCourses,
);

router.get(
  '/my-offered-courses',
  auth(USER_ROLE.student),
  OfferedCourseControllers.getMyOfferedCourses,
);

router.get(
  '/:id',
  auth(
    USER_ROLE.admin,
    USER_ROLE.superAdmin,
    USER_ROLE.faculty,
    USER_ROLE.student,
  ),
  OfferedCourseControllers.getSingleOfferedCourse,
);
router.delete(
  '/:id',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin),
  OfferedCourseControllers.deleteOfferedCourse,
);
router.patch(
  '/:id',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin),
  validateRequest(offeredCourseValidations.updateOfferedCourseValidationSchema),
  OfferedCourseControllers.updateOfferedCourse,
);

export const OfferedCourseRoutes = router;
