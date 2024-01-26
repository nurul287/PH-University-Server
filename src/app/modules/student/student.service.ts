import httpStatus from 'http-status';
import mongoose from 'mongoose';
import AppError from '../../errors/AppError';
import { User } from '../user/user.model';
import { TStudent } from './student.interface';
import { Student } from './student.model';

const getAllStudentsFromBD = async () => {
  const result = await Student.find()
    .populate('admissionSemester')
    .populate({
      path: 'academicDepartment',
      populate: {
        path: 'academicFaculty',
      },
    });
  return result;
};

const getSingleStudentFromBD = async (id: string) => {
  const result = await Student.findOne({ id })
    .populate('admissionSemester')
    .populate({
      path: 'academicDepartment',
      populate: {
        path: 'academicFaculty',
      },
    });
  return result;
};
const deleteStudentFromBD = async (id: string) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const isUserExists = await Student.isUserExists(id);
    if (!isUserExists) {
      throw new AppError(httpStatus.NOT_FOUND, 'This Student does not exists!');
    }

    const deletedUser = await User.findOneAndUpdate(
      { id },
      { isDeleted: true },
      { new: true, session },
    );
    if (!deletedUser) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to deleted user');
    }

    const deleteStudent = await Student.findOneAndUpdate(
      { id },
      { isDeleted: true },
      { new: true, session },
    );
    if (!deleteStudent) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to deleted student');
    }

    await session.commitTransaction();
    await session.endSession();

    return deleteStudent;
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to deleted student');
  }
};

const updateStudentFromDB = async (id: string, payLoad: Partial<TStudent>) => {
  const isUserExists = await Student.isUserExists(id);
  if (!isUserExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'This Student does not exists!');
  }
  const { name, guardian, localGuardian, ...remainingData } = payLoad;
  const modifiedUpdateData: Record<string, unknown> = { ...remainingData };
  if (name && Object.keys(name).length) {
    for (const [key, value] of Object.entries(name)) {
      modifiedUpdateData[`name.${key}`] = value;
    }
  }
  if (guardian && Object.keys(guardian).length) {
    for (const [key, value] of Object.entries(guardian)) {
      modifiedUpdateData[`guardian.${key}`] = value;
    }
  }
  if (localGuardian && Object.keys(localGuardian).length) {
    for (const [key, value] of Object.entries(localGuardian)) {
      modifiedUpdateData[`localGuardian.${key}`] = value;
    }
  }

  const result = await Student.findOneAndUpdate({ id }, modifiedUpdateData, {
    new: true,
  });
  return result;
};

export const StudentServices = {
  getAllStudentsFromBD,
  getSingleStudentFromBD,
  deleteStudentFromBD,
  updateStudentFromDB,
};
