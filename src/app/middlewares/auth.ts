import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../config';
import AppError from '../errors/AppError';
import { TUserRole } from '../modules/user/user.interface';
import { User } from '../modules/user/user.model';
import catchAsync from '../utils/catchAsync';

const auth = (...requiredRoles: TUserRole[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization;
    if (!token) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorize');
    }
    let decoded;
    try {
      decoded = jwt.verify(
        token,
        config.jwt_access_secret as string,
      ) as JwtPayload;
    } catch (error) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'Unauthorized');
    }

    const { role, userId, iat } = decoded;
    const user = await User.isUserExistsByCustomId(userId);
    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, 'This user is not found!');
    }
    // checking if the user is already deleted or block;
    const { isDeleted, status, passwordChangeAt } = user;

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

    if (requiredRoles && !requiredRoles.includes(role)) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorize');
    }
    req.user = decoded as JwtPayload;
    next();
  });
};

export default auth;
