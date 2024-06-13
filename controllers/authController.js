const { promisify } = require("util");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const Email = require("../utils/email");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createTokenResponseBody = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expiresIn: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    dob,
    addressLine1,
    city,
    province,
    postalCode,
    password,
    confirmPassword,
  } = req.body;
  const user = await User.create({
    firstName,
    lastName,
    email,
    phone,
    dob,
    addressLine1,
    city,
    province,
    postalCode,
    password,
    confirmPassword,
  });

  res.status(201).json({
    status: "success",
    data: {
      user,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  if (!req.body.email || !req.body.password)
    return next(new AppError("email and password are required field", 400));
  const user = await User.findOne({ email: req.body.email }).select(
    "+password"
  );

  if (!user || !(await user.verifyPassword(req.body.password, user.password)))
    return next(new AppError("Incorrect email or password", 400));

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  user.password = undefined;

  res.status(200).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1.Check if token exist
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) return next(new AppError("No token provided", 401));

  // 2. Verify Token
  const decoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET_KEY
  );

  // 3. Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser)
    return next(
      new AppError("The user belonging to this token does no longer exist", 401)
    );

  // 4. Check if user changed their password after token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password. Please log in again", 401)
    );
  }

  // Grant access to protected route
  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1. Get user based on email
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return next(new AppError("There is no user with that email address", 404));

  // 2. Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  // Update user's passwordResetToken and passwordResetExpires fields
  // Turn off the validation before saving.
  await user.save({ validateBeforeSave: false });

  // 3. Send it to user's email

  try {
    const resetURL = `localhost:4200/reset-password/${resetToken}`;

    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

    await sendEmail({
      email: user.email,
      subject: "Your password reset token (Valid for 10 min)",
      message,
    });

    res.status(200).json({
      status: "success",
      message: "Token sent to email",
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save({ validateBeforeSave: false });

    return next(
      new AppError("There was an error sending the email. Try again later"),
      500
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1. Get User based on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) return next(new AppError("Token is invalid or has expired", 400));

  // 2. If token has not expired, and there is user, set the new password
  const { password, confirmPassword } = req.body;
  user.password = password;
  user.confirmPassword = confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3. Update changedPasswordAt for the user --> done in user model middleware.

  // 4. Log the user in, send jwt
  createTokenResponseBody(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  // 1. get user from collection
  const user = await User.findById(req.user.id).select("+password");
  // 2. checkif poster current password is correct
  if (!(await user.correctPassword(oldPassword, user.password))) {
    return next(new AppError("Your current password is wrong", 401));
  }
  // 3.if so update password
  user.password = newPassword;
  user.confirmPassword = newPassword;
  await user.save();
  // 4. log user in, send jwt
  createTokenResponseBody(user, 200, res);
});
