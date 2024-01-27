import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { StudentServices } from './student.service';

const getAllStudents = catchAsync(async (req, res) => {
  const result = await StudentServices.getAllStudentsFromBD(req.query);
  sendResponse(res, {
    success: true,
    message: 'Students are retrieved successfully',
    data: result,
    statusCode: httpStatus.OK,
  });
});

const getSingleStudent = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await StudentServices.getSingleStudentFromBD(id);
  sendResponse(res, {
    success: true,
    message: 'Student is retrieved successfully',
    data: result,
    statusCode: httpStatus.OK,
  });
});

const deleteStudent = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await StudentServices.deleteStudentFromBD(id);
  sendResponse(res, {
    success: true,
    message: 'Student is deleted successfully',
    data: result,
    statusCode: httpStatus.OK,
  });
});

const updateStudent = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { student } = req.body;
  const result = await StudentServices.updateStudentFromDB(id, student);
  sendResponse(res, {
    success: true,
    message: 'Student is updated successfully',
    data: result,
    statusCode: httpStatus.OK,
  });
});

export const StudentControllers = {
  getAllStudents,
  getSingleStudent,
  deleteStudent,
  updateStudent,
};
