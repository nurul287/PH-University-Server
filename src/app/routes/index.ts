import { Router } from 'express';
import { AcademicSemesterRoutes } from '../modules/academicSemester/academicSemester.route';
import { StudentRoutes } from '../modules/student/student.route';
import { UserRoutes } from '../modules/user/user.router';

const router = Router();

const moduleRoutes = [
  {
    path: '/users',
    route: UserRoutes,
  },
  {
    path: '/students',
    route: StudentRoutes,
  },
  {
    path: '/academic-semesters',
    route: AcademicSemesterRoutes,
  },
];

moduleRoutes.forEach(({ path, route }) => {
  router.use(path, route);
});

export default router;
