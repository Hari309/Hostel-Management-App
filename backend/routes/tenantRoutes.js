const express = require("express");
const {
  getTenants,
  createTenant,
  updateTenant,
  deleteTenant,
} = require("../controllers/tenantController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);
router.get("/", getTenants);
router.post("/", createTenant);
router.put("/:id", updateTenant);
router.delete("/:id", deleteTenant);

module.exports = router;
