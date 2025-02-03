import httpStatus from 'http-status';
import mongoose from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import { User } from '../user/user.model';
import { studentSearchableField } from './student.constant';
import { TStudent } from './student.interface';
import { Student } from './student.model';

const getAllStudentsFromBD = async (query: Record<string, unknown>) => {
  const studentQuery = new QueryBuilder(
    Student.find()
      .populate('admissionSemester')
      .populate('academicDepartment academicFaculty'),
    query,
  )
    .search(studentSearchableField)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await studentQuery.modelQuery;
  const meta = await studentQuery.countTotal();
  return {
    meta,
    result,
  };
};

const getSingleStudentFromBD = async (id: string) => {
  const result = await Student.findById(id)
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

    const deleteStudent = await Student.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true, session },
    );
    if (!deleteStudent) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to deleted student');
    }

    const userId = deleteStudent.user;
    const deletedUser = await User.findByIdAndUpdate(
      userId,
      { isDeleted: true },
      { new: true, session },
    );
    if (!deletedUser) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to deleted user');
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

  const result = await Student.findByIdAndUpdate({ id }, modifiedUpdateData, {
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
