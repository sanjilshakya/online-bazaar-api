const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const {
  getAll,
  getOne,
  createOne,
  updateOne,
  deleteOne,
} = require("./handlerFactory");

exports.getUsers = getAll(User);

exports.getUser = getOne(User);

exports.createUser = createOne(User);

exports.updateUser = updateOne(User);

exports.deleteUser = deleteOne(User);

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

filterReqObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.confirmPassword)
    return next(
      new AppError(
        "Password cannot be updated in this route. Please use /change-password route"
      )
    );

  // filter out unwanted fields that are not allowed to be updated.
  const filteredBody = filterReqObj(
    req.body,
    "firstName",
    "lastName",
    "phone",
    "dob",
    "addressLine1",
    "city",
    "province",
    "postalCode"
  );
  if (req.file) filteredBody.photo = req.file.filename;

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(200).json({
    status: "success",
    data: null,
  });
});
