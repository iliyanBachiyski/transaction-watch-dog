const mongoose = require("mongoose");
const { Schema } = mongoose;

const TransactionSchema = new Schema(
  {
    uuid: { type: String, required: true, unique: true },
    transactionHash: { type: String, required: true },
    configuration: {
      type: Schema.Types.ObjectId,
      ref: "DynamicConfiguration",
      required: true,
    },
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

TransactionSchema.query.byUUID = function (uuid) {
  return this.where({ uuid });
};

module.exports.TransactionSchema = TransactionSchema;
