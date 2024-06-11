const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.signUp = catchAsync(async (req, res, next) => {
  const { firstName, lastName, email, password, confirmPassword } = req.body;
  const user = await User.create({
    firstName,
    lastName,
    email,
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

  res.status(200).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
});
