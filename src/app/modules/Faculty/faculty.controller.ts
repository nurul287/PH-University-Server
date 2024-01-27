import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { FacultyServices } from './faculty.service';

const getAllFaculties = catchAsync(async (req, res) => {
  const result = await FacultyServices.getAllFacultiesFromBD(req.query);
  sendResponse(res, {
    success: true,
    message: 'Faculties are retrieved successfully',
    data: result,
    statusCode: httpStatus.OK,
  });
});

const getSingleFaculty = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await FacultyServices.getSingleFacultyFromBD(id);
  sendResponse(res, {
    success: true,
    message: 'Faculty is retrieved successfully',
    data: result,
    statusCode: httpStatus.OK,
  });
});

const deleteFaculty = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await FacultyServices.deleteFacultyFromBD(id);
  sendResponse(res, {
    success: true,
    message: 'Faculty is deleted successfully',
    data: result,
    statusCode: httpStatus.OK,
  });
});

const updateFaculty = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { faculty } = req.body;
  const result = await FacultyServices.updateFacultyFromDB(id, faculty);
  sendResponse(res, {
    success: true,
    message: 'Faculty is updated successfully',
    data: result,
    statusCode: httpStatus.OK,
  });
});

export const FacultyControllers = {
  getAllFaculties,
  getSingleFaculty,
  deleteFaculty,
  updateFaculty,
};
