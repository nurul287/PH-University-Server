import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { CourseControllers } from './course.controller';
import { courseValidations } from './course.validation';

const router = express.Router();
router.post(
  '/create-course',
  validateRequest(courseValidations.createCourseValidationSchema),
  CourseControllers.createCourse,
);
router.patch(
  '/:id',
  validateRequest(courseValidations.updateCourseValidationSchema),
  CourseControllers.updateCourse,
);
router.get('/:id', CourseControllers.getSingleCourse);
router.delete('/:id', CourseControllers.deleteCourse);
router.put(
  '/:courseId/assign-faculties',
  validateRequest(courseValidations.FacultyWithCourseValidationSchema),
  CourseControllers.assignFacultiesWithCourse,
);
router.delete(
  '/:courseId/remove-faculties',
  validateRequest(courseValidations.FacultyWithCourseValidationSchema),
  CourseControllers.removeFacultiesFromCourse,
);
router.get('/', CourseControllers.getAllCourses);

export const CourseRoutes = router;
