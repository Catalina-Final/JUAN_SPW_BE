const {
  sendResponse,
  catchAsync,
  AppError,
} = require("../helpers/utils.helper");
const Event = require("../models/event");
const EventType = require("../models/eventType");
const moment = require("moment");

const eventController = {};

eventController.getEvents = catchAsync(async (req, res, next) => {
  // begin filter query
  let filter = { ...req.query.filter };

  // end

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 9;
  const totalEvents = await Event.find(filter).estimatedDocumentCount();
  const totalPages = Math.ceil(totalEvents / limit);
  const offset = limit * (page - 1);

  // begin  sorting query
  const sortBy = req.query.sortBy || {};
  if (!sortBy.createdAt) {
    sortBy.createdAt = -1;
  }

  console.log(sortBy);
  // end

  const foo = Event.find(filter)
    .sort(sortBy)
    .skip(offset)
    .limit(limit)
    .populate("author")
    .populate("type");
  const bar = Event.find(
    {
      date: {
        $gte: Date.now(),
        $lt: new Date("2021-09-23T00:00:00.000Z"),
      },
    },
    "_id title start end"
  );

  const [events, eventDates] = await Promise.all([foo, bar]);

  return sendResponse(
    res,
    200,
    true,
    { events, eventDates, totalPages, totalResults: totalEvents },
    null,
    ""
  );
});

eventController.getEventsPerUser = catchAsync(async (req, res, next) => {
  const userId = req.params.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 3;
  let filter = { ...req.query.filter };

  const totalEvents = await Event.find({
    ...filter,
    author: req.userId,
  }).estimatedDocumentCount();
  const totalPages = Math.ceil(totalEvents / limit);
  const offset = limit * (page - 1);

  // begin  sorting query
  const sortBy = req.query.sortBy || {};
  if (!sortBy.createdAt) {
    sortBy.createdAt = 1;
  }
  console.log(sortBy);
  // end

  const events = await Event.find({ ...filter, author: req.userId })
    .sort(sortBy)
    .skip(offset)
    .limit(limit)
    .populate("author")
    .populate("type");
  // const bar = Event.find(
  //   {
  //     date: {
  //       $gte: Date.now(),
  //       $lt: new Date("2021-09-23T00:00:00.000Z"),
  //     },
  //   },
  //   "_id title start end"
  // );

  // const events = await Promise.all([foo, bar]);

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
  const event = await Event.findById(req.params.id)
    .populate("eventType")
    .populate("author");
  if (!event) return next(new Error("Event not Found"));

  return sendResponse(res, 200, true, event, null, null);
});

// Create new event
eventController.createNewEvent = catchAsync(async (req, res, next) => {
  const author = req.userId;
  const {
    title,
    content,
    tags,
    images,
    eventType,
    date,
    startHour,
    endHour,
  } = req.body;

  let timestamp = req.body.startHour.split(":").map((s) => Number(s));
  const start = moment(req.body.date)
    .add(timestamp[0], "h")
    .add(timestamp[1], "m");
  timestamp = req.body.endHour.split(":").map((s) => Number(s));
  const end = moment(req.body.date)
    .add(timestamp[0], "h")
    .add(timestamp[1], "m");

  const event = await Event.create({
    title,
    content,
    author,
    tags,
    images,
    eventType,
    date,
    start,
    end,
    startHour,
    endHour,
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
  const {
    title,
    content,
    tags,
    images,
    eventType,
    date,
    startHour,
    endHour,
  } = req.body;

  const event = await Event.findOneAndUpdate(
    { _id: eventId, author: author },
    {
      title,
      content,
      tags,
      images,
      eventType,
      date,
      start,
      end,
    },
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
  console.log("TYPEEEEE", types);
  return sendResponse(res, 200, true, types, null, null);
});

module.exports = eventController;
