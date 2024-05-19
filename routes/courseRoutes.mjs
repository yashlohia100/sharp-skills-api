import { Router } from 'express';
import * as courseController from '../controllers/courseController.mjs';
import * as authController from '../controllers/authController.mjs';
import purchaseRouter from './purchaseRoutes.mjs';
import reviewRouter from './reviewRoutes.mjs';

const courseRouter = Router();

// POST /courses/a001/purchases
// GET /courses/a001/purchases

courseRouter.use('/:courseId/purchases', purchaseRouter);

// POST /courses/a001/reviews
// GET /courses/a001/reviews

courseRouter.use('/:courseId/reviews', reviewRouter);

// GET /api/courses/:courseId/learn

courseRouter.get(
  '/:courseId/learn',
  authController.protect,
  courseController.getCourseMaterial
);

courseRouter
  .route('/')
  .get(courseController.selectFieldsInQuery, courseController.getAllCourses)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'instructor'),
    courseController.createCourse
  );

courseRouter
  .route('/:id')
  .get(courseController.getCourse)
  // .get(authController.protect, courseController.getCourse)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'instructor'),
    courseController.updateCourse
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'instructor'),
    courseController.deleteCourse
  );

export default courseRouter;
