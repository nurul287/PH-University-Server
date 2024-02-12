import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { TAuthUser } from '../auth/auth.interface';
import { UserServices } from './user.service';

const createStudent = catchAsync(async (req, res) => {
  const { password, student: studentData } = req.body;
  const result = await UserServices.createStudentIntoDB(
    req.file,
    studentData,
    password,
  );
  sendResponse(res, {
    success: true,
    message: 'Student is created successfully',
    data: result,
    statusCode: httpStatus.CREATED,
  });
});

const createFaculty = catchAsync(async (req, res) => {
  const { password, faculty: facultyData } = req.body;
  const result = await UserServices.createFacultyIntoDB(
    req.file,
    facultyData,
    password,
  );
  sendResponse(res, {
    success: true,
    message: 'Faculty is created successfully',
    data: result,
    statusCode: httpStatus.CREATED,
  });
});

const createAdmin = catchAsync(async (req, res) => {
  const { password, admin: adminData } = req.body;
  const result = await UserServices.createAdminIntoDB(
    req.file,
    adminData,
    password,
  );
  sendResponse(res, {
    success: true,
    message: 'admin is created successfully',
    data: result,
    statusCode: httpStatus.CREATED,
  });
});

const changeUserStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await UserServices.changeUserStatusIntoDB(id, req.body);
  sendResponse(res, {
    success: true,
    message: 'User status is changed successfully',
    data: result,
    statusCode: httpStatus.OK,
  });
});

const getMe = catchAsync(async (req, res) => {
  const result = await UserServices.getMeFromDB(req.user as TAuthUser);
  sendResponse(res, {
    success: true,
    message: 'User is retrieve successfully',
    data: result,
    statusCode: httpStatus.OK,
  });
});

export const UserControllers = {
  createStudent,
  createFaculty,
  createAdmin,
  getMe,
  changeUserStatus,
};
