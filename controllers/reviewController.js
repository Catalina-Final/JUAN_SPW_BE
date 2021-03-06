const {
  sendResponse,
  catchAsync,
  AppError,
} = require("../helpers/utils.helper");
const Review = require("../models/review");
const reviewController = {};

reviewController.createNewReview = catchAsync(async (req, res, next) => {
  const userId = req.userId;
  const blogId = req.params.blogId;
  const { content } = req.body;
  let review = await Review.create({
    user: userId,
    blog: blogId,
    content,
  });
  review = await review.populate("user").execPopulate();
  return sendResponse(
    res,
    200,
    true,
    review,
    null,
    "Create a new review successfuly"
  );
});

reviewController.getReviewsOfBlog = catchAsync(async (req, res, next) => {
  const blogId = req.params.blogId;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const totalReviews = await Review.estimatedDocumentCount();
  const totalPages = Math.ceil(totalReviews / limit);
  const offset = limit * (page - 1);

  const reviews = await Review.find({ blog: blogId })
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit()
    .populate("user");
  return sendResponse(res, 200, true, { reviews, totalPages }, null, "");
});

// reviewController.deleteSingleReview = catchAsync(async (req, res, next) => {
//   const userId = req.userId;
//   const reviewId = req.params.id;

//   const review = await Review.findOneAndDelete({
//     _id: reviewId,
//     user: userId,
//   });
//   if (!review)
//     return next(
//       new AppError(
//         400,
//         "Review not found or User not authorized",
//         "Delete Review Error"
//       )
//     );
//   return sendResponse(res, 200, true, null, null, "Delete successful");
// });

reviewController.updateSingleReview = catchAsync(async (req, res, next) => {
  const userId = req.userId;
  const reviewId = req.params.id;
  const { content } = req.body;

  const review = await Review.findOneAndUpdate(
    { _id: reviewId, user: userId },
    { content },
    { new: true }
  );

  if (!review)
    return next(new Error("Review not found or User not authorized"));
  return sendResponse(res, 200, true, review, null, "Update Successful");
});

reviewController.deleteSingleReview = catchAsync(async (req, res, next) => {
  const userId = req.userId;
  const reviewId = req.params.id;

  const review = await Review.findOneAndDelete({
    _id: reviewId,
    user: userId,
  });

  if (!review) return next(new Error("review not found or User not authorize"));
  return sendResponse(res, 200, true, null, null, "Delete Successful");
});

module.exports = reviewController;
