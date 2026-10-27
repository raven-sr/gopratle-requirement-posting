const express = require("express");
const {
  createRequirement,
  getRequirements
} = require("../controllers/requirementController");

const router = express.Router();

router.get("/", getRequirements);
router.post("/", createRequirement);

module.exports = router;
