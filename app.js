var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors");
var indexRouter = require("./routes/index");
const mongoose = require("mongoose");
const mongoURI = process.env.MONGODB_URI;

var app = express();

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

mongoose.plugin(require("./models/plugins/modifiedAt"));
mongoose
  .connect(mongoURI, {
    // some options to deal with deprecated warning
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log(`Mongoose connected to ${mongoURI}`);
    utilsHelper.createEventTypesIfNotExists();
    // require("./testing/testSchema");
  })

  .catch((err) => console.log(err));
app.use(express.static(path.join(__dirname, "public")));
const utilsHelper = require("./helpers/utils.helper");
const { AppError } = require("./helpers/utils.helper");

/* Initialize Routes */
app.use("/api", indexRouter);

// catch 404 and forard to error handler
app.use((req, res, next) => {
  const err = new AppError(404, "url Not Found");
  err.statusCode = 404;
  next(err);
});

app.use((err, req, res, next) => {
  console.log("ERRROOR", err);
  if (process.env.ENV_MODE === "development") {
    return utilsHelper.sendResponse(
      res,
      err.statusCode ? err.statusCode : 500,
      false,
      null,
      err.stack,
      err.message
    );
  } else {
    return utilsHelper.sendResponse(
      res,
      err.statusCode ? err.statusCode : 500,
      false,
      null,
      null,
      err.message
    );
  }
});

module.exports = app;
