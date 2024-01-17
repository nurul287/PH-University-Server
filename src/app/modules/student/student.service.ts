import { TStudent } from './student.interface';
import { Student } from './student.model';

const createStudentIntoDB = async (studentData: TStudent) => {
  if (await Student.isUserExists(studentData.id)) {
    throw new Error('User already exists!');
  }
  const result = await Student.create(studentData); // built in static method

  // const student = new Student(studentData); // create a instance;
  // if (await student.isUserExists(studentData.id)) {
  //   throw new Error('User already exists!');
  // }
  // const result = await student.save(); // built in instance method.
  return result;
};

const getAllStudentsFromBD = async () => {
  const result = await Student.find();
  return result;
};

const getSingleStudentFromBD = async (id: string) => {
  // const result = await Student.findOne({ id });
  const result = await Student.aggregate([{ $match: { id } }]);
  return result;
};
const deleteStudentFromBD = async (id: string) => {
  const result = await Student.updateOne({ id }, { isDeleted: true });
  return result;
};

export const StudentServices = {
  createStudentIntoDB,
  getAllStudentsFromBD,
  getSingleStudentFromBD,
  deleteStudentFromBD,
};
