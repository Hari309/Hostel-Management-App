const express = require("express");
const { getPayments, createPayment } = require("../controllers/paymentController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);
router.get("/", getPayments);
router.post("/", createPayment);

module.exports = router;
