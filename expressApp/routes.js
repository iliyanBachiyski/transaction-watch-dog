const router = require("express").Router();
const { StatusCodes } = require("http-status-codes");
const createError = require("http-errors");
const { v4: uuidv4 } = require("uuid");

const { DynamicConfigurationModel } = require("../database");

router.get("/", async (req, res, next) => {
  try {
    const result = await DynamicConfigurationModel.find().exec();
    const count = await DynamicConfigurationModel.countDocuments();
    return res.json({ result, count });
  } catch (error) {
    console.log(error);
    return next(
      createError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "Нещо се обърка. Моля опитайте отново!"
      )
    );
  }
});

module.exports = router;
