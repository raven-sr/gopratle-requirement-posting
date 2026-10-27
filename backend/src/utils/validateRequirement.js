const allowedCategories = ["planner", "performer", "crew"];

function cleanString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function validateRequirement(body) {
  const errors = [];
  const eventName = cleanString(body.eventName);
  const eventType = cleanString(body.eventType);
  const startDate = cleanString(body.startDate);
  const endDate = cleanString(body.endDate);
  const location = cleanString(body.location);
  const venue = cleanString(body.venue);
  const category = cleanString(body.category).toLowerCase();
  const categoryDetails = body.categoryDetails;

  if (!eventName) errors.push("Event name is required.");
  if (!eventType) errors.push("Event type is required.");
  if (!startDate) errors.push("Start date is required.");
  if (!endDate) errors.push("End date is required.");
  if (startDate && endDate && endDate < startDate) {
    errors.push("End date cannot be before the start date.");
  }
  if (!location) errors.push("Location is required.");
  if (!allowedCategories.includes(category)) {
    errors.push("Category must be planner, performer, or crew.");
  }
  if (!categoryDetails || typeof categoryDetails !== "object" || Array.isArray(categoryDetails)) {
    errors.push("Category details must be an object.");
  }

  if (categoryDetails && typeof categoryDetails === "object" && !Array.isArray(categoryDetails)) {
    if (category === "planner" && !cleanString(categoryDetails.serviceType)) {
      errors.push("Planner service type is required.");
    }
    if (category === "performer" && !cleanString(categoryDetails.performerType)) {
      errors.push("Performer type is required.");
    }
    if (category === "crew" && !cleanString(categoryDetails.crewRole)) {
      errors.push("Crew role is required.");
    }
  }

  if (errors.length) return { errors };

  return {
    value: {
      eventName,
      eventType,
      startDate,
      endDate,
      location,
      venue,
      category,
      categoryDetails
    }
  };
}

module.exports = { validateRequirement };
