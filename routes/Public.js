const express = require("express");
const publicRouter = express.Router();
const User = require("../models/User");

publicRouter.post("/user/getpublicprofilepic", (req, res) => {
  User.findById(req.body._id, (err, document) => {
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
});

publicRouter.get("/users", (req, res) => {
  User.find({
    //published: true,
    $and: [{ privateResume: false }, { published: true }],
  }).exec((err, document) => {
    if (err) {
      res
        .status(500)
        .json({ message: { msgBody: "An error occured", msgError: true } });
    } else {
      res.status(200).json({ users: document, isAuthenticated: true });
    }
  });
});

publicRouter.post("/user", (req, res) => {
  User.findById(req.body._id, (err, document) => {
    if (err) {
      res
        .status(500)
        .json({ message: { msgBody: "An error occured", msgError: true } });
    } else {
      res.status(200).json({ user: document, isAuthenticated: true });
    }
  });
});

publicRouter.post("/user/publicskills", (req, res) => {
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
});

publicRouter.post("/user/publiclanguages", (req, res) => {
  User.findById({ _id: req.body._id })
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
});

publicRouter.post("/user/publichobbies", (req, res) => {
  User.findById({ _id: req.body._id })
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
});

publicRouter.post("/user/publicexperiences", (req, res) => {
  User.findById({ _id: req.body._id })
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
});

publicRouter.post("/user/publiceducations", (req, res) => {
  User.findById({ _id: req.body._id })
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
});

module.exports = publicRouter;
