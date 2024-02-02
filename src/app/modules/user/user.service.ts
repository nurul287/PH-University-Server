import httpStatus from 'http-status';
import mongoose from 'mongoose';
import config from '../../config';
import AppError from '../../errors/AppError';
import { AcademicDepartment } from '../academicDepartment/academicDepartment.model';
import { TAcademicSemester } from '../academicSemester/academicSemester.interface';
import { AcademicSemester } from '../academicSemester/academicSemester.model';
import { TAdmin } from '../admin/admin.interface';
import { Admin } from '../admin/admin.model';
import { TAuthUser } from '../auth/auth.interface';
import { TFaculty } from '../faculty/faculty.interface';
import { Faculty } from '../faculty/faculty.model';
import { TStudent } from '../student/student.interface';
import { Student } from '../student/student.model';
import { TUser, TUserStatus } from './user.interface';
import { User } from './user.model';
import {
  generateAdminId,
  generateFacultyId,
  generateStudentId,
} from './user.utils';

const createStudentIntoDB = async (payLoad: TStudent, password: string) => {
  // create a user object
  const userData: Partial<TUser> = {};

  // if password is not given, set default password
  userData.password = password || (config.default_password as string);

  // set user role and email
  userData.role = 'student';
  userData.email = payLoad.email;

  // find academic semester info
  const admissionSemester = (await AcademicSemester.findById(
    payLoad.admissionSemester,
  )) as TAcademicSemester;
  if (!admissionSemester) {
    throw new AppError(httpStatus.NOT_FOUND, 'Academic semester not found');
  }

  const session = await mongoose.startSession();

  try {
    // ser generated id
    session.startTransaction();
    userData.id = await generateStudentId(admissionSemester);

    // create a user (transaction-1)
    const newUser = await User.create([userData], { session });
    if (!newUser.length) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create user');
    }
    // set id, _id as user
    payLoad.id = newUser[0].id;
    payLoad.user = newUser[0]._id;

    // create a student (transaction-2)

    const newStudent = await Student.create([payLoad], { session });
    if (!newStudent.length) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create student');
    }
    await session.commitTransaction();
    await session.endSession();
    return newStudent[0];
  } catch (error: any) {
    await session.abortTransaction();
    await session.endSession();
    throw new Error(error);
  }
};

const createFacultyIntoDB = async (payLoad: TFaculty, password: string) => {
  // create a user object
  const userData: Partial<TUser> = {};

  // if password is not given, set default password
  userData.password = password || (config.default_password as string);

  // set user role and email
  userData.role = 'faculty';
  userData.email = payLoad.email;

  // find academic department info
  const academicDepartment = (await AcademicDepartment.findById(
    payLoad.academicDepartment,
  )) as TAcademicSemester;
  if (!academicDepartment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Academic department not found');
  }

  const session = await mongoose.startSession();
  try {
    // ser generated id
    session.startTransaction();
    userData.id = await generateFacultyId();

    // create a user (transaction-1)
    const newUser = await User.create([userData], { session });
    if (!newUser.length) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create user');
    }
    // set id, _id as user
    payLoad.id = newUser[0].id;
    payLoad.user = newUser[0]._id;

    // create a faculty (transaction-2)

    const newFaculty = await Faculty.create([payLoad], { session });
    if (!newFaculty.length) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create faculty');
    }
    await session.commitTransaction();
    await session.endSession();
    return newFaculty[0];
  } catch (error: any) {
    await session.abortTransaction();
    await session.endSession();
    throw new Error(error);
  }
};
const createAdminIntoDB = async (payLoad: TAdmin, password: string) => {
  // create a user object
  const userData: Partial<TUser> = {};

  // if password is not given, set default password
  userData.password = password || (config.default_password as string);

  // set user role and email
  userData.role = 'admin';
  userData.email = payLoad.email;

  const session = await mongoose.startSession();
  try {
    // ser generated id
    session.startTransaction();
    userData.id = await generateAdminId();

    // create a user (transaction-1)
    const newUser = await User.create([userData], { session });
    if (!newUser.length) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create user');
    }

    // set id, _id as user
    payLoad.id = newUser[0].id;
    payLoad.user = newUser[0]._id;

    // create a admin (transaction-2)
    const newAdmin = await Admin.create([payLoad], { session });
    if (!newAdmin.length) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create admin');
    }
    await session.commitTransaction();
    await session.endSession();
    return newAdmin[0];
  } catch (error: any) {
    await session.abortTransaction();
    await session.endSession();
    throw new Error(error);
  }
};

const changeUserStatusIntoDB = async (
  id: string,
  payLoad: { status: TUserStatus },
) => {
  const result = await User.findByIdAndUpdate(id, payLoad, { new: true });
  return result;
};

const getMeFromDB = async (payLoad: TAuthUser) => {
  const { userId, role } = payLoad;
  let result = null;
  if (role === 'student') {
    result = await Student.findOne({ id: userId });
  } else if (role === 'faculty') {
    result = await Faculty.findOne({ id: userId });
  } else if (role === 'admin') {
    result = await Admin.findOne({ id: userId });
  }
  return result;
};

export const UserServices = {
  createStudentIntoDB,
  createFacultyIntoDB,
  createAdminIntoDB,
  getMeFromDB,
  changeUserStatusIntoDB,
};
