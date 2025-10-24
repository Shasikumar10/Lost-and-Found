const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

module.exports = function(passport) {
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
          const emailDomain = email.split('@')[1];

          // Check if email domain is allowed
          if (emailDomain !== process.env.ALLOWED_EMAIL_DOMAIN) {
            console.error(`❌ Email domain not allowed: ${email}`);
            return done(null, false, { 
              message: `Only ${process.env.ALLOWED_EMAIL_DOMAIN} emails are allowed` 
            });
          }

          // Check if user exists
          let user = await User.findOne({ email });

          if (user) {
            console.log(`✅ Existing user logged in: ${user.email}`);
            return done(null, user);
          }

          // Create new user
          user = await User.create({
            googleId: profile.id,
            email: email,
            name: profile.displayName,
            avatar: profile.photos[0]?.value
          });

          console.log(`✅ New user created: ${user.email}`);
          done(null, user);
        } catch (error) {
          console.error('❌ Passport strategy error:', error);
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