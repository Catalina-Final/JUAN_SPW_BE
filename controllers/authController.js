const {
  sendResponse,
  catchAsync,
  AppError,
} = require("../helpers/utils.helper");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const authController = {};

authController.loginWithEmail = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return next(new Error("Invalid credentials"));

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return next(new Error("Wrong password"));

  accessToken = await user.generateToken();
  return sendResponse(
    res,
    200,
    true,
    { user, accessToken },
    null,
    "Login Successful"
  );
});
module.exports = authController;
