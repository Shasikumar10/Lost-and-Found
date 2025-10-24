const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

module.exports = (passport) => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails[0].value;

          // Check if email is from allowed domain
          if (!email.endsWith(`@${process.env.ALLOWED_EMAIL_DOMAIN}`)) {
            return done(null, false, {
              message: `Only ${process.env.ALLOWED_EMAIL_DOMAIN} emails are allowed`
            });
          }

          // Find or create user
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            // Update last login
            user.lastLogin = new Date();
            await user.save();
            return done(null, user);
          }

          // Create new user
          user = await User.create({
            googleId: profile.id,
            email: email,
            name: profile.displayName,
            picture: profile.photos[0]?.value,
            lastLogin: new Date()
          });

          done(null, user);
        } catch (error) {
          console.error('Google Strategy Error:', error);
          done(error, null);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
};