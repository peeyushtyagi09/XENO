const express = require("express");
const { CopilotRuntime, GoogleGenerativeAIAdapter, copilotRuntimeNodeExpressEndpoint } = require("@copilotkit/runtime");
const { GEMINI_API_KEY } = require("../../example.env");

const router = express.Router();

// Hinglish comment: CopilotKit runtime request handler setup
router.use("/", (req, res, next) => {
  const serviceAdapter = new GoogleGenerativeAIAdapter({
    model: "gemini-3.5-flash",
    apiKey: GEMINI_API_KEY,
  });
  const runtime = new CopilotRuntime();
  const handler = copilotRuntimeNodeExpressEndpoint({
    endpoint: "/api/copilotkit",
    runtime,
    serviceAdapter,
  });
  return handler(req, res, next);
});

module.exports = router;
