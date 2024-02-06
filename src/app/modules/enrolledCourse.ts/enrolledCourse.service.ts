import httpStatus from 'http-status';
import mongoose, { Types } from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import { Course } from '../course/course.model';
import { Faculty } from '../faculty/faculty.model';
import { OfferedCourse } from '../offeredCourse/offeredCourse.model';
import { SemesterRegistration } from '../semesterRegistration/semesterRegistration.model';
import { Student } from '../student/student.model';
import {
  TEnrolledCourse,
  TEnrolledCourseMarks,
} from './enrolledCourse.interface';
import { EnrolledCourse } from './enrolledCourse.model';
import { calculateGradeAndPoints } from './enrolledCourse.utils';

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

const getMyEnrolledCoursesFromDB = async (
  studentId: string,
  query: Record<string, unknown>,
) => {
  const student = await Student.findOne({ id: studentId });

  if (!student) {
    throw new AppError(httpStatus.NOT_FOUND, 'Student not found !');
  }

  const enrolledCourseQuery = new QueryBuilder(
    EnrolledCourse.find({ student: student._id }).populate(
      'semesterRegistration academicSemester academicFaculty academicDepartment offeredCourse course student faculty',
    ),
    query,
  )
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await enrolledCourseQuery.modelQuery;
  const meta = await enrolledCourseQuery.countTotal();

  return {
    meta,
    result,
  };
};

const updateEnrolledCourseMarksIntoDB = async (
  facultyId: string,
  payLoad: Partial<TEnrolledCourse>,
) => {
  const { semesterRegistration, offeredCourse, student, courseMarks } = payLoad;

  const isOfferedCourseExists = await OfferedCourse.findById(offeredCourse);
  if (!isOfferedCourseExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'This offered course not found!');
  }

  const isSemesterRegistrationExists =
    await SemesterRegistration.findById(semesterRegistration);
  if (!isSemesterRegistrationExists) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'This semester registration not found!',
    );
  }

  const isStudentExists = await Student.findById(student);
  if (!isStudentExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'This student not found!');
  }

  const faculty = await Faculty.findOne({ id: facultyId })
    .select({ _id: 1 })
    .lean();
  if (!faculty) {
    throw new AppError(httpStatus.NOT_FOUND, 'Faculty not found!');
  }

  const isCourseBelongToFaculty = await EnrolledCourse.findOne({
    semesterRegistration,
    offeredCourse,
    student,
    faculty: faculty?._id,
  });

  if (!isCourseBelongToFaculty) {
    throw new AppError(httpStatus.FORBIDDEN, 'You are forbidden!');
  }

  const modifiedData: Record<string, unknown> = {
    ...courseMarks,
  };
  if (courseMarks?.finalTerm) {
    const { classTest1, midTerm, classTest2 } =
      isCourseBelongToFaculty.courseMarks as TEnrolledCourseMarks;
    const totalMarks =
      Math.ceil(classTest1 * 0.1) +
      Math.ceil(midTerm * 0.3) +
      Math.ceil(classTest2 + 0.1) +
      Math.ceil(courseMarks.finalTerm * 0.5);
    const { grade, gradePoints } = calculateGradeAndPoints(totalMarks);
    modifiedData.grade = grade;
    modifiedData.gradePoints = gradePoints;
    modifiedData.isCompleted = true;
  }
  if (courseMarks && Object.keys(courseMarks).length) {
    for (const [key, value] of Object.entries(courseMarks)) {
      modifiedData[`courseMarks.${key}`] = value;
    }
  }
  const result = await EnrolledCourse.findByIdAndUpdate(
    isCourseBelongToFaculty._id,
    modifiedData,
    { new: true },
  );
  return result;
};

export const EnrolledCourseServices = {
  createEnrolledCourseIntoDB,
  updateEnrolledCourseMarksIntoDB,
  getMyEnrolledCoursesFromDB,
};
