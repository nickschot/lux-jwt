import createServerError from './create-server-error';

class UnauthorizedError extends Error {
  constructor(message) {
    super(message);

    return this;
  }
}

export default createServerError(UnauthorizedError, 401);
