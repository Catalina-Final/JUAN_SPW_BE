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
        return next(new Error("The request has already been sent"));
      case "accepted":
        return next(new Error("Users are already friend"));
      case "decline":
      case "cancel":
        // in case declined or cancelled, we're changing it to requesting
        friendship.status = "requesting";
        await friendship.save();
        return sendResponse(res, 200, true, null, null, "Request has ben sent");
      default:
        break;
    }
  }
});
userController.acceptFriendRequest = catchAsync(async (req, res, next) => {
  const userId = req.userId; // To
  const friendshipId = req.params.id; // Friendship id
  console.log("USERID", userId);
  let friendship = await Friendship.findOne({
    _id: friendshipId,
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
    status: "requesting",
    from: userId,
  }).populate("to");
  return sendResponse(res, 200, true, { users: requestList }, null, null);
});

userController.getReceivedFriendRequestList = catchAsync(
  async (req, res, next) => {
    const userId = req.userId;
    const requestList = await Friendship.find({
      to: userId,
      status: "requesting",
    }).populate("from");

    return sendResponse(res, 200, true, { users: requestList }, null, null);
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
    let friend = {};
    friend.acceptedAt = friendship.updatedAt;
    if (friendship.from._id.equals(userId)) {
      friend = friendship.to;
    } else {
      friend = friendship.from;
    }
    return friend;
  });

  return sendResponse(res, 200, true, { users: friendList }, null, null);
});

userController.cancelFriendRequest = catchAsync(async (req, res, next) => {
  const userId = req.userId; // From
  const friendshipId = req.params.id; // frienship id
  let friendship = await Friendship.findOne({
    _id: friendshipId,
    from: userId,
    status: "requesting",
  });
  console.log("FRIENDSHIP", friendship);
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
  const allows = [
    "name",
    "password",
    "avatarUrl",
    "coverUrl",
    "facebook",
    "instagram",
    "portfolioUrl",
  ];
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

// Friendship

userController.getUsers = catchAsync(async (req, res, next) => {
  // begin filter query
  let filter = { ...req.query.filter };

  // end

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const totalUsers = await User.find(filter).estimatedDocumentCount();
  const totalPages = Math.ceil(totalUsers / limit);
  const offset = limit * (page - 1);

  // begin  sorting query
  const sortBy = req.query.sortBy || {};
  if (!sortBy.createdAt) {
    sortBy.createdAt = 1;
  }

  console.log(sortBy);
  // end

  const users = await User.find(filter)
    .sort({ ...sortBy, createdAt: -1 })
    .skip(offset)
    .limit(limit);

  return sendResponse(
    res,
    200,
    true,
    { users, totalPages, totalResults: totalUsers },
    null,
    ""
  );
});

module.exports = userController;
