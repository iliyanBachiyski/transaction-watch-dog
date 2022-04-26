const router = require("express").Router();
const { StatusCodes } = require("http-status-codes");
const { v4: uuidv4 } = require("uuid");
const { isValidAddress, loadNewConfiguration } = require("../web3");

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

router.get("/", async (_, res) => {
  try {
    const result = await DynamicConfigurationModel.find().exec();
    const count = await DynamicConfigurationModel.countDocuments();
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
    const configuration = await DynamicConfigurationModel.findOne()
      .byUUID(req.params.id)
      .exec();
    if (!configuration) {
      res.status(StatusCodes.NOT_FOUND);
      return res.json({
        message: `Configuration with id '${req.params.id}' was not found!`,
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

router.post(
  "/create",
  validateCreateDynamicConfigurationRequest,
  async (req, res) => {
    try {
      const { fromAddress, toAddress } = req.body;
      if (
        (fromAddress && !isValidAddress(fromAddress)) ||
        (toAddress && !isValidAddress(toAddress))
      ) {
        res.status(StatusCodes.BAD_REQUEST);
        return res.json({
          message: "Please provide a valid address",
        });
      }
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
      loadNewConfiguration();
      return res.json({
        id: item.uuid,
      });
    } catch (error) {
      console.log(error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR);
      return res.json({
        message: "Something went wrong. Please try again!",
      });
    }
  }
);

module.exports = router;
