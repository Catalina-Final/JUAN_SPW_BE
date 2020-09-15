const {
  sendResponse,
  catchAsync,
  AppError,
} = require("../helpers/utils.helper");
const Event = require("../models/event");
const EventType = require("../models/eventType");
const eventController = {};

eventController.getEvents = catchAsync(async (req, res, next) => {
  // begin filter query
  let filter = { ...req.query.filter };

  // end

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 9;
  const totalEvents = await Event.find(filter).countDocuments();
  const totalPages = Math.ceil(totalEvents / limit);
  const offset = limit * (page - 1);

  // begin  sorting query
  const sortBy = req.query.sortBy || {};
  if (!sortBy.createdAt) {
    sortBy.createdAt = 1;
  }

  console.log(sortBy);
  // end

  const events = await Event.find(filter)
    .sort(sortBy)
    .skip(offset)
    .limit(limit)
    .populate("author");

  return sendResponse(
    res,
    200,
    true,
    { events, totalPages, totalResults: totalEvents },
    null,
    ""
  );
});

eventController.getSingleEvent = catchAsync(async (req, res, next) => {
  const event = await Event.findById(req.params.id);
  if (!event) return next(new Error("Event not Found"));

  return sendResponse(res, 200, true, event, null, null);
});

// Create new event
eventController.createNewEvent = catchAsync(async (req, res, next) => {
  const author = req.userId;
  const { title, content, tags, images, eventType } = req.body;
  const event = await Event.create({
    title,
    content,
    author,
    tags,
    images,
    eventType,
  });

  return sendResponse(
    res,
    200,
    true,
    event,
    null,
    "Creat a new event successfuly"
  );
});

eventController.updateSingleEvent = catchAsync(async (req, res, next) => {
  const author = req.userId;
  const eventId = req.params.id;
  const { title, content, eventType } = req.body;

  const event = await Event.findOneAndUpdate(
    { _id: eventId, author: author },
    { title, content, eventType },
    { new: true }
  );

  if (!event) return next(new Error("Event not found or User not authorize"));
  return sendResponse(res, 200, true, event, null, "Update Successful");
});

eventController.deleteSingleEvent = catchAsync(async (req, res, next) => {
  const author = req.userId;
  const eventId = req.params.id;

  const event = await Event.findOneAndUpdate(
    { _id: eventId, author: author },
    { isDeleted: true },
    { new: true }
  );

  if (!event) return next(new Error("Event not found or User not authorize"));
  return sendResponse(res, 204, true, null, null, "Delete Successful");
});

// Get event types
eventController.getTypes = catchAsync(async (req, res, next) => {
  const types = await EventType.find({}, "type");

  return sendResponse(res, 200, true, eventType, null, null);
});

module.exports = eventController;
