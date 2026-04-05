const express = require("express");
const { getRooms, createRoom, updateRoom } = require("../controllers/roomController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);
router.get("/", getRooms);
router.post("/", createRoom);
router.put("/:id", updateRoom);

module.exports = router;
