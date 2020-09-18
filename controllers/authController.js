const {
  sendResponse,
  catchAsync,
  AppError,
} = require("../helpers/utils.helper");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const { default: Axios } = require("axios");
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

authController.loginWithFacebook = catchAsync(async (req, res, next) => {
  const { token } = req.params;
  const { data } = await Axios.get(
    `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${token}`
  );
  console.log("FACEBOOOOK data", data);
  let user = await User.findOne({ email: data.email });

  if (!user) {
    user = await User.create({
      email: data.email,
      name: data.name,
      avatarUrl: data.picture.data.url,
    });
  }

  const accessToken = await user.generateToken();

  return sendResponse(
    res,
    200,
    true,
    { user, accessToken },
    null,
    "Login Successful"
  );
});

authController.loginWithGoogle = catchAsync(async (req, res, next) => {
  const { token } = req.params;
  const { data } = await Axios.get(
    ` https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${token}`
  );
  console.log("GOOOGELEE data", data);
  // const data = response.data;
  let user = await User.findOne({ email: data.email });

  if (!user) {
    user = await User.create({
      email: data.email,
      name: data.name,
      avatarUrl: data.picture,
    });
    console.log("PICTUREE", avatarUrl);
  }

  const accessToken = await user.generateToken();

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
