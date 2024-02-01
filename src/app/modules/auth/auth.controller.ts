import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { AuthServices } from './auth.service';

const loginUser = catchAsync(async (req, res) => {
  const result = await AuthServices.loginUserIntoDB(req.body);
  sendResponse(res, {
    success: true,
    message: 'User is logged in successfully',
    data: result,
    statusCode: httpStatus.OK,
  });
});

export const AuthControllers = {
  loginUser,
};
