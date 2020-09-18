const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageSchema = Schema({
  roomId: { type: String },
  user: { type: Schema.ObjectId, required: true, ref: "User" },
  body: { type: String, required: true },
});

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
