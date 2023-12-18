export interface Guardian {
  fatherName: string;
  fatherOccupation: string;
  fatcherContactNo: string;
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
  dateofBirth: string;
  contactNo: string;
  emergencyContactNo: string;
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'o-';
  presentAddress: string;
  permanentAddress: string;
  gurdian: Guardian;
  email: string;
  avatar?: string;
  localGuardian: LocalGuardian;
  profileImg?: string;
  isActive: 'active' | 'inActive';
}
