import crypto from 'crypto';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'User name not provided'],
  },

  email: {
    type: String,
    required: [true, 'User email not provided'],
    unique: true,
  },

  password: {
    type: String,
    required: [true, 'User password not provided'],
  },

  role: {
    type: String,
    default: 'user',
    enum: ['admin', 'instructor', 'user'],
  },

  photo: {
    type: String,
    default: 'default-user.jpg',
  },

  about: {
    type: String,
    default: 'No about specified',
    maxlength: 3000,
    trim: true,
  },

  // passwordConfirm: {
  //   type: String,
  //   required: [true, 'User passwordConfirm not provided'],
  // },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
});

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

userSchema.pre('save', async function (next) {
  if (this.isModified('password') && !this.isNew) {
    this.passwordChangedAt = Date.now();
  }
  next();
});

userSchema.methods.checkPassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  const resetTokenHashed = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetToken = resetTokenHashed;
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);
export default User;
