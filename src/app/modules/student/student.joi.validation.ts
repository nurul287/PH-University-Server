import Joi from 'Joi';

const userNameValidationSchema = Joi.object({
  firstName: Joi.string()
    .required()
    .max(20)
    .trim()
    .regex(/^[A-Z][a-z]*$/, { name: 'capitalized' })
    .message(
      '{#label} must start with an uppercase letter and only contain letters',
    ),
  middleName: Joi.string().trim(),
  lastName: Joi.string()
    .required()
    .trim()
    .regex(/^[A-Za-z]+$/, { name: 'alphabetical' })
    .message('{#label} must only contain letters'),
});

const guardianValidationSchema = Joi.object({
  fatherName: Joi.string().required().trim(),
  fatherOccupation: Joi.string().required().trim(),
  fatherContactNo: Joi.string().required().trim(),

  motherName: Joi.string().required().trim(),
  motherOccupation: Joi.string().required().trim(),
  motherContactNo: Joi.string().required().trim(),
});

const localGuardianValidationSchema = Joi.object({
  name: Joi.string().required().trim(),
  occupation: Joi.string().required().trim(),
  contactNo: Joi.string().required().trim(),
  address: Joi.string().required().trim(),
});

const studentValidationSchema = Joi.object({
  id: Joi.string().required().trim(),
  name: userNameValidationSchema.required(),
  gender: Joi.string().valid('female', 'male', 'other').required(),
  dateOfBirth: Joi.string().trim(),
  email: Joi.string().email().required().trim(),
  contactNo: Joi.string().required().trim(),
  emergencyContactNo: Joi.string().required().trim(),
  bloodGroup: Joi.string()
    .valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')
    .trim(),
  presentAddress: Joi.string().required().trim(),
  permanentAddress: Joi.string().required().trim(),
  guardian: guardianValidationSchema.required(),
  localGuardian: localGuardianValidationSchema.required(),
  profileImg: Joi.string().trim(),
  isActive: Joi.string().valid('active', 'block').default('active'),
  isDeleted: Joi.boolean().default(false),
});

export default studentValidationSchema;
