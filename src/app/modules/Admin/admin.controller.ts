import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { AdminServices } from './admin.service';

const getAllAdmins = catchAsync(async (req, res) => {
  const result = await AdminServices.getAllAdminsFromBD(req.query);
  sendResponse(res, {
    success: true,
    message: 'Admins are retrieved successfully',
    data: result.result,
    meta: result.meta,
    statusCode: httpStatus.OK,
  });
});

const getSingleAdmin = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await AdminServices.getSingleAdminFromBD(id);
  sendResponse(res, {
    success: true,
    message: 'Admin is retrieved successfully',
    data: result,
    statusCode: httpStatus.OK,
  });
});

const deleteAdmin = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await AdminServices.deleteAdminFromBD(id);
  sendResponse(res, {
    success: true,
    message: 'Admin is deleted successfully',
    data: result,
    statusCode: httpStatus.OK,
  });
});

const updateAdmin = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { admin } = req.body;
  const result = await AdminServices.updateAdminFromDB(id, admin);
  sendResponse(res, {
    success: true,
    message: 'Admin is updated successfully',
    data: result,
    statusCode: httpStatus.OK,
  });
});

export const AdminControllers = {
  getAllAdmins,
  getSingleAdmin,
  deleteAdmin,
  updateAdmin,
};
