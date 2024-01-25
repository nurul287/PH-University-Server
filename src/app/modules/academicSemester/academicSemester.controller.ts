import httpStatus from 'http-status';
import { Types } from 'mongoose';
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
  const result = await AcademicSemesterServices.getAllAcademicSemesterFromDB();

  sendResponse(res, {
    success: true,
    message: 'Academic semesters is fetched successfully',
    data: result,
    statusCode: httpStatus.OK,
  });
});

const getSingleAcademicSemester = catchAsync(async (req, res) => {
  const result = await AcademicSemesterServices.getSingleAcademicSemesterFromDB(
    new Types.ObjectId(req.params.id),
  );

  sendResponse(res, {
    success: true,
    message: 'Academic semester is fetched successfully',
    data: result,
    statusCode: httpStatus.OK,
  });
});

const updateSingleAcademicSemester = catchAsync(async (req, res) => {
  const result =
    await AcademicSemesterServices.updateSingleAcademicSemesterIntoDB(
      new Types.ObjectId(req.params.id),
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
  updateSingleAcademicSemester,
};
