const mongoose = require("mongoose");
const { Schema } = mongoose;

const DynamicConfigurationSchema = new Schema(
  {
    uuid: { type: String, required: true, unique: true },
    // TODO: Define rules
    created_at: { type: Date, default: Date.now },
    deleted_at: { type: Date, default: null },
  },
  {
    toJSON: {
      transform: function (_, obj) {
        delete obj._id;
        delete obj.__v;
        return obj;
      },
    },
  }
);

DynamicConfigurationSchema.query.byUUID = function (uuid) {
  return this.where({ uuid });
};

module.exports.DynamicConfigurationSchema = DynamicConfigurationSchema;
