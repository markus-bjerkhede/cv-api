const mongoose = require("mongoose");

const ProfileVersionSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  presentation: {
    type: String,
    max: 500,
  },
  skills: [{ type: mongoose.Schema.Types.ObjectId, ref: "Skill" }],
  hobbies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Hobby" }],
  languages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Language" }],
  experiences: [{ type: mongoose.Schema.Types.ObjectId, ref: "Experience" }],
  educations: [{ type: mongoose.Schema.Types.ObjectId, ref: "Education" }],
});

module.exports = mongoose.model("ProfileVersion", ProfileVersionSchema);
