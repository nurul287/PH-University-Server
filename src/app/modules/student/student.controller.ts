import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { StudentServices } from './student.service';

const getAllStudents = catchAsync(async (req, res) => {
  const result = await StudentServices.getAllStudentsFromBD();
  sendResponse(res, {
    success: true,
    message: 'Students are retrieved successfully',
    data: result,
    statusCode: httpStatus.OK,
  });
});

const getSingleStudent = catchAsync(async (req, res) => {
  const { studentId } = req.params;
  const result = await StudentServices.getSingleStudentFromBD(studentId);
  sendResponse(res, {
    success: true,
    message: 'Student is retrieved successfully',
    data: result,
    statusCode: httpStatus.OK,
  });
});

const deleteStudent = catchAsync(async (req, res) => {
  const { studentId } = req.params;
  const result = await StudentServices.deleteStudentFromBD(studentId);
  sendResponse(res, {
    success: true,
    message: 'Student is deleted successfully',
    data: result,
    statusCode: httpStatus.OK,
  });
});

export const StudentControllers = {
  getAllStudents,
  getSingleStudent,
  deleteStudent,
};
