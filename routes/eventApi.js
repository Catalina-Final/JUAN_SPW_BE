const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");
const { param, body } = require("express-validator");
const authMiddleware = require("../middlewares/authentication");
const validators = require("../middlewares/validators");

/**
 * @route GET api/events/user/:id?page=1&limit=10
 * @description Get events with pagination of the current user
 * @access Login required
 */
router.get(
  "/user/:id",
  authMiddleware.loginRequired,
  eventController.getEventsPerUser
);

/**
 * @route GET api/events?page=1&limit=10
 * @description Get events with pagination
 * @access Public
 */
router.get("/", eventController.getEvents);

/**
 * @route GET api/events/types
 * @description Get all event types (documents)
 * @access Public
 */
router.get("/types", eventController.getTypes);

/////

/**
 * @route GET api/events/:id
 * @description Get a single event
 * @access Public
 */
router.get(
  "/:id",
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
  ]),
  eventController.getSingleEvent
);

/**
 * @route POST api/events
 * @description POST a single event/ Create a new event
 * @access required
 */
router.post(
  "/",
  authMiddleware.loginRequired,
  validators.validate([
    // body("title", "missing Title").exists().notEmpty(),
    // body("content", "missing content").exists().notEmpty(),
  ]),

  eventController.createNewEvent
);

/**
 * @route PUT api/events/:id
 * @description Update an event
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

  eventController.updateSingleEvent
);

/**
 * @route DELETE api/events/:id
 * @description Delete a event
 * @access required
 */
router.delete(
  "/:id",
  authMiddleware.loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
  ]),

  eventController.deleteSingleEvent
);
module.exports = router;
