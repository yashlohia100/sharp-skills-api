import Course from '../models/courseModel.mjs';
import Purchase from '../models/purchaseModel.mjs';
import Review from '../models/reviewModel.mjs';
import ApiFeatures from '../utils/apiFeatures.mjs';
import AppError from '../utils/appError.mjs';
import catchAsync from '../utils/catchAsync.mjs';

export const selectFieldsInQuery = (req, res, next) => {
  req.query.fields =
    'title price instructor thumbnail ratingsQuantity ratingsAverage tags';
  req.query.sort = '_id';
  next();
};

export const getAllCourses = catchAsync(async (req, res) => {
  const query = Course.find();
  const apiFeaturesObj = new ApiFeatures(query, req.query)
    .filter()
    .sort()
    .selectFields()
    .paginate();
  const courses = await apiFeaturesObj.query;
  // const courses = await apiFeaturesObj.query.populate('instructor');

  // const courses = await Course.find();

  res.status(200).json({
    status: 'success',
    numResults: courses.length,
    data: {
      courses,
    },
  });
});

export const getCourse = catchAsync(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate('reviews');

  if (!course) {
    return next(new AppError('No course found with that id', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      course,
    },
  });
});

export const getCourseMaterial = catchAsync(async (req, res, next) => {
  const course = await Course.findById(req.params.courseId);

  if (!course) {
    return next(new AppError('No course found with that id', 404));
  }

  const purchase = await Purchase.findOne({
    course: req.params.courseId,
    user: req.user.id,
  });

  if (!purchase) {
    return next(
      new AppError('No purchase found for this course by this user', 404)
    );
  }

  const review = await Review.findOne({
    course: req.params.courseId,
    user: req.user.id,
  });

  res.status(200).json({
    status: 'success',
    data: {
      course,
      purchase,
      review,
    },
  });
});

export const createCourse = catchAsync(async (req, res) => {
  const newCourse = await Course.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      newCourse,
    },
  });
});

export const updateCourse = catchAsync(async (req, res, next) => {
  const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    runValidators: true,
    new: true,
  });

  if (!course) {
    return next(new AppError('No course found with that id', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      course,
    },
  });
});

export const deleteCourse = catchAsync(async (req, res, next) => {
  const course = await Course.findByIdAndDelete(req.params.id);

  if (!course) {
    return next(new AppError('No course found with that id', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      course,
    },
  });
});
