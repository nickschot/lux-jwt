class UnauthorizedError extends Error {
  constructor(message){
    super(message);

    return this;
  }
}

export default createServerError(UnauthorizedError, 401);

function createServerError(Target, statusCode) {
    const ServerError = class extends Target {
      statusCode;

      constructor(...args) {
        super(...args);
        this.statusCode = statusCode;
      }
    };

    Reflect.defineProperty(ServerError, 'name', {
      value: Target.name
    });

    return ServerError;
}
