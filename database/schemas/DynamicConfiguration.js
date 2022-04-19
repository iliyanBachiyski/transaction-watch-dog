const mongoose = require("mongoose");
const Joi = require("joi");
const { Schema } = mongoose;

const DynamicConfigurationSchema = new Schema(
  {
    uuid: { type: String, required: true, unique: true },
    fromAddress: { type: String, default: null },
    toAddress: { type: String, default: null },
    minBlockNumber: { type: Number, default: null },
    minTransactionValue: { type: Number, default: null },
    maxTransactionValue: { type: Number, default: null },
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

DynamicConfigurationSchema.statics.validateCreateRequest = function (config) {
  const schema = Joi.object({
    fromAddress: Joi.string(),
    toAddress: Joi.string(),
    minBlockNumber: Joi.number(),
    minTransactionValue: Joi.number(),
    maxTransactionValue: Joi.number(),
  });
  return schema.validate(config, { abortEarly: false });
};

module.exports.DynamicConfigurationSchema = DynamicConfigurationSchema;
