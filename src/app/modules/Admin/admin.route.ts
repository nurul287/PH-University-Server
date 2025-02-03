import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { USER_ROLE } from '../user/user.constant';
import { AdminControllers } from './admin.controller';
import { adminValidations } from './admin.validation';

const router = express.Router();

router.get(
  '/',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  AdminControllers.getAllAdmins,
);
router.get(
  '/:id',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  AdminControllers.getSingleAdmin,
);
router.delete('/:id', auth(USER_ROLE.superAdmin), AdminControllers.deleteAdmin);
router.patch(
  '/:id',
  auth(USER_ROLE.superAdmin),
  validateRequest(adminValidations.updateAdminValidationSchema),
  AdminControllers.updateAdmin,
);

export const AdminRoutes = router;
