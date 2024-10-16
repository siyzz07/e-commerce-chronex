
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/userModels');

// Configuring the Google strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback"
},
async (accessToken, refreshToken, profile, done) => {
  try {

    
    
    // Check if the user already exists in the database
    let user = await User.findOne({ email: profile.emails[0].value });
    if (user) {
      return done(null, user); // If user exists, pass the user to Passport
    }

    // If the user doesn't exist, create a new user
    user = new User({
      name: profile.displayName,
      email: profile.emails[0].value,
      isVerified: true
    });
    await user.save();
    return done(null, user); // Pass the newly created user to Passport
  } catch (error) {
    return done(error, null);
  }
}
));

// Serializing the user (storing the user's ID in the session)
passport.serializeUser((user, done) => done(null, user.id));

// Deserializing the user (retrieving the user from the session by their ID)
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});
