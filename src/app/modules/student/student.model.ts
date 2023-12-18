import { Schema, model, connect } from 'mongoose';
import { Student } from './student.interface';

const studentSchema = new Schema<Student>({
  id: { type: String, required: true },
  name: {
    firstName: {
      type: String,
      required: true,
    },
    middleName: {
      type: String,
    },
    lastName: {
      type: String,
      required: true,
    },
  },
  gender: ['female', 'male'],
});
