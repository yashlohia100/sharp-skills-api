import mongoose from 'mongoose';
import Course from './courseModel.mjs';

const reviewSchema = new mongoose.Schema({
  reviewText: {
    type: String,
    required: [true, 'Review cannot be empty'],
  },

  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'A review must belong to a course'],
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'A review must belong to a user'],
  },
});

reviewSchema.index({ course: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  // this.populate('course', 'title');
  this.populate('user', 'name');
  next();
});

reviewSchema.statics.calcAverageRatings = async function (courseId) {
  const stats = await this.aggregate([
    {
      $match: { course: courseId },
    },
    {
      $group: {
        _id: '$course',
        numRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  await Course.findByIdAndUpdate(courseId, {
    ratingsQuantity: stats[0].numRating,
    ratingsAverage: stats[0].avgRating,
  });
};

reviewSchema.post('save', async function (doc) {
  await doc.constructor.calcAverageRatings(doc.course);
});

reviewSchema.post(/^findOneAnd/, async function (doc) {
  await doc.constructor.calcAverageRatings(doc.course);
});

const Review = mongoose.model('Review', reviewSchema);
export default Review;
