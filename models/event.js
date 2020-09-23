const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const eventSchema = Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    reactions: {
      laugh: { type: Number, default: 0 },
      sad: { type: Number, default: 0 },
      like: { type: Number, default: 0 },
      love: { type: Number, default: 0 },
      angry: { type: Number, default: 0 },
    },
    reviewCount: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
    tags: [String],
    images: [String],
    eventType: {
      type: Schema.Types.ObjectId,
      ref: "EventType",
      required: true,
    },
    date: { type: Date },
    startHour: { type: String, required: true },
    endHour: { type: String, required: true },
    start: { type: String },
    end: { type: String },
  },
  { timestamps: true }
);

eventSchema.plugin(require("./plugins/isDeletedFalse"));
module.exports = mongoose.model("Event", eventSchema);
