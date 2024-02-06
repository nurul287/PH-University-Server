/* eslint-disable no-unused-vars */
import { Model } from 'mongoose';
import { USER_ROLE } from './user.constant';

export type TUserRole = keyof typeof USER_ROLE;
export type TUserStatus = 'in-progress' | 'blocked';
export interface TUser {
  id: string;
  email: string;
  password: string;
  needsPasswordChange: boolean;
  passwordChangeAt?: Date;
  role: 'admin' | 'student' | 'faculty';
  status: TUserStatus;
  isDeleted: boolean;
}

export interface UserModel extends Model<TUser> {
  isUserExistsByCustomId(id: string): Promise<TUser>;
  isPasswordMatched(
    plainTextPassword: string,
    hashedPassword: string,
  ): Promise<boolean>;
  isJWTIssuedBeforePasswordChange(
    passwordChangedTimestamp: Date,
    jwtIssuedTimestamp: number,
  ): boolean;
}
