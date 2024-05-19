import { Router } from 'express';
import * as purchaseController from '../controllers/purchaseController.mjs';
import * as authController from '../controllers/authController.mjs';

const purchaseRouter = Router({ mergeParams: true });

purchaseRouter.use(authController.protect);

purchaseRouter
  .route('/')
  .get(authController.restrictTo('user'), purchaseController.getAllPurchases)
  .post(
    authController.restrictTo('user'),
    purchaseController.setCourseUserIds,
    purchaseController.createPurchase
  );

purchaseRouter.use(authController.restrictTo('admin'));

purchaseRouter.route('/:id').get(purchaseController.getPurchase);

export default purchaseRouter;
