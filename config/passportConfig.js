
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/userModels');

// Google strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://chronex.siyzz.site/auth/google/callback"
},
async (accessToken, refreshToken, profile, done) => {
  try {

    
    
    //  user already existschek 
    let user = await User.findOne({ email: profile.emails[0].value });
    if (user) {
      return done(null, user); 
    }

    //  doesnt exist create a new user
    user = new User({
      name: profile.displayName,
      email: profile.emails[0].value,
      isVerified: true
    });
    await user.save();
    return done(null, user); 
  } catch (error) {
    return done(error, null);
  }
}
));


passport.serializeUser((user, done) => done(null, user.id));


passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});
