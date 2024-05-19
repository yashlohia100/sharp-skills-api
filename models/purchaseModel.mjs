import mongoose from 'mongoose';
import Course from './courseModel.mjs';

const purchaseSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'A purchase must belong to a course'],
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'A purchase must belong to a user'],
  },

  price: {
    type: Number,
    required: [true, 'A purchase must have a price'],
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

purchaseSchema.index({ course: 1, user: 1 }, { unique: true });

purchaseSchema.pre(/^find/, function (next) {
  // this.populate('course', 'title');
  this.populate(
    'course',
    'title price instructor thumbnail ratingsQuantity ratingsAverage tags'
  );
  this.populate('user', 'name');
  next();
});

purchaseSchema.statics.calcStudentsEnrolled = async function (courseId) {
  const stats = await this.aggregate([
    {
      $match: { course: courseId },
    },
    {
      $group: {
        _id: 'course',
        numRecords: { $sum: 1 },
      },
    },
  ]);

  await Course.findByIdAndUpdate(courseId, {
    studentsEnrolled: stats[0].numRecords,
  });
};

purchaseSchema.post('save', async function (doc) {
  await doc.constructor.calcStudentsEnrolled(doc.course);
});

const Purchase = mongoose.model('Purchase', purchaseSchema);
export default Purchase;
