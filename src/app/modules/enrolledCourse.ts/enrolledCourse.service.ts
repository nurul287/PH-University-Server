import httpStatus from 'http-status';
import mongoose, { Types } from 'mongoose';
import AppError from '../../errors/AppError';
import { Course } from '../course/course.model';
import { OfferedCourse } from '../offeredCourse/offeredCourse.model';
import { SemesterRegistration } from '../semesterRegistration/semesterRegistration.model';
import { Student } from '../student/student.model';
import { TEnrolledCourse } from './enrolledCourse.interface';
import { EnrolledCourse } from './enrolledCourse.model';

const createEnrolledCourseIntoDB = async (
  userId: string,
  offeredCourse: Types.ObjectId,
) => {
  // step1: Check if the offered course is exists
  const isOfferedCourseExists = await OfferedCourse.findById(offeredCourse);
  if (!isOfferedCourseExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'This offered course not found!');
  }

  // step2: Find the enrolled student;
  const student = await Student.findOne({ id: userId }, { _id: 1 });
  if (!student) {
    throw new AppError(httpStatus.NOT_FOUND, 'Student not found!');
  }

  const {
    semesterRegistration,
    academicDepartment,
    academicFaculty,
    academicSemester,
    faculty,
    course,
    maxCapacity,
  } = isOfferedCourseExists;

  // step3: Check the capacity exceed
  if (maxCapacity <= 0) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Max capacity exceed!');
  }

  // step4: Check if the student is already enrolled

  const isStudentAlreadyEnrolled = await EnrolledCourse.findOne({
    semesterRegistration,
    offeredCourse,
    student: student._id,
  });

  if (isStudentAlreadyEnrolled) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'This student is already enrolled!',
    );
  }

  const courseData = await Course.findById(course);
  const currentCredit = courseData?.credits || 0;

  // check total credit exceeds maxCredit
  const semesterRegistrationData =
    await SemesterRegistration.findById(semesterRegistration).select(
      'maxCredit',
    );
  const maxCredit = semesterRegistrationData?.maxCredit || 0;

  // total enrolled credits

  const enrolledCourses = await EnrolledCourse.aggregate([
    {
      $match: { semesterRegistration, student: student._id },
    },
    {
      $lookup: {
        from: 'courses',
        localField: 'course',
        foreignField: '_id',
        as: 'enrolledCourseData',
      },
    },
    { $unwind: '$enrolledCourseData' },
    {
      $group: {
        _id: null,
        totalEnrolledCredits: { $sum: '$enrolledCourseData.credits' },
      },
    },
    {
      $project: {
        _id: 0,
        totalEnrolledCredits: 1,
      },
    },
  ]);
  const totalCredits = enrolledCourses[0]?.totalEnrolledCredits ?? 0;

  //step5: total enrolled credits  + new enrolled course credit > maxCredit
  if (totalCredits + currentCredit > maxCredit) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You have exceeded maximum number of credits',
    );
  }

  const payLoad: TEnrolledCourse = {
    semesterRegistration,
    academicDepartment,
    academicFaculty,
    academicSemester,
    offeredCourse,
    faculty,
    course,
    student: student._id,
  };
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // step6: Create Student
    const result = await EnrolledCourse.create([payLoad], { session });
    if (!result) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Failed to enroll in this course!',
      );
    }
    await OfferedCourse.findByIdAndUpdate(
      offeredCourse,
      {
        maxCapacity: maxCapacity - 1,
      },
      { session },
    );

    await session.commitTransaction();
    await session.endSession();
    return result[0];
  } catch (error: any) {
    await session.abortTransaction();
    await session.endSession();
    throw new Error(error);
  }
};

export const EnrolledCourseServices = {
  createEnrolledCourseIntoDB,
};
