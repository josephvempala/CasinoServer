import express from "express";
import mongoose, { Model } from "mongoose";
import passport from "passport";
import UserModel, { User, UserDocument } from "../models/User";
import { getToken, verifyUser } from "../utils/authentication";

const router = express.Router();

router.get("/", verifyUser, async (req, res, next) => {
  try {
    const users = await UserModel.find({});
    const user = await (<mongoose.Query<User, UserDocument>>req.user);
    console.log(user);
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
    const item = await UserModel.authenticate(req.body, req.body.password);
    if (!item) return res.status(400).json({ token: null });
    const token = getToken({ _id: item?._id });
    return res.status(200).json({ token });
  } catch (err) {
    next(err);
  }
});

export default router;