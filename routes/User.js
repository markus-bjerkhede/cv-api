const express = require("express");
const userRouter = express.Router();
const passport = require("passport");
const passportConfig = require("../passport"); //To access passport middleware
const jwt = require("jsonwebtoken");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
let path = require("path");
const User = require("../models/User");
const Skill = require("../models/Skill");
const Hobby = require("../models/Hobby");
const Language = require("../models/Language");
const Experience = require("../models/Experience");
const Education = require("../models/Education");

const signToken = (userID) => {
  return jwt.sign(
    {
      iss: "DrakryggenResumes",
      sub: userID,
    },
    process.env.SESSION_SECRET,
    { expiresIn: 60 * 60 * 24 }
  );
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "images");
  },
  filename: function (req, file, cb) {
    cb(null, uuidv4() + "-" + Date.now() + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedFileTypes = ["image/jpeg", "image/jpg", "image/png"];
  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

let upload = multer({ storage, fileFilter });

//----AUTH_ROUTES---//
userRouter.post("/user/register", (req, res) => {
  const { username, password, role, availible } = req.body;
  User.findOne({ username }, (err, user) => {
    if (err) {
      res
        .status(500)
        .json({ message: { msgBody: "An error occured", msgError: true } });
    }
    if (user) {
      res
        .status(400)
        .json({ message: { msgBody: "Username taken", msgError: true } });
    } else {
      const newUser = new User({
        username,
        password,
        role,
        availible,
        privateResume: false,
      });
      newUser.save((err) => {
        if (err) {
          res
            .status(500)
            .json({ message: { msgBody: "An error occured", msgError: true } });
        } else {
          res.status(201).json({
            message: {
              msgBody: "Account successfully created",
              msgError: false,
            },
          });
        }
      });
    }
  });
});

userRouter.post(
  "/user/login",
  passport.authenticate("local", { session: false }),
  (req, res) => {
    if (req.isAuthenticated()) {
      const { _id, username, role } = req.user;
      const token = signToken(_id);
      res.cookie("access_token", token, { httpOnly: true, sameSite: true });
      res.status(200).json({
        isAuthenticated: true,
        user: { _id, username, role },
        message: { msgBody: "Succesfully logged in", msgError: false },
      });
    }
  }
);

userRouter.get(
  "/user/logout",
  passport.authenticate("user-rule", { session: false }),
  (req, res) => {
    res.clearCookie("access_token");
    res.json({ user: { username: "", role: "" }, success: true });
  }
);

userRouter.get(
  "/user/admin",
  passport.authenticate("user-rule", { session: false }),
  (req, res) => {
    if (req.user.role === "admin") {
      res
        .status(200)
        .json({ message: { msgBody: "Welcome admin", msgError: false } });
    } else {
      res
        .status(403)
        .json({ message: { msgBody: "Not admin", msgError: true } });
    }
  }
);

userRouter.get(
  "/user/authenticated",
  passport.authenticate("user-rule", { session: false }),
  (req, res) => {
    const { _id, username, role, profilePic } = req.user;
    res.status(200).json({
      isAuthenticated: true,
      user: { _id, username, role, profilePic },
    });
  }
);

userRouter.post("/user/checkregistrationcode", (req, res) => {
  console.log(process.env);
  if (req.body.registrationCode === process.env.REGISTER_ADMIN_CODE) {
    res.status(200).json({ role: "admin" });
  } else if (req.body.registrationCode === process.env.REGISTER_USER_CODE) {
    res.status(200).json({ role: "user" });
  } else if (
    req.body.registrationCode !== process.env.REGISTER_USER_CODE ||
    req.body.registrationCode !== process.env.REGISTER_ADMIN_CODE
  ) {
    res.status(400).json({
      message: { msgBody: "Invalid registration code", msgError: true },
    });
  } else {
    res
      .status(500)
      .json({ message: { msgBody: "An error occured", msgError: true } });
  }
});

//----IMAGES-AND-DOCUMENTS_ROUTES---//
userRouter.put(
  "/user/uploadprofilepic",
  passport.authenticate("user-rule", { session: false }),
  upload.single("profilePic"),
  (req, res) => {
    User.findByIdAndUpdate(
      req.user._id,
      { profilePic: req.file.filename },
      (err, document) => {
        if (err) {
          res
            .status(500)
            .json({ message: { msgBody: "An error occured", msgError: true } });
        } else {
          res.status(200).json({
            document,
            message: {
              msgBody: "Successfully updated profile pic",
              msgError: false,
            },
          });
        }
      }
    );
  }
);

userRouter.get(
  "/user/getprofilepic",
  passport.authenticate("user-rule", { session: false }),
  (req, res) => {
    User.findById(req.user._id, (err, document) => {
      if (err) {
        res
          .status(500)
          .json({ message: { msgBody: "An error occured", msgError: true } });
      } else {
        res.status(200).json({
          _id: document._id,
          profilePic: document.profilePic,
          isAuthenticated: true,
        });
      }
    });
  }
);

//----USER/USERS_ROUTES---//
userRouter.put(
  "/user/updateuserinfo",
  passport.authenticate("user-rule", { session: false }),
  (req, res) => {
    User.findByIdAndUpdate(
      req.user._id,
      {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        title: req.body.title,
        email: req.body.email,
        phone: req.body.phone,
      },
      (err, document) => {
        if (err) {
          res
            .status(500)
            .json({ message: { msgBody: "An error occured", msgError: true } });
        } else {
          res.status(200).json({
            message: {
              msgBody: "Successfully updated presentation",
              msgError: false,
            },
          });
        }
      }
    );
  }
);

userRouter.get(
  "/all",
  passport.authenticate("user-rule", { session: false }),
  (req, res) => {
    User.find({}).exec((err, document) => {
      if (err) {
        res
          .status(500)
          .json({ message: { msgBody: "An error occured", msgError: true } });
      } else {
        res.status(200).json({ users: document, isAuthenticated: true });
      }
    });
  }
);

userRouter.delete(
  "/user/delete",
  passport.authenticate("user-rule", { session: false }),
  (req, res) => {
    User.findByIdAndDelete(req.body._id, (err) => {
      if (err) {
        res
          .status(500)
          .json({ message: { msgBody: "An error occured", msgError: true } });
      } else {
        res.status(200).json({
          message: {
            msgBody: "Successfully deleted user",
            msgError: false,
          },
        });
      }
    });
  }
);

userRouter.get(
  "/user/getuserinfo",
  passport.authenticate("user-rule", { session: false }),
  (req, res) => {
    User.findById(req.user._id, (err, document) => {
      if (err) {
        res
          .status(500)
          .json({ message: { msgBody: "An error occured", msgError: true } });
      } else {
        res.status(200).json({
          _id: document._id,
          username: document.username,
          firstname: document.firstname,
          lastname: document.lastname,
          title: document.title,
          email: document.email,
          phone: document.phone,
          isAuthenticated: true,
        });
      }
    });
  }
);

userRouter.put(
  "/user/updaterole",
  passport.authenticate("user-rule", { session: false }),
  (req, res) => {
    User.findByIdAndUpdate(
      req.body._id,
      {
        role: req.body.role,
        availible: req.body.availibility,
        manager: req.body.manager,
      },
      (err, document) => {
        if (err) {
          res
            .status(500)
            .json({ message: { msgBody: "An error occured", msgError: true } });
        } else {
          res.status(200).json({
            document: document,
            message: {
              msgBody: "Successfully updated role",
              msgError: false,
            },
          });
        }
      }
    );
  }
);

//----PUBLISHED/PRIVATE RESUME STATUSES_ROUTES----//
//Pubished profile
userRouter.put(
  "/user/updatepublishedstatus",
  passport.authenticate("user-rule", { session: false }),
  (req, res) => {
    User.findByIdAndUpdate(
      req.user._id,
      {
        published: req.body.published,
      },
      (err, document) => {
        if (err) {
          res
            .status(500)
            .json({ message: { msgBody: "An error occured", msgError: true } });
        } else {
          res.status(200).json({
            message: {
              msgBody: "Successfully updated editing status",
              msgError: false,
            },
          });
        }
      }
    );
  }
);

userRouter.get(
  "/user/getpublishedstatus",
  passport.authenticate("user-rule", { session: false }),
  (req, res) => {
    User.findById(req.user._id, (err, document) => {
      if (err) {
        res
          .status(500)
          .json({ message: { msgBody: "An error occured", msgError: true } });
      } else {
        res.status(200).json({
          published: document.published,
        });
      }
    });
  }
);

//Private Resume
userRouter.put(
  "/user/updateprivateresumestatus",
  passport.authenticate("user-rule", { session: false }),
  (req, res) => {
    User.findByIdAndUpdate(
      req.user._id,
      {
        privateResume: req.body.privateResume,
      },
      (err, document) => {
        if (err) {
          res
            .status(500)
            .json({ message: { msgBody: "An error occured", msgError: true } });
        } else {
          res.status(200).json({
            message: {
              msgBody: "Successfully updated privacy status",
              msgError: false,
            },
          });
        }
      }
    );
  }
);

userRouter.get(
  "/user/getprivateresumestatus",
  passport.authenticate("user-rule", { session: false }),
  (req, res) => {
    User.findById(req.user._id, (err, document) => {
      if (err) {
        res
          .status(500)
          .json({ message: { msgBody: "An error occured", msgError: true } });
      } else {
        res.status(200).json({
          privateResume: document.privateResume,
        });
      }
    });
  }
);

//----PRESENTATION_ROUTES---//
userRouter.put(
  "/user/updatepresentation",
  passport.authenticate("user-rule", { session: false }),
  (req, res) => {
    User.findByIdAndUpdate(
      req.user._id,
      { presentation: req.body.presentation },
      (err, document) => {
        if (err) {
          res
            .status(500)
            .json({ message: { msgBody: "An error occured", msgError: true } });
        } else {
          res.status(200).json({
            message: {
              msgBody: "Successfully updated presentation",
              msgError: false,
            },
          });
        }
      }
    );
  }
);

userRouter.get(
  "/user/presentation",
  passport.authenticate("user-rule", { session: false }),
  (req, res) => {
    User.findById(req.user._id, (err, document) => {
      if (err) {
        res
          .status(500)
          .json({ message: { msgBody: "An error occured", msgError: true } });
      } else {
        res.status(200).json({
          _id: document._id,
          presentation: document.presentation,
          isAuthenticated: true,
        });
      }
    });
  }
);

//----SKILLS_ROUTES---//
userRouter.post(
  "/user/skill",
  passport.authenticate("user-rule", { session: false }),
  (req, res) => {
    const skill = new Skill(req.body);
    skill.save((err) => {
      if (err) {
        res
          .status(500)
          .json({ message: { msgBody: "An error occured", msgError: true } });
      } else {
        req.user.skills.push(skill);
        req.user.save((err) => {
          if (err) {
            res.status(500).json({
              message: { msgBody: "An error occured", msgError: true },
            });
          } else {
            res.status(200).json({
              message: {
                msgBody: "Successfully added skill",
                msgError: false,
              },
            });
          }
        });
      }
    });
  }
);

userRouter.put(
  "/user/updateskill",
  passport.authenticate("user-rule", { session: false }),
  (req, res) => {
    Skill.findByIdAndUpdate(
      req.body._id,
      {
        name: req.body.name,
        stars: req.body.stars,
      },
      (err, document) => {
        if (err) {
          res
            .status(500)
            .json({ message: { msgBody: "An error occured", msgError: true } });
        } else {
          res.status(200).json({
            document,
            message: {
              msgBody: "Successfully updated skill",
              msgError: false,
            },
          });
        }
      }
    );
  }
);

userRouter.get(
  "/user/skills",
  passport.authenticate("user-rule", { session: false }),
  (req, res) => {
    User.findById({ _id: req.user._id })
      .populate("skills")
      .exec((err, document) => {
        if (err) {
          res
            .status(500)
            .json({ message: { msgBody: "An error occured", msgError: true } });
        } else {
          res
            .status(200)
            .json({ skills: document.skills, isAuthenticated: true });
        }
      });
  }
);

/*userRouter.post("/user/publicskills", (req, res) => {
  User.findById({ _id: req.body._id })
    .populate("skills")
    .exec((err, document) => {
      if (err) {
        res
          .status(500)
          .json({ message: { msgBody: "An error occured", msgError: true } });
      } else {
        res
          .status(200)
          .json({ skills: document.skills, isAuthenticated: true });
      }
    });
});*/

userRouter.post(
  "/user/removeskill",
  passport.authenticate("user-rule", { session: false }),
  (req, res) => {
    const { _id } = req.body;
    req.user.skills.pull({ _id });
    req.user.save((err) => {
      if (err) {
        res.status(500).json({
          message: { msgBody: "An error occured", msgError: true },
        });
      } else {
        res.status(200).json({
          message: {
            msgBody: "Successfully removed skill",
            msgError: false,
          },
        });
      }
    });
  }
);

//----LANGUAGES_ROUTES---//
userRouter.post(
  "/user/language",
  passport.authenticate("user-rule", { session: false }),
  (req, res) => {
    const language = new Language(req.body);
    language.save((err) => {
      if (err) {
        res
          .status(500)
          .json({ message: { msgBody: "An error occured", msgError: true } });
      } else {
        req.user.languages.push(language);
        req.user.save((err) => {
          if (err) {
            res.status(500).json({
              message: { msgBody: "An error occured", msgError: true },
            });
          } else {
            res.status(200).json({
              message: {
                msgBody: "Successfully added language",
                msgError: false,
              },
            });
          }
        });
      }
    });
  }
);

userRouter.put(
  "/user/updatelanguage",
  passport.authenticate("user-rule", { session: false }),
  (req, res) => {
    Language.findByIdAndUpdate(
      req.body._id,
      {
        name: req.body.name,
        stars: req.body.stars,
      },
      (err, document) => {
        if (err) {
          res
            .status(500)
            .json({ message: { msgBody: "An error occured", msgError: true } });
        } else {
          res.status(200).json({
            document,
            message: {
              msgBody: "Successfully updated language",
              msgError: false,
            },
          });
        }
      }
    );
  }
);

userRouter.get(
  "/user/languages",
  passport.authenticate("user-rule", { session: false }),
  (req, res) => {
    User.findById({ _id: req.user._id })
      .populate("languages")
      .exec((err, document) => {
        if (err) {
          res
            .status(500)
            .json({ message: { msgBody: "An error occured", msgError: true } });
        } else {
          res
            .status(200)
            .json({ languages: document.languages, isAuthenticated: true });
        }
      });
  }
);

userRouter.post(
  "/user/removelanguage",
  passport.authenticate("user-rule", { session: false }),
  (req, res) => {
    const { _id } = req.body;
    req.user.languages.pull({ _id });
    req.user.save((err) => {
      if (err) {
        res.status(500).json({
          message: { msgBody: "An error occured", msgError: true },
        });
      } else {
        res.status(200).json({
          message: {
            msgBody: "Successfully removed language",
            msgError: false,
          },
        });
      }
    });
  }
);

//----HOBBIES_ROUTES---//
userRouter.post(
  "/user/removehobby",
  passport.authenticate("user-rule", { session: false }),
  (req, res) => {
    req.user.hobbies.pull({ _id: req.body._id });
    req.user.save((err) => {
      if (err) {
        res.status(500).json({
          message: { msgBody: "An error occured", msgError: true },
        });
      } else {
        res.status(200).json({
          message: {
            msgBody: "Successfully removed hobby",
            msgError: false,
          },
        });
      }
    });
  }
);

userRouter.post(
  "/user/hobby",
  passport.authenticate("user-rule", { session: false }),
  (req, res) => {
    const hobby = new Hobby(req.body);
    hobby.save((err) => {
      if (err) {
        res
          .status(500)
          .json({ message: { msgBody: "An error occured", msgError: true } });
      } else {
        req.user.hobbies.push(hobby);
        req.user.save((err) => {
          if (err) {
            res.status(500).json({
              message: { msgBody: "An error occured", msgError: true },
            });
          } else {
            res.status(200).json({
              message: {
                msgBody: "Successfully added hobby",
                msgError: false,
              },
            });
          }
        });
      }
    });
  }
);

userRouter.get(
  "/user/hobbies",
  passport.authenticate("user-rule", { session: false }),
  (req, res) => {
    User.findById({ _id: req.user._id })
      .populate("hobbies")
      .exec((err, document) => {
        if (err) {
          res
            .status(500)
            .json({ message: { msgBody: "An error occured", msgError: true } });
        } else {
          res
            .status(200)
            .json({ hobbies: document.hobbies, isAuthenticated: true });
        }
      });
  }
);

//----EXPERIENCE_ROUTES---//
userRouter.post(
  "/user/experience",
  passport.authenticate("user-rule", { session: false }),
  (req, res) => {
    const experience = new Experience(req.body);
    experience.save((err) => {
      if (err) {
        res
          .status(500)
          .json({ message: { msgBody: "An error occured", msgError: true } });
      } else {
        req.user.experiences.push(experience);
        req.user.save((err) => {
          if (err) {
            res.status(500).json({
              message: { msgBody: "An error occured", msgError: true },
            });
          } else {
            res.status(200).json({
              message: {
                msgBody: "Successfully added experience",
                msgError: false,
              },
            });
          }
        });
      }
    });
  }
);

userRouter.put(
  "/user/updateexperience",
  passport.authenticate("user-rule", { session: false }),
  (req, res) => {
    Experience.findByIdAndUpdate(
      req.body._id,
      {
        name: req.body.name,
        description: req.body.description,
        tools: req.body.tools,
        fromDate: req.body.fromDate,
        toDate: req.body.toDate,
        currentJob: req.body.currentJob,
      },
      (err, document) => {
        if (err) {
          res
            .status(500)
            .json({ message: { msgBody: "An error occured", msgError: true } });
        } else {
          res.status(200).json({
            document,
            message: {
              msgBody: "Successfully updated experience",
              msgError: false,
            },
          });
        }
      }
    );
  }
);

userRouter.get(
  "/user/experiences",
  passport.authenticate("user-rule", { session: false }),
  (req, res) => {
    User.findById({ _id: req.user._id })
      .populate("experiences")
      .exec((err, document) => {
        if (err) {
          res
            .status(500)
            .json({ message: { msgBody: "An error occured", msgError: true } });
        } else {
          res
            .status(200)
            .json({ experiences: document.experiences, isAuthenticated: true });
        }
      });
  }
);

userRouter.post(
  "/user/removeexperience",
  passport.authenticate("user-rule", { session: false }),
  (req, res) => {
    req.user.experiences.pull({ _id: req.body._id });
    req.user.save((err) => {
      if (err) {
        res.status(500).json({
          message: { msgBody: "An error occured", msgError: true },
        });
      } else {
        res.status(200).json({
          message: {
            msgBody: "Successfully removed experience",
            msgError: false,
          },
        });
      }
    });
  }
);

//----EDUCATION_ROUTES---//
userRouter.post(
  "/user/education",
  passport.authenticate("user-rule", { session: false }),
  (req, res) => {
    const education = new Education(req.body);
    education.save((err) => {
      if (err) {
        res
          .status(500)
          .json({ message: { msgBody: "An error occured", msgError: true } });
      } else {
        req.user.educations.push(education);
        req.user.save((err) => {
          if (err) {
            res.status(500).json({
              message: { msgBody: "An error occured", msgError: true },
            });
          } else {
            res.status(200).json({
              message: {
                msgBody: "Successfully added education",
                msgError: false,
              },
            });
          }
        });
      }
    });
  }
);

userRouter.put(
  "/user/updateeducation",
  passport.authenticate("user-rule", { session: false }),
  (req, res) => {
    Education.findByIdAndUpdate(
      req.body._id,
      {
        name: req.body.name,
        description: req.body.description,
        tools: req.body.tools,
        fromDate: req.body.fromDate,
        toDate: req.body.toDate,
        currentJob: req.body.currentJob,
      },
      (err, document) => {
        if (err) {
          res
            .status(500)
            .json({ message: { msgBody: "An error occured", msgError: true } });
        } else {
          res.status(200).json({
            document,
            message: {
              msgBody: "Successfully updated education",
              msgError: false,
            },
          });
        }
      }
    );
  }
);

userRouter.get(
  "/user/educations",
  passport.authenticate("user-rule", { session: false }),
  (req, res) => {
    User.findById({ _id: req.user._id })
      .populate("educations")
      .exec((err, document) => {
        if (err) {
          res
            .status(500)
            .json({ message: { msgBody: "An error occured", msgError: true } });
        } else {
          res
            .status(200)
            .json({ educations: document.educations, isAuthenticated: true });
        }
      });
  }
);

userRouter.post(
  "/user/removeeducation",
  passport.authenticate("user-rule", { session: false }),
  (req, res) => {
    req.user.educations.pull({ _id: req.body._id });
    req.user.save((err) => {
      if (err) {
        res.status(500).json({
          message: { msgBody: "An error occured", msgError: true },
        });
      } else {
        res.status(200).json({
          message: {
            msgBody: "Successfully removed education",
            msgError: false,
          },
        });
      }
    });
  }
);

module.exports = userRouter;
