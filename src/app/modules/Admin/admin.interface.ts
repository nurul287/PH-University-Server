import { Model, Types } from 'mongoose';

export type TGender = 'male' | 'female' | 'other';
export type TBloodGroup =
  | 'A+'
  | 'A-'
  | 'B+'
  | 'B-'
  | 'AB+'
  | 'AB-'
  | 'O+'
  | 'O-';

export interface TUserName {
  firstName: string;
  middleName?: string;
  lastName: string;
}

export interface TAdmin {
  id: string;
  user: Types.ObjectId;
  designation: string;
  name: TUserName;
  gender: TGender;
  dateOfBirth?: Date;
  contactNo: string;
  emergencyContactNo: string;
  bloodGroup?: TBloodGroup;
  presentAddress: string;
  permanentAddress: string;
  email: string;
  profileImg?: string;
  isDeleted?: boolean;
}

export interface TAdminModel extends Model<TAdmin> {
  isUserExists: (id: string) => Promise<TAdmin | null>;
}
