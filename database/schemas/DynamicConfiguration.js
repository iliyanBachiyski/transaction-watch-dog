const mongoose = require("mongoose");
const { Schema } = mongoose;

const DynamicConfigurationSchema = new Schema(
  {
    uuid: { type: String, required: true, unique: true },
    // TODO: Define rules
    isLatest: { type: Boolean, required: true, default: true },
    created_at: { type: Date, default: Date.now },
  },
  {
    toJSON: {
      transform: function (_, obj) {
        delete obj._id;
        delete obj.__v;
        obj.id = obj.uuid;
        delete obj.uuid;
        return obj;
      },
    },
  }
);

DynamicConfigurationSchema.query.byUUID = function (uuid) {
  return this.where({ uuid });
};

DynamicConfigurationSchema.query.getLatest = function () {
  return this.where({ isLatest: true });
};

module.exports.DynamicConfigurationSchema = DynamicConfigurationSchema;
