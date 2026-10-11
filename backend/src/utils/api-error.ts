export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);

    this.name = "ApiError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
