import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { CourseServices } from './course.service';

const createCourse = catchAsync(async (req, res) => {
  const { course: courseData } = req.body;
  const result = await CourseServices.createCourseIntoDB(courseData);
  sendResponse(res, {
    success: true,
    message: 'Course is created successfully',
    data: result,
    statusCode: httpStatus.OK,
  });
});

const getAllCourses = catchAsync(async (req, res) => {
  const result = await CourseServices.getAllCoursesFromDB(req.query);
  sendResponse(res, {
    success: true,
    message: 'Courses are retrieved successfully',
    data: result,
    statusCode: httpStatus.OK,
  });
});

const getSingleCourse = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await CourseServices.getSingleCourseFromDB(id);
  sendResponse(res, {
    success: true,
    message: 'Course is retrieved successfully',
    data: result,
    statusCode: httpStatus.OK,
  });
});

const deleteCourse = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await CourseServices.deleteCourseFromDB(id);
  sendResponse(res, {
    success: true,
    message: 'Course is deleted successfully',
    data: result,
    statusCode: httpStatus.OK,
  });
});
const updateCourse = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { course } = req.body;
  const result = await CourseServices.updateCourseIntoDB(id, course);
  sendResponse(res, {
    success: true,
    message: 'Course is deleted successfully',
    data: result,
    statusCode: httpStatus.OK,
  });
});

export const CourseControllers = {
  createCourse,
  getAllCourses,
  getSingleCourse,
  deleteCourse,
  updateCourse,
};
