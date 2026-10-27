const mongoose = require("mongoose");

const requirementSchema = new mongoose.Schema(
  {
    eventName: { type: String, required: true, trim: true, maxlength: 120 },
    eventType: { type: String, required: true, trim: true, maxlength: 80 },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    location: { type: String, required: true, trim: true, maxlength: 120 },
    venue: { type: String, trim: true, maxlength: 160, default: "" },
    category: {
      type: String,
      required: true,
      enum: ["planner", "performer", "crew"]
    },
    categoryDetails: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      default: {}
    }
  },
  { timestamps: true, minimize: false }
);

module.exports = mongoose.model("Requirement", requirementSchema);
