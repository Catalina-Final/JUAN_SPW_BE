const {
  sendResponse,
  catchAsync,
  AppError,
} = require("../helpers/utils.helper");
const Blog = require("../models/blog");
const blogController = {};

blogController.getBlogs = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const totalBlogs = await Blog.countDocuments();
  const totalPages = Math.ceil(totalBlogs / limit);
  const offset = limit * (page - 1);

  const blogs = await Blog.find().sort({ createdAt: -1 }).skip(offset).limit();
  return sendResponse(res, 200, true, { blogs, totalPages }, null, "");
});

blogController.getSingleBlog = catchAsync(async (req, res, next) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) return next(new Error("Blog not Found"));

  return sendResponse(res, 200, true, blog, null, null);
});

blogController.createNewBlog = catchAsync(async (req, res, next) => {
  const author = req.userId;
  const { title, content } = req.body;
  const blog = await Blog.create({ title, content, author });

  return sendResponse(
    res,
    200,
    true,
    blog,
    null,
    "Creat a new blog successfuly"
  );
});

blogController.updateSingleBlog = catchAsync(async (req, res, next) => {
  const author = req.userId;
  const blogId = req.params.id;
  const { title, content } = req.body;

  const blog = await Blog.findOneAndUpdate(
    { _id: blogId, author: author },
    { title, content },
    { new: true }
  );

  if (!blog) return next(new Error("Blog not found or User not authorize"));
  return sendResponse(res, 200, true, blog, null, "Update Successful");
});

blogController.deleteSingleBlog = catchAsync(async (req, res, next) => {
  const author = req.userId;
  const blogId = req.params.id;

  const blog = await Blog.findOneAndUpdate(
    { _id: blogId, author: author },
    { isDeleted: true },
    { new: true }
  );

  if (!blog) return next(new Error("Blog not found or User not authorize"));
  return sendResponse(res, 204, true, null, null, "Delete Successful");
});
module.exports = blogController;
