const utilsHelper = require("../helpers/utils.helper");
const mongoose = require("mongoose");
// install express-validator
const { validationResult } = require("express-validator");
const validators = {};

validators.validate = (validationArray) => async (req, res, next) => {
  await Promise.all(validationArray.map((validation) => validation.run(req)));
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  console.log(errors);
  const extractedErrors = [];
  errors
    .array()
    .map((error) => extractedErrors.push({ [error.param]: error.msg }));

  return utilsHelper.sendResponse(
    res,
    422,
    false,
    null,
    extractedErrors,
    "Validation Error"
  );
};

validators.checkObjectId = (paramId) => {
  if (!mongoose.Types.ObjectId.isValid(paramId)) {
    throw new Error("Invalid ObjectID");
  }
  return true;
};
module.exports = validators;
