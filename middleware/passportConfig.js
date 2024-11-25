const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const jwtPassport = require('passport-jwt');
const bcrypt = require('bcrypt');
const client = require('../prisma/client');

const JwtStrategy = jwtPassport.Strategy;
const ExtractJwt = jwtPassport.ExtractJwt;

const localVerify = async (email, pw, done) => {
  try {
    const user = await client.user.findUnique({ where: { email: email } });
    if (!user) return done(null, false);

    const match = await bcrypt.compare(pw, user.pw);
    if (!match) return done(null, false);

    return done(null, user);
  } catch (e) {
    return done(e, false);
  }
};

const jwtVerify = async (payload, done) => {
  try {
    if (!payload) return done(null, false);
    return done(null, payload);
  } catch (e) {
    return done(e, false);
  }
};

const localStrat = new LocalStrategy(
  { usernameField: 'email', passwordField: 'pw' },
  localVerify
);

const jwtStrat = new JwtStrategy(
  {
    secretOrKey: process.env.SECRET,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  },
  jwtVerify
);

passport.use(localStrat);
passport.use(jwtStrat);

module.exports = passport;
