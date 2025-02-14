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

const getAllAcademicSemester = catchAsync(async (req, res) => {
  const result = await AcademicSemesterServices.getAllAcademicSemesterFromDB(
    req.query,
  );

  sendResponse(res, {
    success: true,
    message: 'Academic semesters are retrieved successfully',
    data: result,
    statusCode: httpStatus.OK,
  });
});

const getSingleAcademicSemester = catchAsync(async (req, res) => {
  const { semesterId } = req.params;
  const result =
    await AcademicSemesterServices.getSingleAcademicSemesterFromDB(semesterId);

  sendResponse(res, {
    success: true,
    message: 'Academic semester is retrieved successfully',
    data: result,
    statusCode: httpStatus.OK,
  });
});

const updateAcademicSemester = catchAsync(async (req, res) => {
  const { semesterId } = req.params;
  const result =
    await AcademicSemesterServices.updateSingleAcademicSemesterIntoDB(
      semesterId,
      req.body,
    );

  sendResponse(res, {
    success: true,
    message: 'Academic semester is updated successfully',
    data: result,
    statusCode: httpStatus.OK,
  });
});

export const AcademicSemesterControllers = {
  createAcademicSemester,
  getAllAcademicSemester,
  getSingleAcademicSemester,
  updateAcademicSemester,
};
