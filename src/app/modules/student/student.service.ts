import { Student } from './student.model';

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
  getAllStudentsFromBD,
  getSingleStudentFromBD,
  deleteStudentFromBD,
};
