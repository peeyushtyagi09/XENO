require("dotenv").config();

const express = require("express");
const communicationRoutes = require("./routes/communication.routes");

const app = express();
const PORT = process.env.PORT;

app.use(express.json());

// Request logging — har incoming call trace ho
app.use((req, res, next) => {
  console.log(`[CHANNEL SERVICE] ${req.method} ${req.originalUrl}`);
  next();
});

app.get("/", (req, res) => {
  res.json({
    success: true,
    service: "XENO Channel Service",
    message: "Simulated messaging provider — use POST /send",
  });
});

app.use("/", communicationRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global error handler — unexpected crashes handle karo
app.use((err, req, res, next) => {
  console.error("[CHANNEL SERVICE] Unexpected error:", err.message);
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

app.listen(PORT, () => {
  console.log("[CHANNEL SERVICE] Server running on http://localhost:" + PORT);
  console.log(`[CHANNEL SERVICE] CRM callback URL: ${process.env.CRM_CALLBACK_URL}`);
});
