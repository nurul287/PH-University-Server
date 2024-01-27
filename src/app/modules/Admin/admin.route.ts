import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { AdminControllers } from './admin.controller';
import { adminValidations } from './admin.validation';

const router = express.Router();

router.get('/', AdminControllers.getAllAdmins);
router.get('/:id', AdminControllers.getSingleAdmin);
router.delete('/:id', AdminControllers.deleteAdmin);
router.patch(
  '/:id',
  validateRequest(adminValidations.updateAdminValidationSchema),
  AdminControllers.updateAdmin,
);

export const AdminRoutes = router;
