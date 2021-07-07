export class CustomError extends Error {
  status: number;
  additionalInfo?: any;

  constructor(message: string, status: number = 500, additionalInfo: any = {}) {
    super(message);
    this.status = status;
    this.additionalInfo = additionalInfo;
  }
}
