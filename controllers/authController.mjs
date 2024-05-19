import { promisify } from 'util';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.mjs';
import AppError from '../utils/appError.mjs';
import catchAsync from '../utils/catchAsync.mjs';
import config from '../config.mjs';
import createAndSendEmail from '../utils/email.mjs';

async function getToken(id) {
  const jwtSignPromise = promisify(jwt.sign);
  const token = await jwtSignPromise({ id }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN,
  });
  return token;
}

async function createSendToken(statusCode, user, res) {
  const token = await getToken(user.id);

  const cookieOptions = {
    maxAge: config.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    cookieOptions.sameSite = 'none';
    cookieOptions.secure = true;
  }

  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
}

export const signup = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm } = req.body;

  if (password !== passwordConfirm) {
    return next(new AppError('Passwords do not match', 400));
  }

  const user = {
    name,
    email,
    password,
  };

  const newUser = await User.create(user);

  await createSendToken(201, newUser, res);
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  const user = await User.findOne({ email: email });
  if (!user) {
    return next(new AppError('No user exists with that email', 404));
  }

  const isCorrect = await user.checkPassword(password);
  if (!isCorrect) {
    return next(new AppError('Password is not correct', 401));
  }

  await createSendToken(200, user, res);
});

export const logout = (req, res) => {
  const cookieOptions = {
    expires: new Date(Date.now() - 10 * 1000),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    cookieOptions.sameSite = 'none';
    cookieOptions.secure = true;
  }

  // Send a past cookie with same name
  res.cookie('jwt', 'loggedout', cookieOptions);

  res.status(200).json({
    status: 'success',
  });
};

export const protect = catchAsync(async (req, res, next) => {
  let token = undefined;
  const tokenString = req.headers.authorization;

  console.log(req.cookies);

  if (tokenString && tokenString.startsWith('Bearer')) {
    token = tokenString.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  } else {
    return next(
      new AppError('You are not logged in. Please log in to get access', 401)
    );
  }

  const jwtVerifyPromise = promisify(jwt.verify);
  const decoded = await jwtVerifyPromise(token, config.JWT_SECRET);

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token no longer exists', 401)
    );
  }

  console.log(currentUser);
  req.user = currentUser;
  next();
});

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    next();
  };
};

export const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return next(new AppError('Please provide email', 400));
  }

  const user = await User.findOne({ email: email });
  if (!user) {
    return next(new AppError('No user exists with that email', 404));
  }

  const resetToken = user.createPasswordResetToken();
  await user.save();

  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/auth/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your 'newPassword' and 'passwordConfirm' field to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    // Send email
    await createAndSendEmail({
      to: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message,
    });

    res.status(200).json({
      status: 'success',
      // resetToken,
      message: 'Token sent to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return next(
      new AppError(
        'There was an error sending the email. Try again later!',
        500
      )
    );
  }
});

export const resetPassword = catchAsync(async (req, res, next) => {
  const resetToken = req.params.token;

  // Check if reset token is present
  // if (!resetToken) {
  //   return next(new AppError('Please provide reset token', 400));
  // }

  // Get user based on token
  const resetTokenHashed = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: resetTokenHashed,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Token in invalid or has expired', 400));
  }

  // Check if passwords are provided
  if (!req.body.newPassword || !req.body.passwordConfirm) {
    return next(
      new AppError('Please provide newPassword and passwordConfirm', 400)
    );
  }

  // Check if passwords match
  if (req.body.newPassword !== req.body.passwordConfirm) {
    return next(new AppError('Passwords do not match', 400));
  }

  // Update user password
  user.password = req.body.newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // Update passwordChangedAt property
  // In middleware

  // Log the user in
  createSendToken(200, user, res);
});

export const updatePassword = catchAsync(async (req, res, next) => {
  // Check if passwords are provided
  if (
    !req.body.currentPassword ||
    !req.body.newPassword ||
    !req.body.passwordConfirm
  ) {
    return next(
      new AppError(
        'Please provide currentPassword, newPassword and passwordConfirm',
        400
      )
    );
  }

  // Check if passwords match
  if (req.body.newPassword !== req.body.passwordConfirm) {
    return next(new AppError('Passwords do not match', 400));
  }

  // Get the user based on currently logged in user
  const user = await User.findById(req.user.id);

  // Check if provided password is correct
  const isCorrect = await user.checkPassword(req.body.currentPassword);
  if (!isCorrect) {
    return next(new AppError('Your current password is wrong', 401));
  }

  // Update user password
  user.password = req.body.newPassword;
  await user.save();

  // Update passwordChangedAt property
  // In middleware

  // Log the user in
  await createSendToken(200, user, res);
});
