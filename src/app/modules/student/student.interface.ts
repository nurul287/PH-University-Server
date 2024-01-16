export interface Guardian {
  fatherName: string;
  fatherOccupation: string;
  fatherContactNo: string;
  motherName: string;
  motherOccupation: string;
  motherContactNo: string;
}
export interface UserName {
  firstName: string;
  middleName: string;
  lastName: string;
}

export interface LocalGuardian {
  name: string;
  occupation: string;
  contactNo: string;
  address: string;
}

export interface Student {
  id: string;
  name: UserName;
  gender: 'male' | 'female';
  dateOfBirth?: string;
  contactNo: string;
  emergencyContactNo: string;
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'o-';
  presentAddress: string;
  permanentAddress: string;
  guardian: Guardian;
  email: string;
  avatar?: string;
  localGuardian: LocalGuardian;
  profileImg?: string;
  isActive: 'active' | 'block';
}
