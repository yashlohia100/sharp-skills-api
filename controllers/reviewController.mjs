import Purchase from '../models/purchaseModel.mjs';
import Review from '../models/reviewModel.mjs';
import AppError from '../utils/appError.mjs';
import catchAsync from '../utils/catchAsync.mjs';

export const getAllReviews = catchAsync(async (req, res) => {
  let filterObj = {};
  if (req.params.courseId) {
    filterObj = { course: req.params.courseId };
  }

  if (req.params.userId) {
    filterObj = { ...filterObj, user: req.params.userId };
  }

  const reviews = await Review.find(filterObj);

  res.status(200).json({
    status: 'success',
    numResults: reviews.length,
    data: {
      reviews,
    },
  });
});

export const getReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new AppError('No review found with that id', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      review,
    },
  });
});

export const setCourseUserIds = (req, res, next) => {
  if (!req.body.course) {
    req.body.course = req.params.courseId;
  }

  if (!req.body.user) {
    req.body.user = req.user.id;
  }

  next();
};

export const checkPurchase = catchAsync(async (req, res, next) => {
  const purchase = await Purchase.findOne({
    course: req.body.course,
    user: req.body.user,
  });

  if (!purchase) {
    return next(
      new AppError('Review can only be posted to a purchased course', 400)
    );
  }

  next();
});

export const createReview = catchAsync(async (req, res) => {
  const newReview = await Review.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      newReview,
    },
  });
});

export const updateReview = catchAsync(async (req, res, next) => {
  const review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    runValidators: true,
    new: true,
  });

  if (!review) {
    return next(new AppError('No review found with that id', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      review,
    },
  });
});

export const deleteReview = catchAsync(async (req, res, next) => {
  const review = await Review.findByIdAndDelete(req.params.id);

  if (!review) {
    return next(new AppError('No review found with that id', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      review,
    },
  });
});

export const getReviewByCourseIdAndUserId = catchAsync(
  async (req, res, next) => {
    const review = await Review.findOne({
      course: req.params.courseId,
      user: req.user.id,
    });

    res.status(200).json({
      status: 'success',
      data: {
        review,
      },
    });
  }
);
