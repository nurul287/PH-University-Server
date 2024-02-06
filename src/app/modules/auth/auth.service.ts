import bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import config from '../../config';
import AppError from '../../errors/AppError';
import { sendEmail } from '../../utils/sendEmail';
import { User } from '../user/user.model';
import {
  TAuthUser,
  TChangePassword,
  TLoginUser,
  TResetPassword,
} from './auth.interface';
import { createToken, verifyToken } from './auth.utils';

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
  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string,
  );
  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expires_in as string,
  );

  return {
    accessToken,
    needsPasswordChange,
    refreshToken,
  };
};

const changePasswordIntoDB = async (
  userData: TAuthUser,
  payLoad: TChangePassword,
) => {
  const user = await User.isUserExistsByCustomId(userData.userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found!');
  }
  // checking if the user is already deleted or block;
  const { isDeleted, status, password } = user;
  if (isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is deleted!');
  }
  if (status === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked!');
  }
  // checking if the password incorrect.
  const isPasswordMatched = await User.isPasswordMatched(
    payLoad?.oldPassword,
    password,
  );
  if (!isPasswordMatched) {
    throw new AppError(httpStatus.FORBIDDEN, 'Password does not match');
  }

  // hash new password
  const newHashedPassword = await bcrypt.hash(
    payLoad.newPassword,
    Number(config.bcrypt_salt_rounds),
  );

  await User.findOneAndUpdate(
    { id: userData.userId, role: userData.role },
    {
      password: newHashedPassword,
      needsPasswordChange: false,
      passwordChangeAt: new Date(),
    },
  );

  return null;
};

const refreshToken = async (token: string) => {
  const decoded = verifyToken(token, config.jwt_refresh_secret as string);
  const { userId, iat } = decoded;
  const user = await User.isUserExistsByCustomId(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found!');
  }
  // checking if the user is already deleted or block;
  const { isDeleted, status, passwordChangeAt, id, role } = user;

  if (
    passwordChangeAt &&
    User.isJWTIssuedBeforePasswordChange(passwordChangeAt, iat as number)
  ) {
    throw new AppError(httpStatus.FORBIDDEN, 'Token is not valid!');
  }

  if (isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is deleted!');
  }
  if (status === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked!');
  }
  const jwtPayload = {
    userId: id,
    role: role,
  };
  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string,
  );

  return {
    accessToken,
  };
};

const forgetPassword = async (userId: string) => {
  const user = await User.isUserExistsByCustomId(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found!');
  }

  // checking if the user is already deleted or block;
  const { isDeleted, status, id, role, email } = user;
  if (isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is deleted!');
  }
  if (status === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked!');
  }
  const jwtPayload = {
    userId: id,
    role: role,
  };
  const resetToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    '10m',
  );
  const resetUILink = `${config.app_url}?id=${id}&token=${resetToken}`;
  sendEmail(email, resetUILink);
  return null;
};

const resetPassword = async (payLoad: TResetPassword, token: string) => {
  // decode jwt
  const decoded = verifyToken(token, config.jwt_access_secret as string);
  const { userId } = decoded;
  if (userId !== payLoad.id) {
    throw new AppError(httpStatus.FORBIDDEN, 'You are forbidden!');
  }

  const user = await User.isUserExistsByCustomId(payLoad.id);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found!');
  }

  // checking if the user is already deleted or block;
  const { isDeleted, status, id, role } = user;
  if (isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is deleted!');
  }
  if (status === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked!');
  }
  // hash new password
  const newHashedPassword = await bcrypt.hash(
    payLoad.newPassword,
    Number(config.bcrypt_salt_rounds),
  );
  await User.findOneAndUpdate({ id, role }, { password: newHashedPassword });
  return null;
};

export const AuthServices = {
  loginUserIntoDB,
  changePasswordIntoDB,
  refreshToken,
  forgetPassword,
  resetPassword,
};
