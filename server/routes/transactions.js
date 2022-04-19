const router = require("express").Router();
const { StatusCodes } = require("http-status-codes");

const { TransactionSchemaModel } = require("../../database");

router.get("/", async (_, res) => {
  try {
    const result = await TransactionSchemaModel.find()
      .populate("configuration")
      .exec();
    const count = await TransactionSchemaModel.countDocuments();
    return res.json({ result, count });
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    return res.json({
      message: "Something went wrong. Please try again!",
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const configuration = await TransactionSchemaModel.findOne()
      .byUUID(req.params.id)
      .populate("configuration")
      .exec();
    if (!configuration) {
      res.status(StatusCodes.NOT_FOUND);
      return res.json({
        message: `Transaction with id '${req.params.id}' was not found!`,
      });
    }
    return res.json(configuration);
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR);
    return res.json({
      message: "Something went wrong. Please try again!",
    });
  }
});

module.exports = router;
