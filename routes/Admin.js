const express = require("express");
const adminRouter = express.Router();
const passport = require("passport");
const passportConfig = require("../passport"); //To access passport middleware
let path = require("path");
let fs = require("fs");
const pdf = require("html-pdf");
//const puppeteer = require("puppeteer");
//const wkhtmltopdf = require("wkhtmltopdf");
const HTMLtoDOCX = require("html-to-docx");
const pdfTemplate = require("../documents/pdfTemplate");
const docxTemplate = require("../documents/docxTemplate");
const User = require("../models/User");
const Skill = require("../models/Skill");
const Hobby = require("../models/Hobby");
const Language = require("../models/Language");
const Experience = require("../models/Experience");
const Education = require("../models/Education");
const ProfileVersion = require("../models/ProfileVersion");

//----IMAGES-AND-DOCUMENTS_ROUTES---//
adminRouter.post(
  "/user/createpdf",
  passport.authenticate("admin-rule", { session: false }),
  (req, res) => {
    const filePath = `./pdfs/${req.body._id}.pdf`;
    const newFileName = Math.floor(Math.random() * 1000000000) + 1;

    let options =
      process.env.PHANTOM_ENV === "local"
        ? {}
        : { phantomPath: "/usr/local/bin/phantomjs" };

    pdf
      .create(pdfTemplate(req.body), options)
      .toFile(
        `${filePath.split(".pdf")[0]}-${newFileName.toString()}.pdf`,
        (err) => {
          if (err) {
            res.status(500).json({
              message: {
                msgBody: "Failure",
                err,
              },
            });
          }
          res.status(200).json({
            document: {
              fileId: `${req.body._id}-${newFileName.toString()}`,
            },
          });
        }
      );
  }
);

adminRouter.post(
  "/user/getpdf",
  passport.authenticate("admin-rule", { session: false }),
  (req, res) => {
    //console.log(req.body);
    res.sendFile(path.resolve(`${__dirname}/../pdfs/${req.body._id}.pdf`));
  }
);

adminRouter.post(
  "/user/createdocx",
  passport.authenticate("admin-rule", { session: false }),
  (req, res) => {
    //console.log(req.body);
    (async () => {
      const filePath = `./docxs/${req.body._id}.docx`;
      const templateSet = docxTemplate(req.body);
      const fileBuffer = await HTMLtoDOCX(
        templateSet,
        null,
        {
          margins: {
            top: 500,
            right: 500,
            bottom: 500,
            left: 500,
            header: 250,
            footer: 250,
            gutter: 0,
          },
        },
        null
      );
      const newFileName = Math.floor(Math.random() * 1000000000) + 1;

      fs.access(filePath, fs.F_OK, (err) => {
        if (err) {
          console.log("File does not exist.");
          fs.writeFile(filePath, fileBuffer, (err) => {
            if (err) {
              res.send(Promise.reject());
            }
            res.send(Promise.resolve());
          });
        } else {
          console.log("File exists.");
          fs.writeFile(
            `${filePath.split(".docx")[0]}-${newFileName.toString()}.docx`,
            fileBuffer,
            (err) => {
              if (err) {
                res.send(Promise.reject());
              }
              res.json({
                document: {
                  fileId: `${req.body._id}-${newFileName.toString()}`,
                },
              });
            }
          );
        }
      });
    })();
  }
);

adminRouter.post(
  "/user/getdocx",
  passport.authenticate("admin-rule", { session: false }),
  (req, res) => {
    //console.log(req.body);
    res.sendFile(path.resolve(`${__dirname}/../docxs/${req.body._id}.docx`));
  }
);

