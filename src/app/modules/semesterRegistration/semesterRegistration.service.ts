import httpStatus from 'http-status';
import mongoose from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import { AcademicSemester } from '../academicSemester/academicSemester.model';
import { OfferedCourse } from '../offeredCourse/offeredCourse.model';
import { RegistrationStatus } from './semesterRegistration.constant';
import { TSemesterRegistration } from './semesterRegistration.interface';
import { SemesterRegistration } from './semesterRegistration.model';

const createSemesterRegistrationIntoDB = async (
  payLoad: TSemesterRegistration,
) => {
  const { academicSemester } = payLoad;

  // check if there any registered semester that is already 'UPCOMING' or "ONGOING"
  const isThereAnyUpcomingOrOngoingSemester =
    await SemesterRegistration.findOne({
      $or: [
        { status: RegistrationStatus.UPCOMING },
        { status: RegistrationStatus.ONGOING },
      ],
    });
  if (isThereAnyUpcomingOrOngoingSemester) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      `There is already an ${isThereAnyUpcomingOrOngoingSemester.status} registered semester!`,
    );
  }
  //check if the semester is exist
  const isAcademicSemesterExits =
    await AcademicSemester.findById(academicSemester);
  if (!isAcademicSemesterExits) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'This academic semester not found!',
    );
  }

  //check if the semester is registered
  const isSemesterRegistrationExits = await SemesterRegistration.findOne({
    academicSemester,
  });
  if (isSemesterRegistrationExits) {
    throw new AppError(
      httpStatus.CONFLICT,
      'This semester is already registered!',
    );
  }

  const result = await SemesterRegistration.create(payLoad);
  return result;
};

const getAllSemesterRegistrationsFromDB = async (
  query: Record<string, unknown>,
) => {
  const semesterRegistrationQuery = new QueryBuilder(
    SemesterRegistration.find().populate('academicSemester'),
    query,
  )
    .filter()
    .sort()
    .paginate()
    .fields();
  const result = await semesterRegistrationQuery.modelQuery;
  return result;
};

const getSingleSemesterRegistrationFromDB = async (id: string) => {
  const result =
    await SemesterRegistration.findById(id).populate('academicSemester');
  return result;
};

const updateSemesterRegistrationIntoDB = async (
  id: string,
  payLoad: Partial<TSemesterRegistration>,
) => {
  //check if the requested semester is registered
  // check if the semester is already registered!
  const isSemesterRegistrationExits = await SemesterRegistration.findById(id);
  if (!isSemesterRegistrationExits) {
    throw new AppError(httpStatus.CONFLICT, 'This semester is not found!');
  }

  // if the requested semester registration is ended, we will not update anything;
  const currentSemesterStatus = isSemesterRegistrationExits.status;
  const requestedStatus = payLoad.status;
  if (currentSemesterStatus === RegistrationStatus.ENDED) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `This semester is already ${currentSemesterStatus}`,
    );
  }

  // UPCOMING --> ONGOING --> ENDED
  if (
    currentSemesterStatus === RegistrationStatus.UPCOMING &&
    requestedStatus === RegistrationStatus.ENDED
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `You can not directly change status from ${currentSemesterStatus} to ${requestedStatus}`,
    );
  }
  if (
    currentSemesterStatus === RegistrationStatus.ONGOING &&
    requestedStatus === RegistrationStatus.UPCOMING
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `You can not directly change status from ${currentSemesterStatus} to ${requestedStatus}`,
    );
  }

  const result = await SemesterRegistration.findByIdAndUpdate(id, payLoad, {
    new: true,
    runValidators: true,
  });
  return result;
};

const deleteSemesterRegistrationFromDB = async (id: string) => {
  // check if the semester is already registered!
  const isSemesterRegistrationExits = await SemesterRegistration.findById(id);
  if (!isSemesterRegistrationExits) {
    throw new AppError(httpStatus.CONFLICT, 'This semester not found!');
  }

  // if the requested semester registration is ended, we will not update anything;
  const { status: currentSemesterStatus } = isSemesterRegistrationExits;

  if (currentSemesterStatus !== RegistrationStatus.UPCOMING) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `This semester can not be deleted! because it is ${currentSemesterStatus}`,
    );
  }
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const deleteOfferedCourse = await OfferedCourse.deleteMany(
      {
        semesterRegistration: id,
      },
      { session },
    );
    if (!deleteOfferedCourse) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `Failed to deleted offered course`,
      );
    }

    const deleteSemesterRegistration =
      await SemesterRegistration.findByIdAndDelete(id, { session, new: true });

    if (!deleteSemesterRegistration) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `Failed to deleted semester registration`,
      );
    }

    await session.commitTransaction();
    await session.endSession();
    return null;
  } catch (error: any) {
    await session.abortTransaction();
    await session.endSession();
    throw new Error(error);
  }
};

export const SemesterRegistrationServices = {
  createSemesterRegistrationIntoDB,
  getAllSemesterRegistrationsFromDB,
  getSingleSemesterRegistrationFromDB,
  updateSemesterRegistrationIntoDB,
  deleteSemesterRegistrationFromDB,
};
