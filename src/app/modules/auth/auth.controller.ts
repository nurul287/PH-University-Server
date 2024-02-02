import httpStatus from 'http-status';
import config from '../../config';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { TAuthUser } from './auth.interface';
import { AuthServices } from './auth.service';

const loginUser = catchAsync(async (req, res) => {
  const result = await AuthServices.loginUserIntoDB(req.body);
  const { refreshToken, ...data } = result;

  res.cookie('refreshToken', refreshToken, {
    secure: config.node_env === 'production' ? true : false,
    httpOnly: true,
  });

  sendResponse(res, {
    success: true,
    message: 'User is logged in successfully',
    data,
    statusCode: httpStatus.OK,
  });
});

const changePassword = catchAsync(async (req, res) => {
  const user: TAuthUser = { userId: req.user.userId, role: req.user.role };
  const result = await AuthServices.changePasswordIntoDB(user, req.body);
  sendResponse(res, {
    success: true,
    message: 'Password changed successfully',
    data: result,
    statusCode: httpStatus.OK,
  });
});

const refreshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.cookies;
  const result = await AuthServices.refreshToken(refreshToken);
  sendResponse(res, {
    success: true,
    message: 'Access token is retrieve successfully',
    data: result,
    statusCode: httpStatus.OK,
  });
});

export const AuthControllers = {
  loginUser,
  changePassword,
  refreshToken,
};
