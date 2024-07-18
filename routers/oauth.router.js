const express = require("express");
const router = express.Router();
const passport = require("passport");
const OauthController = require("../controllers/oauth.controller");
require("dotenv").config();
const GoogleStrategy = require("passport-google-oauth20").Strategy;
require("dotenv").config();
const db = require("../models");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "api/auth/google/callback",
    },
    async function (accessToken, refreshToken, profile, cb) {
      if (profile?.id) {
        await db.UserThird.findOrCreate({
          where: {
            id: profile.id,
          },
          defaults: {
            id: profile.id,
            email: profile.email[0]?.value,
            typeLogin: profile?.provider,
          },
        });
      }
      return cb(null, profile);
    }
  )
);
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

router.get(
  "/google/callback",
  async (req, res, next) => {
    passport.authenticate("google", (err, profile) => {
      req.user = profile;
      next();
    })(req, res, next);
  },
  (req, res) => {
    res.redirect(`${process.env.URL_CLIENT}/${req.user?.id}`);
  }
);

// /${req.user?.id}

router.post("/login-oauth-success", OauthController.loginSuccess);

module.exports = router;
