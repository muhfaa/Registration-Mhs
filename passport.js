const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');
const LocalStrategy = require('passport-local').Strategy;
const GooglePlusTokenStartegy = require('passport-google-plus-token');
const { JWT_SECRET } = require('./configuration')
const User = require('./models/user')

// JWT Strategy
passport.use(new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromHeader('authorization'),
    secretOrKey: JWT_SECRET
}, async (payload, done) => {
    try {
        // Find user
        const user = await User.findById(payload.sub);
        
        // if user dosn't exists
        if(!user) {
            return done (null, false);
        }

        // Otherwise, return the user
        done(null, user);

    } catch(error) {
        done(error, false)
    }
}));

// Google OAuth Starategy
passport.use('googleToken', new GooglePlusTokenStartegy({
  clientID: '534351765275-uckcs2ub0m1g52qm52tjil8m736tts7a.apps.googleusercontent.com',
  clientSecret: 'faLi7WAZS6ORvRBlT0b5boJS'
}, async (accessToken, refreshToken, profile, done) => {
  try{

      console.log('accessToken', accessToken);
      console.log('refreshToken', refreshToken);
      console.log('profile', profile);
      
      
      //   Check user exists in DB
      const existingUser = await User.findOne({'google.id': profile.id});
      if (existingUser) {
          console.log('User already exists')
          return done(null, existingUser);
        }
        
          console.log('User dosn\'t exists');
        

        // if new account
        const newUser = new User({
            method: 'google',
            google: {
                id: profile.id,
                email: profile.emails[0].value
            }
        });
        
        await newUser.save();
        done(null, newUser);
    } catch(error){
        done(error, false, error.message);
    }
}));

// Local Strategy
passport.use(new LocalStrategy({
    usernameField: 'email'
}, async (email, password, done) => {
    try{

        const user = await User.findOne({ "local.email": email });
        
        if(!user){
            return done (null, false);
        }
        
        const isMatch = await user.isValidPassword(password);
        
        if (!isMatch){
            return done(null, false);
        }
        done(null, user);
    } catch(error){
        done(error, false);
    }
}));