const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

exports.signUp = async (req, res, next) => {
  try {
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
  } catch (error) {
    res.status(400).json({
      status: "fail",
      error,
    });
  }
};

exports.login = async (req, res, next) => {
  try {
    if (!req.body.email || !req.body.password)
      throw new Error("email and password are required field");
    const user = await User.findOne({ email: req.body.email }).select('+password');

    if (!user || !(await user.verifyPassword(req.body.password, user.password)))
      throw new Error("Incorrect email or password");

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
  } catch (error) {
    res.status(400).json({
      status: "fail",
      error,
    });
  }
};
