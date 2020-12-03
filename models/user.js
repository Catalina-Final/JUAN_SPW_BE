const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");

const userSchema = Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    avatarUrl: { type: String, required: false },
    coverUrl: { type: String, required: false },
    facebook: { type: String, required: false },
    portfolioUrl: { type: String, required: false },
    instagram: { type: String, required: false },
    password: { type: String },
    friendhsip: {
      type: Schema.Types.ObjectId,
      required: false,
      ref: "Friendship",
    },
    friendCount: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
    room: {
      type: mongoose.Schema.ObjectId,
      ref: "Room",
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
  { timestamps: true }
);
userSchema.plugin(require("./plugins/isDeletedFalse"));

userSchema.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.__v;
  delete user.isDeleted;
  delete user.createdAt;
  delete user.updatedAt;
  return user;
};

userSchema.pre("save", async function (next) {
  const salt = await bcrypt.genSalt(10);
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, salt);
  }

  next();
});
userSchema.methods.generateToken = async function () {
  const accessToken = await jwt.sign({ _id: this._id }, JWT_SECRET_KEY, {
    expiresIn: "1d",
  });
  return accessToken;
};
module.exports = mongoose.model("User", userSchema);
