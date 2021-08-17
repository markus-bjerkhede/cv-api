const mongoose = require("mongoose");

const LanguageSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  stars: {
    type: String,
  },
});

module.exports = mongoose.model("Language", LanguageSchema);
