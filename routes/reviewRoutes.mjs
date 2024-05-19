import { Router } from 'express';
import * as reviewController from '../controllers/reviewController.mjs';
import * as authController from '../controllers/authController.mjs';

const reviewRouter = Router({ mergeParams: true });

reviewRouter
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    reviewController.setCourseUserIds,
    reviewController.checkPurchase,
    reviewController.createReview
  );

reviewRouter
  .route('/:id')
  .get(reviewController.getReview)
  .patch(reviewController.updateReview)
  .delete(reviewController.deleteReview);

reviewRouter.get(
  '/:courseId/user',
  authController.protect,
  reviewController.getReviewByCourseIdAndUserId
);

export default reviewRouter;
