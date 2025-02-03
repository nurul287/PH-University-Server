import { Response } from 'express';

type TMeta = {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
};
type TResponse<T> = {
  statusCode: number;
  success: boolean;
  message?: string;
  data: T;
  meta?: TMeta;
};

const sendResponse = <T>(res: Response, data: TResponse<T>) => {
  const { statusCode, success, message, data: responseData, meta } = data;

  res.status(statusCode).json({
    success,
    message,
    meta,
    data: responseData,
  });
};

export default sendResponse;
