const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
      const domain = email.split('@')[1];

      // Check if email is from allowed domain
      if (domain !== process.env.ALLOWED_EMAIL_DOMAIN) {
        return done(null, false, { 
          message: 'Only @klh.edu.in email addresses are allowed' 
        });
      }

      // Check if user exists
      let user = await User.findOne({ email });

      if (!user) {
        // Create new user
        user = await User.create({
          googleId: profile.id,
          email: email,
          name: profile.displayName,
          picture: profile.photos[0]?.value,
          role: 'user'
        });
      } else if (!user.googleId) {
        // Update existing user with Google ID
        user.googleId = profile.id;
        await user.save();
      }

      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }
));

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

module.exports = passport;