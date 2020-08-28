var express = require("express");
var router = express.Router();

// User API
const userApi = require("./userApi");
router.use("/users", userApi);

//authApi
const authApi = require("./authApi");
router.use("/auth", authApi);

//blogApi
const blogApi = require("./blogApi");
router.use("/blogs", blogApi);
module.exports = router;

//reviewApi
const reviewApi = require("./reviewApi");
router.use("/reviews", reviewApi);
module.exports = router;

//reactionApi
const reactionApi = require("./reactionApi");
router.use("/reactions", reactionApi);
module.exports = router;

module.exports = router;
