const {
  sendResponse,
  catchAsync,
  AppError,
} = require("../helpers/utils.helper");
const User = require("../models/user");
const Friendship = require("../models/friendship");
const userController = {};
const jwt = require("jsonwebtoken");
const { address } = require("faker");

userController.register = catchAsync(async (req, res, next) => {
  let { name, email, password } = req.body;
  let user = await User.findOne({ email });
  if (user) return next(new Error("User already exist"));
  user = await User.create({
    name,
    email,
    password,
  });

  const accessToken = await user.generateToken();

  return sendResponse(
    res,
    200,
    true,
    { user, accessToken },
    null,
    "User succesfully created"
  );
});

userController.getCurrentUser = catchAsync(async (req, res, next) => {
  const userId = req.userId;
  const user = await User.findById(userId);
  return sendResponse(
    res,
    200,
    true,
    { user },
    null,
    "Get current user successful"
  );
});

userController.sendFriendRequest = catchAsync(async (req, res, next) => {
  const userId = req.userId; // From
  const toUserId = req.params.id; // To
  let friendship = await Friendship.findOne({ from: userId, to: toUserId });
  if (!friendship) {
    await Friendship.create({
      from: userId,
      to: toUserId,
      status: "requesting",
    });
    return sendResponse(res, 200, true, null, null, "Request has ben sent");
  } else {
    switch (friendship.status) {
      case "requesting":
        return next(new Error("The request has been sent"));
        break;
      case "accepted":
        return next(new Error("Users are already friend"));
        break;
      case "accepted":
      case "decline":
      case "cancel":
        friendship.status = "requesting";
        await friendship.save();
        return sendResponse(
          res,
          200,
          true,
          null,
          null,
          "Request has been sent"
        );
        break;
      default:
        break;
    }
  }
});

userController.acceptFriendRequest = catchAsync(async (req, res, next) => {
  const userId = req.userId; // To
  const fromUserId = req.params.id; // From
  let friendship = await Friendship.findOne({
    from: fromUserId,
    to: userId,
    status: "requesting",
  });
  if (!friendship) return next(new Error("Friend Request not found"));

  friendship.status = "accepted";
  await friendship.save();
  return sendResponse(
    res,
    200,
    true,
    null,
    null,
    "Friend request has been accepted"
  );
});

userController.declineFriendRequest = catchAsync(async (req, res, next) => {
  const userId = req.userId; // To
  const fromUserId = req.params.id; // From
  let friendship = await Friendship.findOne({
    from: fromUserId,
    to: userId,
    status: "requesting",
  });
  if (!friendship) return next(new Error("Request not found"));

  friendship.status = "decline";
  await friendship.save();
  return sendResponse(
    res,
    200,
    true,
    null,
    null,
    "Friend request has been declined"
  );
});

userController.getSentFriendRequestList = catchAsync(async (req, res, next) => {
  const userId = req.userId;
  const requestList = await Friendship.find({
    from: userId,
    status: "requesting",
  }).populate("to");
  return sendResponse(res, 200, true, requestList, null, null);
});

userController.getReceivedFriendRequestList = catchAsync(
  async (req, res, next) => {
    const userId = req.userId;
    const requestList = await Friendship.find({
      to: userId,
      status: "requesting",
    }).populate("from");
    return sendResponse(res, 200, true, requestList, null, null);
  }
);

userController.getFriendList = catchAsync(async (req, res, next) => {
  const userId = req.userId;
  let friendList = await Friendship.find({
    $or: [{ from: userId }, { to: userId }],
    status: "accepted",
  })
    .populate("from")
    .populate("to");
  friendList = friendList.map((friendship) => {
    const friend = {};
    friend.acceptedAt = friendship.updatedAt;
    if (friendship.from._id.equals(userId)) {
      friend.user = friendship.to;
    } else {
      friend.user = friendship.from;
    }
    return friend;
  });
  return sendResponse(res, 200, true, friendList, null, null);
});

userController.cancelFriendRequest = catchAsync(async (req, res, next) => {
  const userId = req.userId; // From
  const toUserId = req.params.id; // To
  let friendship = await Friendship.findOne({
    from: userId,
    to: toUserId,
    status: "requesting",
  });
  if (!friendship) return next(new Error("Request not found"));

  friendship.status = "cancel";
  await friendship.save();
  return sendResponse(
    res,
    200,
    true,
    null,
    null,
    "Friend request has been cancelled"
  );
});

userController.removeFriendship = catchAsync(async (req, res, next) => {
  const userId = req.userId;
  const toBeRemovedUserId = req.params.id;
  let friendship = await Friendship.findOne({
    $or: [
      { from: userId, to: toBeRemovedUserId },
      { from: toBeRemovedUserId, to: userId },
    ],
    status: "accepted",
  });
  if (!friendship) return next(new Error("Friend not found"));

  friendship.status = "removed";
  await friendship.save();
  return sendResponse(
    res,
    200,
    true,
    null,
    null,
    "Friendship has been removed"
  );
});

userController.updateProfile = catchAsync(async (req, res, next) => {
  const userId = req.userId;
  const allows = ["name", "password", "avatarUrl"];
  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError(404, "Account not found", "Update Profile Error"));
  }

  allows.forEach((field) => {
    if (req.body[field] !== undefined) {
      user[field] = req.body[field];
    }
  });
  await user.save();
  return sendResponse(
    res,
    200,
    true,
    user,
    null,
    "Update Profile successfully"
  );
});

userController.forgetPassword = catchAsync(async (req, res, next) => {
  const email = req.params.email;
  if (!email) {
    return next(new Error("Email is required"));
  }
  const user = await User.findOne({ email });
  if (!user) {
    return sendResponse(
      res,
      200,
      true,
      null,
      null,
      "You will recieve an email to registered account"
    );
  }
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: "15m",
  });

  const API_KEY = process.env.MAILGUN_API;
  const DOMAIN = process.env.MAILGUN_DOMAIN;
  const mailgun = require("mailgun-js")({ apiKey: API_KEY, domain: DOMAIN });
  const data = {
    from: "Juan <juank060790@gmail.com>",
    to: user.email,
    subject: "Reset password confirmation",
    html: `click <a href="http://localhost:5000/email/${token}">here</a> to reset password`,
  };
  mailgun.messages().send(data, (error, body) => {
    console.log(body);
    return next(body);
  });

  // send email with token to user email
  return sendResponse(
    res,
    200,
    true,
    null,
    null,
    "You will receive an email in your registered email address"
  );
});

userController.resetPassword = catchAsync(async (req, res, next) => {
  const { token, password } = req.body;
  if (!token || !password)
    return next(new Error("token and password are require"));
  // verify token
  const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);
  // payload._id=userid
  // update password
  const user = await User.findById(payload._id);
  user.password = password;
  await user.save();
  res.send(user);

  // update password
});

module.exports = userController;
