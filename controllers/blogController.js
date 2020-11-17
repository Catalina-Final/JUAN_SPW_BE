const {
  sendResponse,
  catchAsync,
  AppError,
} = require("../helpers/utils.helper");
const Blog = require("../models/blog");
const Review = require("../models/review");
const blogController = {};

blogController.getBlogs = catchAsync(async (req, res, next) => {
  // begin filter query
  let filter = { ...req.query.filter };

  // end

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const totalBlogs = await Blog.find(filter).estimatedDocumentCount();
  const totalPages = Math.ceil(totalBlogs / limit);
  const offset = limit * (page - 1);

  // begin  sorting query
  const sortBy = req.query.sortBy || {};
  if (!sortBy.createdAt) {
    sortBy.createdAt = 1;
  }

  console.log(sortBy);
  // end

  const blogs = await Blog.find(filter)
    .sort({ ...sortBy, createdAt: -1 })
    .skip(offset)
    .limit(limit)
    .populate("author");

  return sendResponse(
    res,
    200,
    true,
    { blogs, totalPages, totalResults: totalBlogs },
    null,
    ""
  );
});

blogController.getBlogsPerUser = catchAsync(async (req, res, next) => {
  const userId = req.params.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  let filter = { ...req.query.filter };

  const totalBlogs = await Blog.find({
    ...filter,
    author: req.userId,
  }).estimatedDocumentCount();
  const totalPages = Math.ceil(totalBlogs / limit);
  const offset = limit * (page - 1);

  // begin  sorting query
  const sortBy = req.query.sortBy || {};
  if (!sortBy.createdAt) {
    sortBy.createdAt = 1;
  }
  console.log(sortBy);
  // end

  const blogs = await Blog.find({ ...filter, author: req.userId })
    .sort(sortBy)
    .skip(offset)
    .limit(limit)
    .populate("author")
    .populate("type");

  return sendResponse(
    res,
    200,
    true,
    { blogs, totalPages, totalResults: totalBlogs },
    null,
    ""
  );
});

blogController.getSingleBlog = catchAsync(async (req, res, next) => {
  const blog = await Blog.findById(req.params.id).populate("author");
  if (!blog) return next(new Error("Blog not Found"));

  return sendResponse(res, 200, true, blog, null, null);
});

blogController.createNewBlog = catchAsync(async (req, res, next) => {
  const author = req.userId;
  const { title, content, tags, images } = req.body;
  const blog = await Blog.create({ title, content, author, tags, images });

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
