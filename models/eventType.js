const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const eventTypeSchema = Schema(
  {
    type: { type: String, unique: true },
  },
  { timestamps: true }
);

const EventType = mongoose.model("EventType", eventTypeSchema);
module.exports = EventType;
