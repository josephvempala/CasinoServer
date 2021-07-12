import jwt from "jsonwebtoken";
import User from "../models/User";
import { RequestHandler } from "express-serve-static-core";

export const getToken = (user: Object) => {
  return jwt.sign(user, process.env.SECRETKEY!, { expiresIn: 3600 });
}

export const verifyAdmin: RequestHandler = (req, res, next) => {
  if (req.user?.admin == true) {
    next();
  } else {
    res.send("Not Authorized for this action");
    let err = new Error("You are unauthorised to do this action");
    next(err);
  }
};

export const verifyUser : RequestHandler = async (req, res, next) => {
  try{
    const payload = jwt.verify(req.cookies.token as string, process.env.SECRETKEY!) as jwt.JwtPayload;
    const user = await User.findById(payload.id);
    req.user = user as Express.User;
    return next();
  }
  catch (err) {
    console.log(err);
    next();
  }
}