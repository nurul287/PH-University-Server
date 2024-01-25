import { Types } from 'mongoose';
import { AcademicSemesterNameCodeMapper } from './academicSemester.constant';
import { TAcademicSemester } from './academicSemester.interface';
import { AcademicSemester } from './academicSemester.model';

const createAcademicSemesterIntoDB = async (payLoad: TAcademicSemester) => {
  if (AcademicSemesterNameCodeMapper[payLoad.name] !== payLoad.code) {
    throw new Error('Invalid Semester Code');
  }
  const result = await AcademicSemester.create(payLoad);
  return result;
};

const getAllAcademicSemesterFromDB = async () => {
  const result = await AcademicSemester.find();
  return result;
};

const getSingleAcademicSemesterFromDB = async (id: Types.ObjectId) => {
  const result = await AcademicSemester.findOne({ _id: id });
  return result;
};
const updateSingleAcademicSemesterIntoDB = async (
  id: Types.ObjectId,
  payLoad: TAcademicSemester,
) => {
  const doc = await AcademicSemester.findOne({ _id: id });
  if (doc) {
    await AcademicSemester.updateOne({ _id: id }, payLoad);
    return {};
  }
};

export const AcademicSemesterServices = {
  createAcademicSemesterIntoDB,
  getAllAcademicSemesterFromDB,
  getSingleAcademicSemesterFromDB,
  updateSingleAcademicSemesterIntoDB,
};
