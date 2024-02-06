import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { EnrolledCourseServices } from './enrolledCourse.service';

const createEnrolledCourse = catchAsync(async (req, res) => {
  const { offeredCourse } = req.body;
  const result = await EnrolledCourseServices.createEnrolledCourseIntoDB(
    req.user.userId,
    offeredCourse,
  );

  sendResponse(res, {
    success: true,
    message: 'Enrolled course is created successfully',
    data: result,
    statusCode: httpStatus.CREATED,
  });
});

const getMyEnrolledCourses = catchAsync(async (req, res) => {
  const studentId = req.user.userId;

  const result = await EnrolledCourseServices.getMyEnrolledCoursesFromDB(
    studentId,
    req.query,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Enrolled courses are retrivied succesfully',
    data: result,
  });
});

const updateEnrolledCourseMarks = catchAsync(async (req, res) => {
  const facultyId = req.user.userId;
  const result = await EnrolledCourseServices.updateEnrolledCourseMarksIntoDB(
    facultyId,
    req.body,
  );

  sendResponse(res, {
    success: true,
    message: 'Enrolled course marks is updated successfully',
    data: result,
    statusCode: httpStatus.CREATED,
  });
});

export const EnrolledCourseControllers = {
  createEnrolledCourse,
  updateEnrolledCourseMarks,
  getMyEnrolledCourses,
};
