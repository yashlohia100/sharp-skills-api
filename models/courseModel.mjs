import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    // Essential fields
    title: {
      type: String,
      required: [true, 'A course must have a title'],
      unique: true,
    },

    summary: {
      type: String,
      required: [true, 'A course must have a summary'],
    },

    duration: {
      type: Number,
      required: [true, 'A course must have a duration'],
    },

    price: {
      type: Number,
      required: [true, 'A course must have a price'],
    },

    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A course must have an instructor'],
    },

    thumbnail: {
      type: String,
      required: [true, 'A course must have a thumbnail'],
    },

    tags: {
      type: [String],
      required: [true, 'A course must have a tag'],
    },

    // Calculated fields
    ratingsQuantity: {
      type: Number,
      default: 0,
    },

    ratingsAverage: {
      type: Number,
      default: 0,
      min: [0, 'Rating must be greater than or equal to 0'],
      max: [5, 'Rating must be less than or equal to 5.0'],
    },

    studentsEnrolled: {
      type: Number,
      default: 0,
    },

    // Default fields
    articles: {
      type: Number,
      default: 0,
    },

    resources: {
      type: Number,
      default: 0,
    },

    learningPoints: {
      type: [String],
      default: [],
    },

    requirements: {
      type: [String],
      default: [],
    },

    courseFor: {
      type: [String],
      default: [],
    },

    description: {
      type: String,
      default: 'No description specified',
      maxlength: 3000,
      trim: true,
    },

    syllabus: {
      type: [
        {
          sectionTitle: String,
          lectures: [String],
        },
      ],
      default: [],
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// courseSchema.virtual('markPrice').get(function () {
//   return this.price + 2700;
// });

courseSchema.virtual('sellingPrice').get(function () {
  return this.price - 2700;
});

courseSchema.virtual('label').get(function () {
  return this.ratingsAverage > 4.5 ? 'Top rated' : '';
});

courseSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'course',
  localField: '_id',
});

// courseSchema.pre(/^find/, function (next) {
//   this.populate('instructor', 'name about photo');
//   next();
// });

courseSchema.pre('find', function (next) {
  this.populate('instructor', 'name');
  next();
});

courseSchema.pre('findOne', function (next) {
  this.populate('instructor', 'name about photo');
  next();
});

const Course = mongoose.model('Course', courseSchema);
export default Course;
