const mongoose = require("mongoose");

const ExperienceSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  tools: {
    type: String,
    required: true,
  },
  fromDate: {
    type: Date,
    required: true,
  },
  toDate: {
    type: Date,
  },
  currentJob: {
    type: Boolean,
  },
});

module.exports = mongoose.model("Experience", ExperienceSchema);
