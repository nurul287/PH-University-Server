import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { OfferedCourseServices } from './offeredCourse.service';

const createOfferedCourse = catchAsync(async (req, res) => {
  const result = await OfferedCourseServices.createOfferedCourseIntoDB(
    req.body,
  );
  sendResponse(res, {
    success: true,
    message: 'Offered course is created successfully',
    data: result,
    statusCode: httpStatus.CREATED,
  });
});

const getAllOfferedCourses = catchAsync(async (req, res) => {
  const result = await OfferedCourseServices.getAllOfferedCourseFromDB(
    req.query,
  );
  sendResponse(res, {
    success: true,
    message: 'Offered courses are retrieved successfully',
    data: result.result,
    meta: result.meta,
    statusCode: httpStatus.OK,
  });
});

const getMyOfferedCourses = catchAsync(async (req, res) => {
  const userId = req.user.userId as string;
  const result = await OfferedCourseServices.getMyOfferedCourseFromDB(
    userId,
    req.query,
  );
  sendResponse(res, {
    success: true,
    message: 'Offered courses are retrieved successfully',
    data: result.result,
    meta: result.meta,
    statusCode: httpStatus.OK,
  });
});

const getSingleOfferedCourse = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await OfferedCourseServices.getSingleOfferedCourseFromDB(id);
  sendResponse(res, {
    success: true,
    message: 'Offered course is retrieved successfully',
    data: result,
    statusCode: httpStatus.OK,
  });
});

const updateOfferedCourse = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await OfferedCourseServices.updateOfferedCourseIntoDB(
    id,
    req.body,
  );
  sendResponse(res, {
    success: true,
    message: 'Offered course is updated successfully',
    data: result,
    statusCode: httpStatus.OK,
  });
});

const deleteOfferedCourse = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await OfferedCourseServices.deleteOfferedCourseFromDB(id);
  sendResponse(res, {
    success: true,
    message: 'Offered course is deleted successfully',
    data: result,
    statusCode: httpStatus.OK,
  });
});

export const OfferedCourseControllers = {
  createOfferedCourse,
  getAllOfferedCourses,
  getMyOfferedCourses,
  getSingleOfferedCourse,
  updateOfferedCourse,
  deleteOfferedCourse,
};
