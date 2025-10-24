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
          
          console.log('🔐 Login attempt with email:', email);

          // Check if email is from allowed domain
          if (!email.endsWith(`@${process.env.ALLOWED_EMAIL_DOMAIN}`)) {
            console.log('❌ Email domain not allowed:', email);
            return done(null, false, {
              message: `Only @${process.env.ALLOWED_EMAIL_DOMAIN} emails are allowed`
            });
          }

          // Find or create user
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            // Update last login
            user.lastLogin = new Date();
            await user.save();
            console.log('✅ Existing user logged in:', email);
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

          console.log('✅ New user created:', email);
          done(null, user);
        } catch (error) {
          console.error('❌ Google Strategy Error:', error);
          done(error, null);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    console.log('📝 Serializing user:', user.email);
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      console.log('📖 Deserializing user:', user?.email);
      done(null, user);
    } catch (error) {
      console.error('❌ Deserialize Error:', error);
      done(error, null);
    }
  });
};