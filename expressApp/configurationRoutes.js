const router = require("express").Router();
const { StatusCodes } = require("http-status-codes");
const createError = require("http-errors");
const { v4: uuidv4 } = require("uuid");

const { DynamicConfigurationModel } = require("../database");

const validateCreateDynamicConfigurationRequest = async function (
  req,
  res,
  next
) {
  const validationResponse = DynamicConfigurationModel.validateCreateRequest(
    req.body
  );
  if (validationResponse.error) {
    console.log(validationResponse.error);
    return res.status(StatusCodes.BAD_REQUEST).json({
      details: validationResponse.error.details,
    });
  }
  next();
};

router.get("/", async (_, res, next) => {
  try {
    const result = await DynamicConfigurationModel.find().exec();
    const count = await DynamicConfigurationModel.countDocuments();
    return res.json({ result, count });
  } catch (error) {
    console.log(error);
    return next(
      createError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "Something went wrong. Please try again!"
      )
    );
  }
});

router.get("/:id", async (req, res) => {
  try {
    const configuration = await DynamicConfigurationModel.findOne()
      .byUUID(req.params.id)
      .exec();
    if (!configuration) {
      return res.json({
        message: `Configuration with id '${req.params.id}' was not found!`,
      });
    }
    return res.json(configuration);
  } catch (error) {
    console.log(error);
    return next(
      createError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "Something went wrong. Please try again!"
      )
    );
  }
});

router.post(
  "/create",
  validateCreateDynamicConfigurationRequest,
  async (req, res, next) => {
    try {
      const latestConfiguration = await DynamicConfigurationModel.findOne()
        .getLatest()
        .exec();
      if (latestConfiguration) {
        await DynamicConfigurationModel.updateOne(
          { isLatest: true },
          { isLatest: false }
        );
      }
      const newConfiguration = new DynamicConfigurationModel({
        ...req.body,
        uuid: uuidv4(),
      });
      const item = await newConfiguration.save();
      return res.json({
        id: item.uuid,
      });
    } catch (error) {
      console.log(error);
      return next(
        createError(
          StatusCodes.INTERNAL_SERVER_ERROR,
          "Something went wrong. Please try again!"
        )
      );
    }
  }
);

module.exports = router;
