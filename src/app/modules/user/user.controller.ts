import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { UserServices } from './user.service';

const createStudent = catchAsync(async (req, res) => {
  const { password, student: studentData } = req.body;

  const result = await UserServices.createStudentIntoDB(studentData, password);
  sendResponse(res, {
    success: true,
    message: 'Student is created successfully',
    data: result,
    statusCode: httpStatus.OK,
  });
});

export const UserControllers = {
  createStudent,
};
