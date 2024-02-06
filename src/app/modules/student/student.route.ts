import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { USER_ROLE } from '../user/user.constant';
import { StudentControllers } from './student.controller';
import { studentValidations } from './student.validation';

const router = express.Router();

router.get('/', StudentControllers.getAllStudents);
router.get(
  '/:id',
  auth(USER_ROLE.admin, USER_ROLE.faculty),
  StudentControllers.getSingleStudent,
);
router.delete('/:id', auth(USER_ROLE.admin), StudentControllers.deleteStudent);
router.patch(
  '/:id',
  auth(USER_ROLE.admin),
  validateRequest(studentValidations.updateStudentValidationSchema),
  StudentControllers.updateStudent,
);

export const StudentRoutes = router;
