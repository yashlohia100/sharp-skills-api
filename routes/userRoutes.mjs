import { Router } from 'express';
import * as userController from '../controllers/userController.mjs';
import * as authController from '../controllers/authController.mjs';
import reviewRouter from './reviewRoutes.mjs';
import purchaseRouter from './purchaseRoutes.mjs';

const userRouter = Router();

// GET /api/users/b001/reviews
userRouter.use('/:userId/reviews', reviewRouter);

// GET /api/users/b001/purchases
userRouter.use('/:userId/purchases', purchaseRouter);

userRouter.use(authController.protect);

userRouter.patch('/updateMe', userController.updateMe);

userRouter.use(authController.restrictTo('admin'));

userRouter
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

userRouter.route('/:id').get(userController.getUser);

export default userRouter;
