import jwt from "jsonwebtoken";
import passport from "passport";
import jwtStrategy from "passport-jwt";
import User from "../models/User";
import { RequestHandler } from "express-serve-static-core";

export const getToken = (user: Object) => {
  return jwt.sign(user, process.env.SECRETKEY!, { expiresIn: 3600 });
}

const ExtractJwt = jwtStrategy.ExtractJwt;

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.SECRETKEY!,
};

export const jwtPassport = passport.use(
  new jwtStrategy.Strategy(opts, (jwt_payload, done) => {
    try {
      const user = User.findOne({ _id: jwt_payload._id });
      if (user) {
        return done(null, user);
      }
      return done(null, false);
    } catch (err) {
      return done(err, false);
    }
  })
);

export const verifyAdmin: RequestHandler = (req, res, next) => {
  if (req.user?.admin == true) {
    next();
  } else {
    res.send("Not an Authorized for this action");
    let err = new Error("You are unauthorised to do this action");
    next(err);
  }
};

export const verifyUser = passport.authenticate("jwt", { session: false });