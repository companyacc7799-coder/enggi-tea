const express = require("express");
const router = express.Router();
const {
  getPendingResources,
  approveResource,
  rejectResource,
  adminDeleteResource,
} = require("../controllers/adminController");
const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

// Every route in this file requires a logged-in admin
router.use(protect, adminOnly);

router.get("/resources/pending", getPendingResources);
router.patch("/resources/:id/approve", approveResource);
router.patch("/resources/:id/reject", rejectResource);
router.delete("/resources/:id", adminDeleteResource);

module.exports = router;
