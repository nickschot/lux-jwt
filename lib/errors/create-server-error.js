export default function createServerError(Target, statusCode) {
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
