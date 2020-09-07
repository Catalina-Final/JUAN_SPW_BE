const express = require("express");
const router = express.Router();
const blogController = require("../controllers/blogController");
const { param, body } = require("express-validator");
const authMiddleware = require("../middlewares/authentication");
const validators = require("../middlewares/validators");

/**
 * @route GET api/blogs?page=1&limit=10
 * @description Get blogs with pagination
 * @access Public
 */
router.get("/", blogController.getBlogs);

/**
 * @route GET api/blogs/:id
 * @description Get a single blog
 * @access Public
 */
router.get(
  "/:id",
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
  ]),
  blogController.getSingleBlog
);

/**
 * @route POST api/blogs
 * @description POST a single blog/ Create a new blog
 * @access required
 */
router.post(
  "/",
  authMiddleware.loginRequired,
  validators.validate([
    body("title", "missing Title").exists().notEmpty(),
    body("content", "missing content").exists().notEmpty(),
  ]),

  blogController.createNewBlog
);

/**
 * @route PUT api/blogs/:id
 * @description Updtae a blog
 * @access required
 */
router.put(
  "/:id",
  authMiddleware.loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
    body("title", "missing Title").exists().notEmpty(),
    body("content", "missing content").exists().notEmpty(),
  ]),

  blogController.updateSingleBlog
);

/**
 * @route DELETE api/blogs/:id
 * @description Delete a blog
 * @access required
 */
router.delete(
  "/:id",
  authMiddleware.loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
  ]),

  blogController.deleteSingleBlog
);
module.exports = router;
