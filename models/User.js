const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    min: 6,
    max: 15,
  },
  password: {
    type: String,
    required: true,
  },
  profilePic: {
    type: String,
  },
  role: {
    type: String,
    enum: ["user", "admin", "admin/user"],
    required: true,
  },
  manager: {
    type: String,
  },
  published: {
    type: Boolean,
  },
  privateResume: {
    type: Boolean,
  },
  firstname: {
    type: String,
  },
  lastname: {
    type: String,
  },
  title: {
    type: String,
  },
  availible: {
    type: Boolean,
  },
  email: {
    type: String,
  },
  phone: {
    type: String,
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
  profileVersions: [
    { type: mongoose.Schema.Types.ObjectId, ref: "ProfileVersion" },
  ],
});

//No Arrow fonction to access this. ...
UserSchema.pre("save", function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  bcrypt.hash(this.password, 10, (err, passwordHashed) => {
    if (err) {
      return next(err);
    }
    this.password = passwordHashed;
    next();
  });
});

UserSchema.methods.comparePassword = function (password, callback) {
  bcrypt.compare(password, this.password, (err, isMatch) => {
    if (err) {
      return callback(err);
    } else {
      if (!isMatch) {
        return callback(null, isMatch);
      }
      return callback(null, this);
    }
  });
};

module.exports = mongoose.model("User", UserSchema);
