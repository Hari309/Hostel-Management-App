const cors = require("cors");
const dotenv = require("dotenv");
const express = require("express");
const morgan = require("morgan");
const connectDB = require("./config/db");
const { errorHandler, notFound } = require("./middleware/errorMiddleware");

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.json({ message: "Hostel Management API is running." });
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/tenants", require("./routes/tenantRoutes"));
app.use("/api/rooms", require("./routes/roomRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/expenses", require("./routes/expenseRoutes"));
app.use("/api/complaints", require("./routes/complaintRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
