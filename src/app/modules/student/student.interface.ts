import { Model, Types } from 'mongoose';

export interface TGuardian {
  fatherName: string;
  fatherOccupation: string;
  fatherContactNo: string;
  motherName: string;
  motherOccupation: string;
  motherContactNo: string;
}
export interface TUserName {
  firstName: string;
  middleName?: string;
  lastName: string;
}

export interface TLocalGuardian {
  name: string;
  occupation: string;
  contactNo: string;
  address: string;
}

export interface TStudent {
  id: string;
  user: Types.ObjectId;
  name: TUserName;
  gender: 'male' | 'female' | 'other';
  dateOfBirth?: Date;
  contactNo: string;
  emergencyContactNo: string;
  bloodGroup?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'o-';
  presentAddress: string;
  permanentAddress: string;
  guardian: TGuardian;
  email: string;
  avatar?: string;
  localGuardian: TLocalGuardian;
  profileImg?: string;
  admissionSemester: Types.ObjectId;
  isDeleted?: boolean;
}

// for creating static
export interface TStudentModel extends Model<TStudent> {
  isUserExists: (id: string) => Promise<TStudent | null>;
}

// for creating instance
// export type TStudentMethods = {
//   isUserExists: (id: string) => Promise<TStudent | null>;
// };

// export type TStudentModel = Model<
//   TStudent,
//   Record<string, never>,
//   TStudentMethods
// >;
