const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const { PORT } = require("./example.env");
const { connectDB } = require("./src/database/db");
const customerRoutes = require("./src/routes/Customer.route");
const segmentRoutes = require("./src/routes/Segment.route");
const errorHandler = require("./src/middleware/errorHandler.middleware");
const ApiError = require("./src/utils/ApiError");

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

// Har request log karo — debugging me kaam aata hai
app.use((req, res, next) => {
  console.log(`📝 ${req.method} ${req.url}`);
  next();
});

// Routes
app.get("/", (req, res) => {
  res.send("Hello ji..");
});

// Phase 3: Customer APIs
app.use("/customers", customerRoutes);

// Phase 4: Segmentation Engine — marketer segment preview
app.use("/api/segments", segmentRoutes);

// 404 — jo route exist nahi karta
app.use((req, res, next) => {
  next(new ApiError(404, `Route nahi mila: ${req.method} ${req.originalUrl}`));
});

// Global error handler — sabse last me hona chahiye
app.use(errorHandler);

// Database connect karke server start karo
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`👌 Server is perfectly running on PORT: ${PORT} 👌`);
    });
  })
  .catch((err) => {
    console.error(`❌ Error connecting to MongoDB: ${err.message} ❌`);
    process.exit(1);
  });
