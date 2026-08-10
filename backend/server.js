require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const requestRoutes = require("./routes/requests");

const app = express();
const PORT = process.env.PORT || 5000;

// Allow the configured origin, or reflect any origin in dev if not set
const corsOrigin = process.env.CORS_ORIGIN;
app.use(
  cors({
    origin: corsOrigin ? corsOrigin.split(",").map((s) => s.trim()) : true,
    credentials: true,
  })
);
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "school-request-backend", time: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/requests", requestRoutes);

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ message: "Not found." });
});

// Central error handler (safety net)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Something went wrong on the server." });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
