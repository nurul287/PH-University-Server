import httpStatus from 'http-status';
import mongoose, { Types } from 'mongoose';
import AppError from '../../errors/AppError';
import { OfferedCourse } from '../offeredCourse/offeredCourse.model';
import { Student } from '../student/student.model';
import { TEnrolledCourse } from './enrolledCourse.interface';
import { EnrolledCourse } from './enrolledCourse.model';

const createEnrolledCourseIntoDB = async (
  userId: string,
  offeredCourse: Types.ObjectId,
) => {
  // step1: Check if the offered course is exists
  // step2: Check if the student is already enrolled
  // step3: Check the capacity
  // step4: Create an enrolled course

  const isOfferedCourseExists = await OfferedCourse.findById(offeredCourse);
  if (!isOfferedCourseExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'This offered course not found!');
  }
  const student = await Student.findOne({ id: userId }).select('_id');
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
  if (maxCapacity <= 0) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Room is full!');
  }

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
