import mongoose from "mongoose";
import crypto from "crypto";

export interface User {
  username: String;
  password: String;
  balance?: mongoose.Types.Decimal128;
  admin?: Boolean;
}

interface IUserSchema {
  username: String;
  password?: String;
  hash?: String;
  salt?: String;
  balance?: mongoose.Types.Decimal128;
  admin?: boolean;
}

interface IUserModel extends mongoose.Model<UserDocument> {
  build(attrs: IUserSchema): UserDocument;
  register(user: UserDocument, password: String): Promise<UserDocument | null>;
  authenticate(
    user: IUserSchema,
    password: String
  ): Promise<UserDocument | null>;
}

export interface UserDocument extends mongoose.Document {
  username: String;
  balance?: String;
  admin?: String;
}

const User = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  hash: {
    type: String,
    required: true,
  },
  salt: {
    type: String,
    required: true,
  },
  balance: {
    type: mongoose.Types.Decimal128,
    required: true,
  },
  admin: {
    type: Boolean,
    default: false,
  },
});

User.statics.build = (attrs: IUserSchema) => {
  return new Model(attrs);
};

User.statics.register = async (user: IUserSchema, password) => {
  if (await Model.findOne({ username: user.username })) return null;
  const salt = crypto.randomBytes(64).toString("hex");
  const hash = crypto
    .createHmac("sha256", process.env.SECRETKEY!)
    .update(password + salt)
    .digest("hex");

  const document = {
    username: user.username,
    salt: salt,
    hash: hash,
    balance: 0,
    admin: false,
  };
  return new Model(document).save();
};

User.statics.authenticate = async (user: IUserSchema) => {
  const foundUser = (await Model.findOne({
    username: user.username,
  })) as IUserSchema;
  if (!foundUser) return null;
  const hash = crypto
    .createHmac("sha256", process.env.SECRETKEY!)
    .update(`${user.password}${foundUser.salt}`)
    .digest("hex");
  if (hash !== foundUser.hash) {
    return null;
  } else {
    return foundUser as UserDocument;
  }
};

const Model = mongoose.model<UserDocument, IUserModel>("User", User);

export default Model;
