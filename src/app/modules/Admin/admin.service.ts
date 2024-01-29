import httpStatus from 'http-status';
import mongoose from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import { User } from '../user/user.model';
import { AdminSearchableFields } from './admin.constant';
import { TAdmin } from './admin.interface';
import { Admin } from './admin.model';

const getAllAdminsFromBD = async (query: Record<string, unknown>) => {
  const adminQuery = new QueryBuilder(Admin.find(), query)
    .search(AdminSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();
  const result = await adminQuery.modelQuery;
  return result;
};

const getSingleAdminFromBD = async (id: string) => {
  const result = await Admin.findById(id);
  return result;
};

const deleteAdminFromBD = async (id: string) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const isUserExists = await Admin.isUserExists(id);
    if (!isUserExists) {
      throw new AppError(httpStatus.NOT_FOUND, 'This admin does not exists!');
    }
    const deleteAdmin = await Admin.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true, session },
    );
    if (!deleteAdmin) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to deleted admin');
    }

    const userId = deleteAdmin.user;
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

    return deleteAdmin;
  } catch (error: any) {
    await session.abortTransaction();
    await session.endSession();
    throw new Error(error);
  }
};

const updateAdminFromDB = async (id: string, payLoad: Partial<TAdmin>) => {
  const isUserExists = await Admin.isUserExists(id);
  if (!isUserExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'This admin does not exists!');
  }
  const { name, ...remainingData } = payLoad;
  const modifiedUpdateData: Record<string, unknown> = { ...remainingData };
  if (name && Object.keys(name).length) {
    for (const [key, value] of Object.entries(name)) {
      modifiedUpdateData[`name.${key}`] = value;
    }
  }

  const result = await Admin.findByIdAndUpdate(id, modifiedUpdateData, {
    new: true,
    runValidators: true,
  });
  return result;
};

export const AdminServices = {
  getAllAdminsFromBD,
  getSingleAdminFromBD,
  deleteAdminFromBD,
  updateAdminFromDB,
};