//--USERS--//
adminRouter.get(
  "/users",
  passport.authenticate("admin-rule", { session: false }),
  (req, res) => {
    User.find({
      published: true,
      //$and: [{ privateResume: false }, { published: true }],
    }).exec((err, document) => {
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

//----VERSIONS---//
adminRouter.post(
  "/user/profileversion",
  passport.authenticate("admin-rule", { session: false }),
  (req, res) => {
    const profileVersion = new ProfileVersion(req.body.version);
    profileVersion.save((err, savedVersion) => {
      if (err) {
        res.status(500).json({
          message: { msgBody: "A saving error occured", msgError: err },
        });
      } else {
        User.findById(req.body.userId, (err, user) => {
          if (err) {
            res.status(500).json({
              message: {
                msgBody: "A finding user error occured",
                msgError: true,
              },
            });
          } else {
            user.profileVersions.push(profileVersion);
            user.save((err) => {
              if (err) {
                res.status(500).json({
                  message: {
                    msgBody: "A saving user error occured",
                    msgError: err,
                  },
                });
              } else {
                const newExperiences = [];

                const addNewExp = (cb) => {
                  req.body.experiences.forEach((experience) => {
                    const newExperience = new Experience(experience);
                    newExperience.save((err, document) => {
                      if (err) {
                        res.status(500).json({
                          message: {
                            msgBody: "An error occured",
                            msgError: err,
                          },
                        });
                      } else {
                        //console.log("document", document);
                        newExperiences.push(document);
                      }
                    });
                  });
                  setTimeout(() => {
                    cb();
                  }, 500);
                };

                const newExpsDone = () => {
                  ProfileVersion.updateOne(
                    { _id: savedVersion._id },
                    {
                      $push: {
                        experiences: {
                          $each: newExperiences,
                        },
                      },
                    },
                    { upsert: true },
                    (err) => {
                      if (err) {
                        res.status(500).json({
                          message: {
                            msgBody: "A finding user error occured",
                            msgError: true,
                          },
                        });
                      } else {
                        const newEducations = [];

                        const addNewEd = (cb) => {
                          req.body.educations.forEach((education) => {
                            const newEducation = new Education(education);
                            newEducation.save((err, document) => {
                              if (err) {
                                res.status(500).json({
                                  message: {
                                    msgBody: "An error occured",
                                    msgError: err,
                                  },
                                });
                              } else {
                                //console.log("document", document);
                                newEducations.push(document);
                              }
                            });
                          });
                          setTimeout(() => {
                            cb();
                          }, 500);
                        };

                        const newEdsDone = () => {
                          ProfileVersion.updateOne(
                            { _id: savedVersion._id },
                            {
                              $push: {
                                educations: {
                                  $each: newEducations,
                                },
                              },
                            },
                            { upsert: true },
                            (err) => {
                              if (err) {
                                res.status(500).json({
                                  message: {
                                    msgBody: "A finding user error occured",
                                    msgError: true,
                                  },
                                });
                              } else {
                                const newSkills = [];

                                const addNewSkill = (cb) => {
                                  req.body.skills.forEach((skill) => {
                                    const newSkill = new Skill(skill);
                                    newSkill.save((err, document) => {
                                      if (err) {
                                        res.status(500).json({
                                          message: {
                                            msgBody: "An error occured",
                                            msgError: err,
                                          },
                                        });
                                      } else {
                                        //console.log("document", document);
                                        newSkills.push(document);
                                      }
                                    });
                                  });
                                  setTimeout(() => {
                                    cb();
                                  }, 500);
                                };

                                const newSkillsDone = () => {
                                  ProfileVersion.updateOne(
                                    { _id: savedVersion._id },
                                    {
                                      $push: {
                                        skills: {
                                          $each: newSkills,
                                        },
                                      },
                                    },
                                    { upsert: true },
                                    (err) => {
                                      if (err) {
                                        res.status(500).json({
                                          message: {
                                            msgBody:
                                              "A finding user error occured",
                                            msgError: true,
                                          },
                                        });
                                      } else {
                                        const newLanguages = [];

                                        const addNewLanguage = (cb) => {
                                          req.body.languages.forEach(
                                            (language) => {
                                              const newLanguage = new Language(
                                                language
                                              );
                                              newLanguage.save(
                                                (err, document) => {
                                                  if (err) {
                                                    res.status(500).json({
                                                      message: {
                                                        msgBody:
                                                          "An error occured",
                                                        msgError: err,
                                                      },
                                                    });
                                                  } else {
                                                    /*console.log(
                                                      "document",
                                                      document
                                                    );*/
                                                    newLanguages.push(document);
                                                  }
                                                }
                                              );
                                            }
                                          );
                                          setTimeout(() => {
                                            cb();
                                          }, 500);
                                        };

                                        const newLanguagesDone = () => {
                                          ProfileVersion.updateOne(
                                            { _id: savedVersion._id },
                                            {
                                              $push: {
                                                languages: {
                                                  $each: newLanguages,
                                                },
                                              },
                                            },
                                            { upsert: true },
                                            (err) => {
                                              if (err) {
                                                res.status(500).json({
                                                  message: {
                                                    msgBody:
                                                      "A finding user error occured",
                                                    msgError: true,
                                                  },
                                                });
                                              } else {
                                                const newHobbies = [];

                                                const addNewHobby = (cb) => {
                                                  req.body.hobbies.forEach(
                                                    (hobby) => {
                                                      const newHobby =
                                                        new Hobby(hobby);
                                                      newHobby.save(
                                                        (err, document) => {
                                                          if (err) {
                                                            res
                                                              .status(500)
                                                              .json({
                                                                message: {
                                                                  msgBody:
                                                                    "An error occured",
                                                                  msgError: err,
                                                                },
                                                              });
                                                          } else {
                                                            /*console.log(
                                                              "document",
                                                              document
                                                            );*/
                                                            newHobbies.push(
                                                              document
                                                            );
                                                          }
                                                        }
                                                      );
                                                    }
                                                  );
                                                  setTimeout(() => {
                                                    cb();
                                                  }, 500);
                                                };

                                                const newHobbiesDone = () => {
                                                  ProfileVersion.updateOne(
                                                    { _id: savedVersion._id },
                                                    {
                                                      $push: {
                                                        hobbies: {
                                                          $each: newHobbies,
                                                        },
                                                      },
                                                    },
                                                    { upsert: true },
                                                    (err) => {
                                                      if (err) {
                                                        res.status(500).json({
                                                          message: {
                                                            msgBody:
                                                              "A finding user error occured",
                                                            msgError: true,
                                                          },
                                                        });
                                                      } else {
                                                        res.status(200).json({
                                                          message: {
                                                            versionId:
                                                              savedVersion._id,
                                                            msgBody:
                                                              "Successfully added version",
                                                            msgError: false,
                                                          },
                                                        });
                                                      }
                                                    }
                                                  );
                                                };

                                                addNewHobby(newHobbiesDone);
                                              }
                                            }
                                          );
                                        };

                                        addNewLanguage(newLanguagesDone);
                                      }
                                    }
                                  );
                                };

                                addNewSkill(newSkillsDone);
                              }
                            }
                          );
                        };

                        addNewEd(newEdsDone);
                      }
                    }
                  );
                };

                addNewExp(newExpsDone);
              }
            });
          }
        });
      }
    });
  }
);

adminRouter.post(
  "/user/profileversions",
  passport.authenticate("admin-rule", { session: false }),
  (req, res) => {
    User.findById({ _id: req.body._id })
      .populate("profileVersions")
      .exec((err, document) => {
        if (err) {
          res.status(500).json({
            message: { msgBody: "An population error occured", msgError: true },
          });
        } else {
          res.status(200).json({
            profileVersions: document.profileVersions,
            isAuthenticated: true,
          });
        }
      });
  }
);

adminRouter.post(
  "/user/getprofileversion",
  passport.authenticate("admin-rule", { session: false }),
  (req, res) => {
    ProfileVersion.findById(req.body._id, (err, document) => {
      if (err) {
        res
          .status(500)
          .json({ message: { msgBody: "An error occured", msgError: true } });
      } else {
        res
          .status(200)
          .json({ profileVersion: document, isAuthenticated: true });
      }
    });
  }
);

adminRouter.put(
  "/user/updateprofileversion",
  passport.authenticate("admin-rule", { session: false }),
  (req, res) => {
    ProfileVersion.findByIdAndUpdate(
      req.body._id,
      {
        name: req.body.name,
      },
      (err, document) => {
        if (err) {
          res
            .status(500)
            .json({ message: { msgBody: "An error occured", msgError: true } });
        } else {
          res.status(200).json({
            message: {
              msgBody: "Successfully updated version name",
              msgError: false,
            },
          });
        }
      }
    );
  }
);

adminRouter.post(
  "/user/removeprofileversion",
  passport.authenticate("admin-rule", { session: false }),
  (req, res) => {
    User.findById(req.body._id, (err, user) => {
      if (err) {
        res
          .status(500)
          .json({ message: { msgBody: "An error occured", msgError: true } });
      } else {
        user.profileVersions.pull({ _id: req.body.versionId });
        user.save((err) => {
          if (err) {
            res.status(500).json({
              message: { msgBody: "An error occured", msgError: true },
            });
          } else {
            res.status(200).json({
              message: {
                msgBody: "Successfully removed version",
                msgError: false,
              },
            });
          }
        });
      }
    });
  }
);

//Skills
adminRouter.post(
  "/user/versionskills",
  passport.authenticate("admin-rule", { session: false }),
  (req, res) => {
    ProfileVersion.findById({ _id: req.body._id })
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

adminRouter.post(
  "/user/versionskill",
  passport.authenticate("admin-rule", { session: false }),
  (req, res) => {
    const skill = new Skill(req.body);
    skill.save((err) => {
      if (err) {
        res.status(500).json({
          message: { msgBody: "A saving error occured", msgError: err },
        });
      } else {
        ProfileVersion.findById(req.body.versionId, (err, version) => {
          if (err) {
            res.status(500).json({
              message: {
                msgBody: "A finding user error occured",
                msgError: true,
              },
            });
          } else {
            version.skills.push(skill);
            version.save((err) => {
              if (err) {
                res.status(500).json({
                  message: {
                    msgBody: "A saving user error occured",
                    msgError: err,
                  },
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
    });
  }
);

adminRouter.put(
  "/user/updateversionskill",
  passport.authenticate("admin-rule", { session: false }),
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

adminRouter.post(
  "/user/removeversionskill",
  passport.authenticate("admin-rule", { session: false }),
  (req, res) => {
    //const { _id } = req.body;
    ProfileVersion.findById(req.body.versionId, (err, version) => {
      if (err) {
        res.status(500).json({
          message: {
            msgBody: "A finding version error occured",
            msgError: true,
          },
        });
      } else {
        version.skills.pull({ _id: req.body._id });
        version.save((err) => {
          if (err) {
            res.status(500).json({
              message: {
                msgBody: "A saving version error occured",
                msgError: err,
              },
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
    });
  }
);

//languages
adminRouter.post(
  "/user/versionlanguages",
  passport.authenticate("admin-rule", { session: false }),
  (req, res) => {
    ProfileVersion.findById({ _id: req.body._id })
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

adminRouter.post(
  "/user/versionlanguage",
  passport.authenticate("admin-rule", { session: false }),
  (req, res) => {
    const language = new Language(req.body);
    language.save((err) => {
      if (err) {
        res.status(500).json({
          message: { msgBody: "A saving error occured", msgError: err },
        });
      } else {
        ProfileVersion.findById(req.body.versionId, (err, version) => {
          if (err) {
            res.status(500).json({
              message: {
                msgBody: "A finding user error occured",
                msgError: true,
              },
            });
          } else {
            version.languages.push(language);
            version.save((err) => {
              if (err) {
                res.status(500).json({
                  message: {
                    msgBody: "A saving user error occured",
                    msgError: err,
                  },
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
    });
  }
);

adminRouter.put(
  "/user/updateversionlanguage",
  passport.authenticate("admin-rule", { session: false }),
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

adminRouter.post(
  "/user/removeversionlanguage",
  passport.authenticate("admin-rule", { session: false }),
  (req, res) => {
    //const { _id } = req.body;
    ProfileVersion.findById(req.body.versionId, (err, version) => {
      if (err) {
        res.status(500).json({
          message: {
            msgBody: "A finding version error occured",
            msgError: true,
          },
        });
      } else {
        version.languages.pull({ _id: req.body._id });
        version.save((err) => {
          if (err) {
            res.status(500).json({
              message: {
                msgBody: "A saving version error occured",
                msgError: err,
              },
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
    });
  }
);

//hobbies
adminRouter.post(
  "/user/versionhobbies",
  passport.authenticate("admin-rule", { session: false }),
  (req, res) => {
    ProfileVersion.findById({ _id: req.body._id })
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

adminRouter.post(
  "/user/versionhobby",
  passport.authenticate("admin-rule", { session: false }),
  (req, res) => {
    const hobby = new Hobby(req.body);
    hobby.save((err) => {
      if (err) {
        res.status(500).json({
          message: { msgBody: "A saving error occured", msgError: err },
        });
      } else {
        ProfileVersion.findById(req.body.versionId, (err, version) => {
          if (err) {
            res.status(500).json({
              message: {
                msgBody: "A finding user error occured",
                msgError: true,
              },
            });
          } else {
            version.hobbies.push(hobby);
            version.save((err) => {
              if (err) {
                res.status(500).json({
                  message: {
                    msgBody: "A saving user error occured",
                    msgError: err,
                  },
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
    });
  }
);

adminRouter.post(
  "/user/removeversionhobby",
  passport.authenticate("admin-rule", { session: false }),
  (req, res) => {
    //const { _id } = req.body;
    ProfileVersion.findById(req.body.versionId, (err, version) => {
      if (err) {
        res.status(500).json({
          message: {
            msgBody: "A finding version error occured",
            msgError: true,
          },
        });
      } else {
        version.hobbies.pull({ _id: req.body._id });
        version.save((err) => {
          if (err) {
            res.status(500).json({
              message: {
                msgBody: "A saving version error occured",
                msgError: err,
              },
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
    });
  }
);

//Presentation
adminRouter.put(
  "/user/updateversionpresentation",
  passport.authenticate("admin-rule", { session: false }),
  (req, res) => {
    ProfileVersion.findByIdAndUpdate(
      req.body.versionId,
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

//experiences
adminRouter.post(
  "/user/versionexperiences",
  passport.authenticate("admin-rule", { session: false }),
  (req, res) => {
    ProfileVersion.findById({ _id: req.body._id })
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

adminRouter.post(
  "/user/versionexperience",
  passport.authenticate("admin-rule", { session: false }),
  (req, res) => {
    const experience = new Experience(req.body);
    experience.save((err) => {
      if (err) {
        res.status(500).json({
          message: { msgBody: "A saving error occured", msgError: err },
        });
      } else {
        ProfileVersion.findById(req.body.versionId, (err, version) => {
          if (err) {
            res.status(500).json({
              message: {
                msgBody: "A finding user error occured",
                msgError: true,
              },
            });
          } else {
            version.experiences.push(experience);
            version.save((err) => {
              if (err) {
                res.status(500).json({
                  message: {
                    msgBody: "A saving user error occured",
                    msgError: err,
                  },
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
    });
  }
);

adminRouter.put(
  "/user/updateversionexperience",
  passport.authenticate("admin-rule", { session: false }),
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

adminRouter.post(
  "/user/removeversionexperience",
  passport.authenticate("admin-rule", { session: false }),
  (req, res) => {
    //const { _id } = req.body;
    ProfileVersion.findById(req.body.versionId, (err, version) => {
      if (err) {
        res.status(500).json({
          message: {
            msgBody: "A finding version error occured",
            msgError: true,
          },
        });
      } else {
        version.experiences.pull({ _id: req.body._id });
        version.save((err) => {
          if (err) {
            res.status(500).json({
              message: {
                msgBody: "A saving version error occured",
                msgError: err,
              },
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
    });
  }
);

//educations
adminRouter.post(
  "/user/versioneducations",
  passport.authenticate("admin-rule", { session: false }),
  (req, res) => {
    ProfileVersion.findById({ _id: req.body._id })
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

adminRouter.post(
  "/user/versioneducation",
  passport.authenticate("admin-rule", { session: false }),
  (req, res) => {
    const education = new Education(req.body);
    education.save((err) => {
      if (err) {
        res.status(500).json({
          message: { msgBody: "A saving error occured", msgError: err },
        });
      } else {
        ProfileVersion.findById(req.body.versionId, (err, version) => {
          if (err) {
            res.status(500).json({
              message: {
                msgBody: "A finding user error occured",
                msgError: true,
              },
            });
          } else {
            version.educations.push(education);
            version.save((err) => {
              if (err) {
                res.status(500).json({
                  message: {
                    msgBody: "A saving user error occured",
                    msgError: err,
                  },
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
    });
  }
);

adminRouter.put(
  "/user/updateversioneducation",
  passport.authenticate("admin-rule", { session: false }),
  (req, res) => {
    Education.findByIdAndUpdate(
      req.body._id,
      {
        name: req.body.name,
        school: req.body.school,
        tools: req.body.tools,
        fromDate: req.body.fromDate,
        toDate: req.body.toDate,
        ongoing: req.body.ongoing,
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

adminRouter.post(
  "/user/removeversioneducation",
  passport.authenticate("admin-rule", { session: false }),
  (req, res) => {
    //const { _id } = req.body;
    ProfileVersion.findById(req.body.versionId, (err, version) => {
      if (err) {
        res.status(500).json({
          message: {
            msgBody: "A finding version error occured",
            msgError: true,
          },
        });
      } else {
        version.educations.pull({ _id: req.body._id });
        version.save((err) => {
          if (err) {
            res.status(500).json({
              message: {
                msgBody: "A saving version error occured",
                msgError: err,
              },
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
    });
  }
);

module.exports = adminRouter;
