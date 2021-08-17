const mongoose = require("mongoose");

const EducationSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  school: {
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
  ongoing: {
    type: Boolean,
  },
});

module.exports = mongoose.model("Education", EducationSchema);
