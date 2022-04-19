const mongoose = require("mongoose");
const { DB_URL } = require("../config");
const { DynamicConfigurationSchema, TransactionSchema } = require("./schemas");

mongoose.connect(DB_URL);

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("DB Connected...!");
});

const DynamicConfigurationModel = db.model(
  "DynamicConfiguration",
  DynamicConfigurationSchema
);

const TransactionSchemaModel = db.model("Transaction", TransactionSchema);

module.exports = {
  DynamicConfigurationModel,
  TransactionSchemaModel,
};
