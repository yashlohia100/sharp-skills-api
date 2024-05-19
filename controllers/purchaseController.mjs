import Purchase from '../models/purchaseModel.mjs';
import AppError from '../utils/appError.mjs';
import catchAsync from '../utils/catchAsync.mjs';

export const getAllPurchases = catchAsync(async (req, res) => {
  let filterObj = {};
  if (req.params.courseId) {
    filterObj = { course: req.params.courseId };
  }

  if (req.params.userId) {
    filterObj = { ...filterObj, user: req.params.userId };
  }

  const purchases = await Purchase.find(filterObj);

  res.status(200).json({
    status: 'success',
    numResults: purchases.length,
    data: {
      purchases,
    },
  });
});

export const getPurchase = catchAsync(async (req, res, next) => {
  const purchase = await Purchase.findById(req.params.id);

  if (!purchase) {
    return next(new AppError('No purchase found with that id', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      purchase,
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

export const createPurchase = catchAsync(async (req, res) => {
  const newPurchase = await Purchase.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      newPurchase,
    },
  });
});
