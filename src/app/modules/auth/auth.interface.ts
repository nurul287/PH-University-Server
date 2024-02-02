import { TUserRole } from '../user/user.interface';

export type TLoginUser = {
  id: string;
  password: string;
};

export type TAuthUser = {
  userId: string;
  role: TUserRole;
};

export type TChangePassword = {
  newPassword: string;
  oldPassword: string;
};
