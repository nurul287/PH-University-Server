import httpStatus from 'http-status';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import { AcademicDepartment } from '../academicDepartment/academicDepartment.model';
import { AcademicFaculty } from '../academicFaculty.ts/academicFaculty.model';
import { Course } from '../course/course.model';
import { Faculty } from '../faculty/faculty.model';
import { SemesterRegistration } from '../semesterRegistration/semesterRegistration.model';
import {
  TOfferedCourse,
  TUpdateOfferedCourse,
} from './offeredCourse.interface';
import { OfferedCourse } from './offeredCourse.model';

const createOfferedCourseIntoDB = async (payLoad: TOfferedCourse) => {
  const {
    semesterRegistration,
    academicFaculty,
    academicDepartment,
    course,
    faculty,
    section,
  } = payLoad;
  const isSemesterRegistrationExits =
    await SemesterRegistration.findById(semesterRegistration);
  if (!isSemesterRegistrationExits) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Semester registration not found!',
    );
  }
  const isAcademicFacultyExits =
    await AcademicFaculty.findById(academicFaculty);
  if (!isAcademicFacultyExits) {
    throw new AppError(httpStatus.NOT_FOUND, 'Academic faculty not found!');
  }
  const isAcademicDepartmentExits =
    await AcademicDepartment.findById(academicDepartment);
  if (!isAcademicDepartmentExits) {
    throw new AppError(httpStatus.NOT_FOUND, 'Academic department not found!');
  }
  const isCourseExits = await Course.findById(course);
  if (!isCourseExits) {
    throw new AppError(httpStatus.NOT_FOUND, 'Course not found!');
  }
  const isFacultyExits = await Faculty.findById(faculty);
  if (!isFacultyExits) {
    throw new AppError(httpStatus.NOT_FOUND, 'Faculty not found!');
  }
  // check if the department is belong to the faculty;
  const isDepartmentBelongToFaculty = await AcademicDepartment.findOne({
    _id: academicDepartment,
    academicFaculty,
  });
  if (!isDepartmentBelongToFaculty) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `This "${isAcademicDepartmentExits.name}" is not belong to this "${isAcademicFacultyExits.name}"`,
    );
  }

  // check if the same course same section in same registered semester exists
  const isSameSectionExists = await OfferedCourse.findOne({
    semesterRegistration,
    course,
    section,
  });
  if (isSameSectionExists) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Offer course with same section already exists"`,
    );
  }

  payLoad.academicSemester = isSemesterRegistrationExits.academicSemester;

  const result = await OfferedCourse.create(payLoad);
  return result;
};

const getAllOfferedCourseFromDB = async (query: Record<string, unknown>) => {
  const offeredCourseQuery = new QueryBuilder(
    OfferedCourse.find()
      .populate('semesterRegistration')
      .populate('academicSemester')
      .populate('academicDepartment')
      .populate('academicFaculty')
      .populate('course')
      .populate('faculty'),
    query,
  )
    .filter()
    .sort()
    .paginate()
    .fields();
  const result = await offeredCourseQuery.modelQuery;
  return result;
};

const getSingleOfferedCourseFromDB = async (id: string) => {
  const result = await OfferedCourse.findById(id)
    .populate('semesterRegistration')
    .populate('academicSemester')
    .populate('academicDepartment')
    .populate('academicFaculty')
    .populate('course')
    .populate('faculty');
  return result;
};

const updateOfferedCourseIntoDB = async (
  id: string,
  payLoad: Partial<TUpdateOfferedCourse>,
) => {
  const result = await OfferedCourse.findByIdAndUpdate(id, payLoad, {
    new: true,
    runValidators: true,
  });
  return result;
};

export const OfferedCourseServices = {
  createOfferedCourseIntoDB,
  getAllOfferedCourseFromDB,
  getSingleOfferedCourseFromDB,
  updateOfferedCourseIntoDB,
};
