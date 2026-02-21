export class BadRequestError extends Error {
  readonly statusCode = 400 as const;

  constructor(message: string) {
    super(message);
    this.name = 'BadRequestError';
  }
}
