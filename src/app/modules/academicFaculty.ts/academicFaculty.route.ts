import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { USER_ROLE } from '../user/user.constant';
import { AcademicFacultyControllers } from './academicFaculty.controller';
import { AcademicFacultyValidation } from './academicFaculty.validation';

const router = express.Router();

router.post(
  '/create-academic-faculty',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin),
  validateRequest(AcademicFacultyValidation.academicFacultyValidationSchema),
  AcademicFacultyControllers.createAcademicFaculty,
);
router.get(
  '/',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin, USER_ROLE.faculty),
  AcademicFacultyControllers.getAllAcademicFaculties,
);
router.get(
  '/:facultyId',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin, USER_ROLE.faculty),
  AcademicFacultyControllers.getSingleAcademicFaculty,
);
router.patch(
  '/:facultyId',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin),
  validateRequest(AcademicFacultyValidation.academicFacultyValidationSchema),
  AcademicFacultyControllers.updateAcademicFaculty,
);

export const AcademicFacultyRoutes = router;
