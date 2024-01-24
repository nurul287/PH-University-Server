import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import { UserServices } from './user.service';

const createStudent = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { password, student: studentData } = req.body;

    // const zodParseData = studentValidationSchema.parse(studentData);

    const result = await UserServices.createStudentIntoDB(
      studentData,
      password,
    );

    sendResponse(res, {
      success: true,
      message: 'Student is created successfully',
      data: result,
      statusCode: httpStatus.OK,
    });
  } catch (error) {
    next(error);
  }
};

export const UserControllers = {
  createStudent,
};
