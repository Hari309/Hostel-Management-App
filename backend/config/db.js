const mongoose = require("mongoose");

mongoose.set("bufferCommands", false);

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const connectDB = async () => {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 30000,
      });
      console.log("MongoDB connected");
      return;
    } catch (error) {
      const isLastAttempt = attempt === MAX_RETRIES;
      console.error(
        `MongoDB connection failed (attempt ${attempt}/${MAX_RETRIES}):`,
        error.message
      );

      if (isLastAttempt) {
        console.error("MongoDB connection failed after maximum retries. Exiting process.");
        process.exit(1);
      }

      await sleep(RETRY_DELAY_MS);
    }
  }
};

module.exports = connectDB;
