import httpStatus from 'http-status';
import { model, Schema } from 'mongoose';
import AppError from '../../errors/AppError';
import {
  AcademicSemesterCode,
  AcademicSemesterName,
  Months,
} from './academicSemester.constant';
import { TAcademicSemester } from './academicSemester.interface';

const academicSemesterSchema = new Schema<TAcademicSemester>(
  {
    name: {
      type: String,
      required: true,
      enum: AcademicSemesterName,
    },
    year: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
      enum: AcademicSemesterCode,
    },
    startMonth: {
      type: String,
      enum: Months,
      required: true,
    },
    endMonth: {
      type: String,
      enum: Months,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

academicSemesterSchema.pre('save', async function (next) {
  const isSemesterExists = await AcademicSemester.find({
    name: this.name,
    year: this.year,
  });
  if (isSemesterExists.length > 0) {
    throw new AppError(httpStatus.NOT_FOUND, 'Semester is already exists!');
  }
  next();
});

academicSemesterSchema.pre('findOneAndUpdate', async function (next) {
  const query = this.getQuery();
  const isSemesterExists = await AcademicSemester.findOne(query);
  if (!isSemesterExists) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'This academic semester does not exist!',
    );
  }
  next();
});

export const AcademicSemester = model<TAcademicSemester>(
  'AcademicSemester',
  academicSemesterSchema,
);
