import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { AcademicSemesterNameCodeMapper } from './academicSemester.constant';
import { TAcademicSemester } from './academicSemester.interface';
import { AcademicSemester } from './academicSemester.model';

const createAcademicSemesterIntoDB = async (payLoad: TAcademicSemester) => {
  if (AcademicSemesterNameCodeMapper[payLoad.name] !== payLoad.code) {
    throw new AppError(httpStatus.NOT_ACCEPTABLE, 'Invalid Semester Code');
  }
  const result = await AcademicSemester.create(payLoad);
  return result;
};

const getAllAcademicSemesterFromDB = async () => {
  const result = await AcademicSemester.find();
  return result;
};

const getSingleAcademicSemesterFromDB = async (semesterId: string) => {
  const result = await AcademicSemester.findById(semesterId);
  return result;
};
const updateSingleAcademicSemesterIntoDB = async (
  semesterId: string,
  payLoad: TAcademicSemester,
) => {
  if (
    payLoad.name &&
    payLoad.code &&
    AcademicSemesterNameCodeMapper[payLoad.name] !== payLoad.code
  ) {
    throw new AppError(httpStatus.NOT_ACCEPTABLE, 'Invalid semester code!');
  }
  const result = await AcademicSemester.findOneAndUpdate(
    { _id: semesterId },
    payLoad,
    {
      new: true,
    },
  );
  return result;
};

export const AcademicSemesterServices = {
  createAcademicSemesterIntoDB,
  getAllAcademicSemesterFromDB,
  getSingleAcademicSemesterFromDB,
  updateSingleAcademicSemesterIntoDB,
};
