import jwt from 'jsonwebtoken';
import { TAuthUser } from './auth.interface';

export const createToken = (
  jwtPayload: TAuthUser,
  secret: string,
  expiredIn: string,
) => {
  return jwt.sign(jwtPayload, secret, {
    expiresIn: expiredIn,
  });
};
