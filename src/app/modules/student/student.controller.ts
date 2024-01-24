import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import { StudentServices } from './student.service';

const getAllStudents = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await StudentServices.getAllStudentsFromBD();

    sendResponse(res, {
      success: true,
      message: 'Students are retrieved successfully',
      data: result,
      statusCode: httpStatus.OK,
    });
  } catch (error) {
    next(error);
  }
};

const getSingleStudent = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { studentId } = req.params;
    const result = await StudentServices.getSingleStudentFromBD(studentId);

    sendResponse(res, {
      success: true,
      message: 'Student is retrieved successfully',
      data: result,
      statusCode: httpStatus.OK,
    });
  } catch (error) {
    next(error);
  }
};
const deleteStudent = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { studentId } = req.params;
    const result = await StudentServices.deleteStudentFromBD(studentId);

    sendResponse(res, {
      success: true,
      message: 'Student is deleted successfully',
      data: result,
      statusCode: httpStatus.OK,
    });
  } catch (error: any) {
    next(error);
  }
};

export const StudentControllers = {
  getAllStudents,
  getSingleStudent,
  deleteStudent,
};
