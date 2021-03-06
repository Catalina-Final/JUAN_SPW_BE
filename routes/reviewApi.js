const express = require("express");
const router = express.Router({ mergeParams: true });
const reviewController = require("../controllers/reviewController");
const { param, body } = require("express-validator");
const authMiddleware = require("../middlewares/authentication");
const validators = require("../middlewares/validators");

/**
 * @route GET api/reviews/blogs/:id?page=1&limit=10
 * @description Get reviews of a blog with pagination
 * @access Public
 */

//  router.route("/:id")
//  .get()
//  .post()
//  .put()
router.get(
  "/blogs/:blogId",
  validators.validate([
    param("blogId").exists().isString().custom(validators.checkObjectId),
  ]),
  reviewController.getReviewsOfBlog
);

/**
 * @route POST api/reviews/blogs/:id
 * @description Create a new review for a blog
 * @access required
 */
router.post(
  "/blogs/:blogId",
  authMiddleware.loginRequired,
  validators.validate([
    param("blogId").exists().isString().custom(validators.checkObjectId),
    body("content", "missing content").exists().notEmpty(),
  ]),

  reviewController.createNewReview
);

/**
 * @route PUT api/reviews/:id
 * @description Updtae a review
 * @access required
 */
router.put(
  "/:id",
  authMiddleware.loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
    body("content", "missing content").exists().notEmpty(),
  ]),

  reviewController.updateSingleReview
);

/**
 * @route DELETE api/reviews/:id
 * @description Delete a review
 * @access required
 */
router.delete(
  "/:id",
  authMiddleware.loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
  ]),

  reviewController.deleteSingleReview
);

module.exports = router;
