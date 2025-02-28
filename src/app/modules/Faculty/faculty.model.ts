import { Schema, model } from 'mongoose';
import validator from 'validator';
import { TFaculty, TFacultyModel, TUserName } from './faculty.interface';

const userNameSchema = new Schema<TUserName>({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    maxlength: [20, 'First Name cannot be more than 20 characters'],
    trim: true,
    validate: {
      validator: function (value: string) {
        const firstNameStr = value.charAt(0).toUpperCase() + value.slice(1);
        return value === firstNameStr;
      },
      message: '{VALUE} is not in capitalize format',
    },
  },
  middleName: {
    type: String,
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    validate: {
      validator: function (value: string) {
        return validator.isAlpha(value);
      },
      message: '{VALUE} is not valid',
    },
  },
});

const facultySchema = new Schema<TFaculty, TFacultyModel>(
  {
    id: {
      type: String,
      required: [true, 'Student ID is required'],
      unique: true,
      trim: true,
    },
    designation: {
      type: String,
      required: [true, 'Designation is required'],
    },
    user: {
      type: Schema.Types.ObjectId,
      required: [true, 'User id is required'],
      unique: true,
      ref: 'User',
    },
    name: {
      type: userNameSchema,
      required: [true, 'TStudent name is required'],
    },
    gender: {
      type: String,
      enum: {
        values: ['female', 'male', 'other'],
        message: '{VALUE} is not valid',
      },
      required: [true, 'Gender is required'],
    },
    dateOfBirth: { type: Date, trim: true },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
    },
    contactNo: {
      type: String,
      required: [true, 'Contact number is required'],
      trim: true,
    },
    emergencyContactNo: {
      type: String,
      required: [true, 'Emergency contact number is required'],
      trim: true,
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'o-'],
    },
    presentAddress: {
      type: String,
      required: [true, 'Present address is required'],
      trim: true,
    },
    permanentAddress: {
      type: String,
      required: [true, 'Permanent address is required'],
      trim: true,
    },
    profileImg: { type: String, default: '', trim: true },
    academicDepartment: {
      type: Schema.Types.ObjectId,
      required: [true, 'Academic Department is required'],
      ref: 'AcademicDepartment',
    },
    academicFaculty: {
      type: Schema.Types.ObjectId,
      required: [true, 'Academic Faculty is required'],
      ref: 'AcademicFaculty',
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: {
      virtuals: true,
    },
  },
);

// Virtual data
facultySchema.virtual('fullName').get(function () {
  return `${this?.name?.firstName} ${this?.name?.middleName} ${this?.name?.lastName}`;
});

// Query Middleware
facultySchema.pre('find', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});
facultySchema.pre('findOne', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});
facultySchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
  next();
});

// creating a custom static method

facultySchema.statics.isUserExists = async (id: string) => {
  const existingUser = await Faculty.findById(id);
  return existingUser;
};

export const Faculty = model<TFaculty, TFacultyModel>('Faculty', facultySchema);
