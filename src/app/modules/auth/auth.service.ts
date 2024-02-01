import httpStatus from 'http-status';
import jwt from 'jsonwebtoken';
import config from '../../config';
import AppError from '../../errors/AppError';
import { User } from '../user/user.model';
import { TLoginUser } from './auth.interface';

const loginUserIntoDB = async (payLoad: TLoginUser) => {
  // checking if the user is exist
  const user = await User.isUserExistsByCustomId(payLoad.id);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found!');
  }
  // checking if the user is already deleted or block;
  const { isDeleted, status, password, id, role, needsPasswordChange } = user;
  if (isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is deleted!');
  }
  if (status === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked!');
  }
  // checking if the password incorrect.
  const isPasswordMatched = await User.isPasswordMatched(
    payLoad?.password,
    password,
  );

  if (!isPasswordMatched) {
    throw new AppError(httpStatus.FORBIDDEN, 'Password does not match');
  }

  //create jwt token.
  const jwtPayload = {
    userId: id,
    role: role,
  };
  const accessToken = jwt.sign(jwtPayload, config.jwt_access_secret as string, {
    expiresIn: '10d',
  });

  return {
    accessToken,
    needsPasswordChange,
  };
};

export const AuthServices = {
  loginUserIntoDB,
};
