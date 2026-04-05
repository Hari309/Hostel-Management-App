const express = require("express");
const {
  getComplaints,
  createComplaint,
  updateComplaint,
} = require("../controllers/complaintController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", createComplaint);
router.get("/", authMiddleware, getComplaints);
router.put("/:id", authMiddleware, updateComplaint);

module.exports = router;
