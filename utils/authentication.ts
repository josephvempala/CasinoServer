import jwt, { JwtPayload } from "jsonwebtoken";
import User from "../models/User";
import { RequestHandler } from "express-serve-static-core";
import { Socket } from "socket.io";

export const getToken = (user: Object) => {
  return jwt.sign(user, process.env.SECRETKEY!, { expiresIn: 3600 });
};

export const verifyAdmin: RequestHandler = (req, res, next) => {
  if (req.user?.admin == true) {
    next();
  } else {
    res.send("Not Authorized for this action");
    let err = new Error("You are unauthorised to do this action");
    next(err);
  }
};

export const verifyUser: RequestHandler = async (req, res, next) => {
  try {
    const payload = jwt.verify(
      req.cookies.token as string,
      process.env.SECRETKEY!
    ) as JwtPayload;
    const user = await User.findById(payload.id);
    req.user = user as Express.User;
    return next();
  } catch (err) {
    console.log(err);
    next();
  }
};

export const verifySocketUser = async (socket: Socket) => {
  socket.use(([event, ...args], next) => {
    try {
      const payload = jwt.verify(
        socket.handshake.auth.token,
        process.env.SECRETKEY!
      ) as JwtPayload;
      next();
    } catch (err) {
      next(err);
    }
  });
  if (socket.handshake.auth.token)
    try {
      const payload = jwt.verify(
        socket.handshake.auth.token,
        process.env.SECRETKEY!
      ) as JwtPayload;
      const user = await User.findById(payload.id);
      socket.data.user = user;
    } catch (err) {
      socket.data = null;
    }
};
