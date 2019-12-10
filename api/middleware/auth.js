require('dotenv').load();

const db = require('../../db');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const { ExtractJwt, Strategy: JwtStrategy } = require('passport-jwt');
const jwtSecret = "asdasdqwdwqdqwdqwdqwdqwdsad";
const jwtExpirationTime = "13214921072184";

const strategyOpts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: jwtSecret
};

const strategy = new JwtStrategy(strategyOpts, (jwt_payload, done) => {
  done(null, jwt_payload);
});

passport.use(strategy);

const jwtOptions = {
  expiresIn: jwtExpirationTime
};

const createToken = user => {
  const toSign = {
    id: user.id,
    role: user.role,
    email: user.email,
    fullname: `${user.firstname} ${user.lastname}`,
    imageUrl: user.imageUrl,
    services: user.services
  };
  return jwt.sign(toSign, jwtSecret, jwtOptions);
};

const requireAuthWithPredicate = pred => (req, res, next) => {
  passport.authenticate('jwt', { session: false }, async (err, payload) => {
    try {
      if (err) return next(err);
      if (!payload)
        return next({ status: 401, message: 'Please log in first!' });
      const { id } = payload;
      const user = await db.User.findById(id);
      if (pred.check(user, req)) {
        req.user = user;
        return next();
      } else return next({ status: 403, message: pred.message });
    } catch (e) {
      next(e);
    }
  })(req, res, next);
};

module.exports = {
  createToken,
  requireAuthWithPredicate,
  loginRequired: requireAuthWithPredicate({ check: () => true }),
  ensureCorrectUser: requireAuthWithPredicate({
    check: (user, req) => user._id.toString() === req.params.id,
    message: 'Needs permission !'
  })
};
