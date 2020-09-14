var express = require("express");
var router = express.Router();

// userApi
const userApi = require("./userApi");
router.use("/users", userApi);

// authApi
const authApi = require("./authApi");
router.use("/auth", authApi);

// reviewApi
const reviewApi = require("./reviewApi");
router.use("/blogs/:blogId/reviews", reviewApi);

// blogApi
const blogApi = require("./blogApi");
router.use("/blogs", blogApi);

// reactionApi
const reactionApi = require("./reactionApi");
router.use("/reactions", reactionApi);

// friendshipApi
const friendshipApi = require("./friendshipApi");
router.use("/friends", friendshipApi);

module.exports = router;
