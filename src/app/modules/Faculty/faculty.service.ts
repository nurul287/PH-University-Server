import httpStatus from 'http-status';
import mongoose from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import { User } from '../user/user.model';
import { FacultySearchableFields } from './faculty.constant';
import { TFaculty } from './faculty.interface';
import { Faculty } from './faculty.model';

const getAllFacultiesFromBD = async (query: Record<string, unknown>) => {
  const facultyQuery = new QueryBuilder(
    Faculty.find().populate('academicDepartment'),
    query,
  )
    .search(FacultySearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();
  const result = await facultyQuery.modelQuery;
  const meta = await facultyQuery.countTotal();

  return { meta, result };
};

const getSingleFacultyFromBD = async (id: string) => {
  const result = await Faculty.findById(id).populate('academicDepartment');
  return result;
};

const deleteFacultyFromBD = async (id: string) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const isUserExists = await Faculty.isUserExists(id);
    if (!isUserExists) {
      throw new AppError(httpStatus.NOT_FOUND, 'This faculty does not exists!');
    }

    const deleteFaculty = await Faculty.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true, session },
    );
    if (!deleteFaculty) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to deleted faculty');
    }

    const userId = deleteFaculty.user;

    const deletedUser = await User.findOneAndUpdate(
      userId,
      { isDeleted: true },
      { new: true, session },
    );
    if (!deletedUser) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to deleted user');
    }

    await session.commitTransaction();
    await session.endSession();

    return deleteFaculty;
  } catch (error: any) {
    await session.abortTransaction();
    await session.endSession();
    throw new Error(error);
  }
};

const updateFacultyFromDB = async (id: string, payLoad: Partial<TFaculty>) => {
  const isUserExists = await Faculty.isUserExists(id);
  if (!isUserExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'This faculty does not exists!');
  }
  const { name, ...remainingData } = payLoad;
  const modifiedUpdateData: Record<string, unknown> = { ...remainingData };
  if (name && Object.keys(name).length) {
    for (const [key, value] of Object.entries(name)) {
      modifiedUpdateData[`name.${key}`] = value;
    }
  }

  const result = await Faculty.findByIdAndUpdate(id, modifiedUpdateData, {
    new: true,
    runValidators: true,
  });
  return result;
};

export const FacultyServices = {
  getAllFacultiesFromBD,
  getSingleFacultyFromBD,
  deleteFacultyFromBD,
  updateFacultyFromDB,
};
