const express = require("express");
const { handleReceipt } = require("../controllers/Receipt.controller");
const asyncHandler = require("../middleware/asyncHandler.middleware");
const validate = require("../middleware/validate.middleware");
const { receiptSchema } = require("../validation/Receipt.validation");

const router = express.Router();

router.post("/", validate(receiptSchema, "body"), asyncHandler(handleReceipt));

module.exports = router;
