import { NextFunction, Request, Response } from "express";
import { CustomError } from "../models/CustomError";

export function errorHandler(
  err: TypeError | CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  let customError = err;
  if (!(err instanceof CustomError)) {
    customError = new CustomError(err.message);
  }
  res.status((customError as CustomError).status).send(customError);
}