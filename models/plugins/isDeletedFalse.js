module.exports = exports = isDeletedFalse = function (schema, options) {
  schema.pre(/^find/, function (next) {
    console.log("in isdeletedPlugin", this._conditions);
    if (this._conditions["isDeleted"] === undefined)
      this._conditions["isDeleted"] = false;
    next();
  });
};
