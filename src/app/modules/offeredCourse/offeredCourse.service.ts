import httpStatus from 'http-status';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import { AcademicDepartment } from '../academicDepartment/academicDepartment.model';
import { AcademicFaculty } from '../academicFaculty.ts/academicFaculty.model';
import { Course } from '../course/course.model';
import { Faculty } from '../faculty/faculty.model';
import { RegistrationStatus } from '../semesterRegistration/semesterRegistration.constant';
import { SemesterRegistration } from '../semesterRegistration/semesterRegistration.model';
import { Student } from '../student/student.model';
import {
  TOfferedCourse,
  TUpdateOfferedCourse,
} from './offeredCourse.interface';
import { OfferedCourse } from './offeredCourse.model';
import { hasTimeConflict } from './offeredCourse.utils';

const createOfferedCourseIntoDB = async (payLoad: TOfferedCourse) => {
  const {
    semesterRegistration,
    academicFaculty,
    academicDepartment,
    course,
    faculty,
    section,
    days,
    startTime,
    endTime,
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

  // get schedules of the faculties
  const assignedSchedules = await OfferedCourse.find({
    semesterRegistration,
    faculty,
    days: { $in: days },
  })
    .select('days startTime endTime')
    .lean();
  const newSchedule = {
    days,
    startTime,
    endTime,
  };

  if (hasTimeConflict(assignedSchedules, newSchedule))
    throw new AppError(
      httpStatus.CONFLICT,
      `This faculty is not available at that time! Choose other time or day"`,
    );

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
  const meta = await offeredCourseQuery.countTotal();

  return { meta, result };
};

const getMyOfferedCourseFromDB = async (
  userId: string,
  query: Record<string, unknown>,
) => {
  // find the student
  const student = await Student.findOne({ id: userId });
  if (!student) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'There is no ongoing semester registration',
    );
  }

  // find the current ongoing semester
  const currentOngoingRegistrationSemester = await SemesterRegistration.findOne(
    {
      status: RegistrationStatus.ONGOING,
    },
  );

  if (!currentOngoingRegistrationSemester) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'There is no ongoing semester registration',
    );
  }

  // pagination setup
  const page = Number(query?.page) || 1;
  const limit = Number(query?.limit) || 10;
  const skip = (page - 1) * limit;
  const aggregationQuery = [
    {
      $match: {
        semesterRegistration: currentOngoingRegistrationSemester?._id,
        academicDepartment: student?.academicDepartment,
        academicFaculty: student?.academicFaculty,
      },
    },
    {
      $lookup: {
        from: 'courses',
        localField: 'course',
        foreignField: '_id',
        as: 'course',
      },
    },
    { $unwind: '$course' },
    {
      $lookup: {
        from: 'enrolledcourses',
        let: {
          currentOngoingRegistrationSemester:
            currentOngoingRegistrationSemester._id,
          currentStudent: student._id,
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: [
                      '$semesterRegistration',
                      '$$currentOngoingRegistrationSemester',
                    ],
                  },
                  {
                    $eq: ['$student', '$$currentStudent'],
                  },
                  {
                    $eq: ['$isEnrolled', true],
                  },
                ],
              },
            },
          },
        ],
        as: 'enrolledCourses',
      },
    },
    {
      $lookup: {
        from: 'enrolledcourses',
        let: {
          currentStudent: student._id,
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: ['$student', '$$currentStudent'],
                  },
                  {
                    $eq: ['$isCompleted', true],
                  },
                ],
              },
            },
          },
        ],
        as: 'completedCourses',
      },
    },
    {
      $addFields: {
        completedCourseIds: {
          $map: {
            input: '$completedCourses',
            as: 'completed',
            in: '$$completed.course',
          },
        },
      },
    },
    {
      $addFields: {
        isPreRequisitesFulFilled: {
          $or: [
            { $eq: ['$course.preRequisiteCourses', []] },
            {
              $setIsSubset: [
                '$course.preRequisiteCourses.course',
                '$completedCourseIds',
              ],
            },
          ],
        },
        isAlreadyEnrolled: {
          $in: [
            '$course._id',
            {
              $map: {
                input: '$enrolledCourses',
                as: 'enroll',
                in: '$$enroll.course',
              },
            },
          ],
        },
      },
    },
    {
      $match: {
        isAlreadyEnrolled: false,
        isPreRequisitesFulFilled: true,
      },
    },
  ];
  const paginationQuery = [{ $skip: skip }, { $limit: limit }];

  const result = await OfferedCourse.aggregate([
    ...aggregationQuery,
    ...paginationQuery,
  ]);

  const total = (await OfferedCourse.aggregate(aggregationQuery)).length;
  const totalPage = Math.ceil(result.length / limit);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage,
    },
    result,
  };
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
  payLoad: TUpdateOfferedCourse,
) => {
  const { faculty, days, startTime, endTime } = payLoad;

  const isOfferedCourseExits = await OfferedCourse.findById(id);
  if (!isOfferedCourseExits) {
    throw new AppError(httpStatus.NOT_FOUND, 'Offered course not found!');
  }

  const isFacultyExits = await Faculty.findById(faculty);
  if (!isFacultyExits) {
    throw new AppError(httpStatus.NOT_FOUND, 'Faculty not found!');
  }

  // get schedules of the faculties
  const { semesterRegistration } = isOfferedCourseExits;
  const assignedSchedules = await OfferedCourse.find({
    semesterRegistration,
    faculty,
    days: { $in: days },
  })
    .select('days startTime endTime')
    .lean();
  const newSchedule = {
    days,
    startTime,
    endTime,
  };
  if (hasTimeConflict(assignedSchedules, newSchedule))
    throw new AppError(
      httpStatus.CONFLICT,
      `This faculty is not available at that time! Choose other time or day"`,
    );

  // check semester registration status
  const semesterRegistrationStatus =
    await SemesterRegistration.findById(semesterRegistration).lean();
  if (semesterRegistrationStatus?.status !== RegistrationStatus.UPCOMING) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `You can not update this offered course as it is ${semesterRegistrationStatus?.status}"`,
    );
  }

  const result = await OfferedCourse.findByIdAndUpdate(id, payLoad, {
    new: true,
    runValidators: true,
  });
  return result;
};

const deleteOfferedCourseFromDB = async (id: string) => {
  const isOfferedCourseExits = await OfferedCourse.findById(id);
  if (!isOfferedCourseExits) {
    throw new AppError(httpStatus.NOT_FOUND, 'Offered course not found!');
  }

  const { semesterRegistration } = isOfferedCourseExits;
  const semesterRegistrationStatus =
    await SemesterRegistration.findById(semesterRegistration).lean();
  if (semesterRegistrationStatus?.status !== RegistrationStatus.UPCOMING) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Offered course can not delete! because the semester ${semesterRegistrationStatus?.status}"`,
    );
  }
  const result = await OfferedCourse.findByIdAndDelete(id);
  return result;
};

export const OfferedCourseServices = {
  createOfferedCourseIntoDB,
  getAllOfferedCourseFromDB,
  getMyOfferedCourseFromDB,
  getSingleOfferedCourseFromDB,
  updateOfferedCourseIntoDB,
  deleteOfferedCourseFromDB,
};
