import express from "express";
import mongoose from "mongoose";
import UserModel from "../models/User";
import jwt from "jsonwebtoken";
import { getToken, verifyAdmin, verifyUser } from "../utils/authentication";

const router = express.Router();

router.get("/", verifyUser, verifyAdmin, async (req, res, next) => {
  try {
    const users = await UserModel.find({});
    if (users) return res.status(200).json(users);
    return res.status(404).send("Unable to find records");
  } catch (err) {
    next(err);
  }
});

router.post("/register", async (req, res, next) => {
  if (!req.body.username || !req.body.password) return res.status(400);
  try {
    if (
      await UserModel.register(
        UserModel.build({
          username: req.body.username,
          balance: mongoose.Types.Decimal128.fromString("0"),
        }),
        req.body.password
      )
    )
      return res
        .status(201)
        .json({ success: true, status: "Registration Successful!" });
    return res
      .status(400)
      .json({ success: false, status: "Registration Failed!" });
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  if (!req.body.username || !req.body.password)
    return res.status(400).json({ token: null });
  try {
    const loggedInUser = await UserModel.authenticate(
      req.body,
      req.body.password
    );
    if (!loggedInUser) return res.status(400).json({ token: null });
    const token = getToken({ id: loggedInUser.id });
    res.cookie("token", token);
    const { id, ...user } = loggedInUser;
    return res.status(200).json({ ...user, token });
  } catch (err) {
    next(err);
  }
});

router.get("/checkToken", async (req, res, next) => {
  if (!req.cookies.token) return res.status(204).json({ token: null });
  try {
    const payload = jwt.verify(
      req.cookies.token,
      process.env.SECRETKEY!
    ) as jwt.JwtPayload;
    return res.status(200).json({ token: req.cookies.token });
  } catch (err) {
    next(err);
  }
});

export default router;
