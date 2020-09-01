const {
  sendResponse,
  catchAsync,
  AppError,
} = require("../helpers/utils.helper");
const Reaction = require("../models/reaction");
const reactionController = {};

reactionController.saveReaction = catchAsync(async (req, res, next) => {
  const { targetType, target, emoji } = req.body;
  // Find the reaction of the current user
  let reaction = await Reaction.findOne({
    targetType,
    target,
    user: req.userId,
  });
  if (!reaction) {
    await Reaction.create({ targetType, target, user: req.userId, emoji });
    return sendResponse(res, 200, true, null, null, "Added reaction");
  } else {
    if (reaction.emoji === emoji) {
      await Reaction.findOneAndDelete({ _id: reaction._id });
      return sendResponse(res, 200, true, null, null, "Removed reaction");
    } else {
      await Reaction.findOneAndUpdate({ _id: reaction._id }, { emoji });
      return sendResponse(res, 200, true, null, null, "Updated reaction");
    }
  }
});

module.exports = reactionController;
