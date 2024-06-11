const User = require("../models/userModel");

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

exports.login = (req, res, next) => {};
