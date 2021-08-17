const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
const jwtStrategy = require("passport-jwt").Strategy;
const User = require("./models/User");

const cookieExtractor = (req) => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies["access_token"];
  }
  return token;
};

//authorization to protect account endpoints
passport.use(
  "user-rule",
  new jwtStrategy(
    {
      jwtFromRequest: cookieExtractor,
      secretOrKey: process.env.SESSION_SECRET,
    },
    (payload, done) => {
      User.findById({ _id: payload.sub }, (err, user) => {
        if (err) {
          return done(err, false);
        }
        if (user) {
          return done(null, user);
        } else {
          return done(null, false);
        }
      });
    }
  )
);

//authorization to protect admin endpoints
passport.use(
  "admin-rule",
  new jwtStrategy(
    {
      jwtFromRequest: cookieExtractor,
      secretOrKey: process.env.SESSION_SECRET,
    },
    (payload, done) => {
      User.findById({ _id: payload.sub }, (err, user) => {
        if (err) {
          return done(err, false);
        }
        if (user && user.role.includes("admin")) {
          return done(null, user);
        } else {
          return done(null, false);
        }
      });
    }
  )
);

//authentication using username and password for logging in
passport.use(
  new localStrategy((username, password, done) => {
    User.findOne({ username }, (err, user) => {
      //something went wrong with db
      if (err) {
        return done(err);
      }
      //no existing user
      if (!user) {
        return done(null, false);
      }
      //check if password is correct
      user.comparePassword(password, done);
    });
  })
);
