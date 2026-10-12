const express = require("express");

const router = express.Router();

const {
  getResources,
  searchResources,
  getMyResources,
  getResourceById,
  createResource,
  deleteResource,
  getFormulaSheets,
} = require("../controllers/resourceController");

const protect = require("../middleware/authMiddleware");

router.get("/search", searchResources);

router.get(
  "/user/my-resources",
  protect,
  getMyResources
);

// Formula Sheets
router.get("/formula-sheets", getFormulaSheets);

router.get("/", getResources);

router.post(
  "/",
  protect,
  createResource
);

router.get("/:id", getResourceById);

router.delete(
  "/:id",
  protect,
  deleteResource
);

module.exports = router;