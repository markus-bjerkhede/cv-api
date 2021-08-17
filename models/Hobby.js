const mongoose = require("mongoose");

const HobbySchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Hobby", HobbySchema);
