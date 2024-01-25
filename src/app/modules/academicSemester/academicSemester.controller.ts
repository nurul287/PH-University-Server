import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { AcademicSemesterServices } from './academicSemester.service';

const createAcademicSemester = catchAsync(async (req, res) => {
  const result = await AcademicSemesterServices.createAcademicSemesterIntoDB(
    req.body,
  );

  sendResponse(res, {
    success: true,
    message: 'Academic semester is created successfully',
    data: result,
    statusCode: httpStatus.OK,
  });
});

export const AcademicSemesterControllers = {
  createAcademicSemester,
};
