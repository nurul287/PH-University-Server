import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { AdminControllers } from './admin.controller';
import { adminValidations } from './admin.validation';

const router = express.Router();

router.get('/', AdminControllers.getAllAdmins);
router.get('/:facultyId', AdminControllers.getSingleAdmin);
router.delete('/:facultyId', AdminControllers.deleteAdmin);
router.patch(
  '/:facultyId',
  validateRequest(adminValidations.updateAdminValidationSchema),
  AdminControllers.updateAdmin,
);

export const AdminRoutes = router;
