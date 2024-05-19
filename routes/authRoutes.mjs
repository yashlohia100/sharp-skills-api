import { Router } from 'express';
import * as authController from '../controllers/authController.mjs';

const authRouter = Router();

authRouter.post('/signup', authController.signup);
authRouter.post('/login', authController.login);
authRouter.get('/logout', authController.logout);

authRouter.post('/forgotPassword', authController.forgotPassword);
authRouter.patch('/resetPassword/:token', authController.resetPassword);

authRouter.patch(
  '/updateMyPassword',
  authController.protect,
  authController.updatePassword
);

export default authRouter;
