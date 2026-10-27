const Requirement = require("../models/Requirement");
const { validateRequirement } = require("../utils/validateRequirement");

async function createRequirement(req, res, next) {
  try {
    const result = validateRequirement(req.body || {});
    if (result.errors) {
      return res.status(400).json({
        success: false,
        message: "Please correct the submitted information.",
        errors: result.errors
      });
    }

    const requirement = await Requirement.create(result.value);
    return res.status(201).json({
      success: true,
      message: "Requirement submitted successfully.",
      data: requirement
    });
  } catch (error) {
    next(error);
  }
}

async function getRequirements(req, res, next) {
  try {
    const filter = {};
    const category = typeof req.query.category === "string"
      ? req.query.category.toLowerCase()
      : "";
    if (["planner", "performer", "crew"].includes(category)) {
      filter.category = category;
    }

    const requirements = await Requirement.find(filter)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    res.json({ success: true, count: requirements.length, data: requirements });
  } catch (error) {
    next(error);
  }
}

module.exports = { createRequirement, getRequirements };
