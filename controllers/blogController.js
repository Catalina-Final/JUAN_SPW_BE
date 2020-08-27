const utilsHelper = require("../helpers/utils.helper");
const Blog = require("../models/blog");
const blogController = {};

blogController.getBlogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const totalBlogs = await Blog.countDocuments();
    const totalPages = Math.ceil(totalBlogs / limit);
    const offset = limit * (page - 1);

    const blogs = await Blog.find()
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit();
    return utilsHelper.sendResponse(
      res,
      200,
      true,
      { blogs, totalPages },
      null,
      ""
    );
  } catch (error) {
    next(error);
  }
};

blogController.getSingleBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return next(new Error("Blog not Found"));

    return utilsHelper.sendResponse(res, 200, true, blog, null, null);
  } catch (error) {
    next(error);
  }
};
module.exports = blogController;
