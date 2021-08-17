const mongoose = require("mongoose");

const SkillSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  stars: {
    type: String,
  },
});

module.exports = mongoose.model("Skill", SkillSchema);
