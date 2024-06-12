const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "firstName is a required field."],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, "lastName is a required field."],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "email is a required field."],
    unique: true,
    lowercase: true,
    validate: [
      validator.isEmail,
      "Please enter a valid email. Ex: abc@gmail.com",
    ],
  },
  dob: {
    type: Date,
    required: [true, "dob is a required field."],
  },
  phone: {
    type: String,
    required: [true, "phone is a required field."],
    minLength: [10, "phone number should be 10 digits"],
    maxLength: [10, "phone number should be 10 digits"],
  },
  password: {
    type: String,
    required: [true, "password is a required field."],
    select: false,
  },
  confirmPassword: {
    type: String,
    required: [true, "confirmPassword is a required field."],
    validate: {
      validator: function (val) {
        return val === this.password;
      },
      message: "password and confirmPassword field doesn't match",
    },
  },
  role: {
    type: String,
    enum: {
      values: ["admin", "user"],
      message: "role must be either admin or user",
    },
    default: "user",
  },
  active: {
    type: Boolean,
    default: true,
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});

userSchema.methods.verifyPassword = async function (
  reqBodyPassword,
  userPassword
) {
  return await bcrypt.compare(reqBodyPassword, userPassword);
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 30 * 1000;

  return resetToken;
};

userSchema.methods.changedPasswordAfter = function (jwtTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    //pw was changed then returns true or else false
    return jwtTimestamp < changedTimestamp;
  }
  //pw not changed
  return false;
};

userSchema.methods.correctPassword = async function (
  reqBodyPassword,
  userPassowrd
) {
  return await bcrypt.compare(reqBodyPassword, userPassowrd);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
