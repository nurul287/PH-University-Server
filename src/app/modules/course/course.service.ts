import httpStatus from 'http-status';
import mongoose from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import { CourseSearchableFields } from './course.constant';
import { TCourse } from './course.interface';
import { Course, CourseFaculty } from './course.model';

const createCourseIntoDB = async (payLoad: TCourse) => {
  const result = await Course.create(payLoad);
  return result;
};

const getAllCoursesFromDB = async (query: Record<string, unknown>) => {
  const courseQuery = new QueryBuilder(
    Course.find().populate('preRequisiteCourses.course'),
    query,
  )
    .search(CourseSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();
  const result = await courseQuery.modelQuery;
  const meta = await courseQuery.countTotal();

  return {
    meta,
    result,
  };
};

const getSingleCourseFromDB = async (id: string) => {
  const result = await Course.findById(id).populate(
    'preRequisiteCourses.course',
  );
  return result;
};

const deleteCourseFromDB = async (id: string) => {
  const result = await Course.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true },
  );
  return result;
};

const updateCourseIntoDB = async (id: string, payLoad: Partial<TCourse>) => {
  const { preRequisiteCourses, ...remainingCourseData } = payLoad;

  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    // check if there is any pre requisite course to update
    if (preRequisiteCourses && preRequisiteCourses.length > 0) {
      const deletedPreRequisites = preRequisiteCourses
        .filter((el) => el.course && el.isDeleted)
        .map((el) => el.course);

      const deletedPreRequisitesCourse = await Course.findByIdAndUpdate(id, {
        $pull: {
          preRequisiteCourses: { course: { $in: deletedPreRequisites } },
        },
      });
      if (!deletedPreRequisitesCourse) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Failed to update course');
      }

      const newPreRequisites = preRequisiteCourses.filter(
        (el) => el.course && !el.isDeleted,
      );

      const newPreRequisitesCourse = await Course.findByIdAndUpdate(id, {
        $addToSet: {
          preRequisiteCourses: { $each: newPreRequisites },
        },
      });
      if (!newPreRequisitesCourse) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Failed to update course');
      }
    }

    //basic course info;
    const updatedBasicCourseInfo = await Course.findByIdAndUpdate(
      id,
      remainingCourseData,
      { new: true, runValidators: true },
    ).populate('preRequisiteCourses.course');
    if (!updatedBasicCourseInfo) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to update course');
    }

    await session.commitTransaction();
    await session.endSession();
    return updatedBasicCourseInfo;
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to update course');
  }
};

const assignFacultiesWithCourseIntoDB = async (
  id: string,
  payLoad: string[],
) => {
  const result = await CourseFaculty.findByIdAndUpdate(
    id,
    { courseId: id, $addToSet: { faculties: { $each: payLoad } } },
    { upsert: true, new: true },
  );

  return result;
};

const removeFacultiesFromCourseFromDB = async (
  id: string,
  payLoad: string[],
) => {
  const result = await CourseFaculty.findByIdAndUpdate(
    id,
    { $pull: { faculties: { $in: payLoad } } },
    { new: true },
  );

  return result;
};

export const CourseServices = {
  createCourseIntoDB,
  getAllCoursesFromDB,
  getSingleCourseFromDB,
  deleteCourseFromDB,
  updateCourseIntoDB,
  assignFacultiesWithCourseIntoDB,
  removeFacultiesFromCourseFromDB,
};
